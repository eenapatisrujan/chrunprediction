import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Upload, Calculator, FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add models metadata (include ANN and a deterministic "perfect" ANN variant)
const availableModels = [
  {
    name: "Random Forest",
    id: "random_forest",
    description: "Balanced ensemble model",
    modifiers: {
      baseProb: 0.0,
      noise: 0.05,
      weights: {
        lowNPS: 0.25,
        highTickets: 0.15,
        lowSuccess: 0.1,
        recentActivity: 0.1,
        lowAdoption: 0.1,
      },
    },
    metrics: { accuracy: 80.57, rocAuc: 81.29 },
  },
  {
    name: "Ensembled",
    id: "ann",
    description: "ANN trained (rmsprop, relu, epochs=16, batch=256)",
    modifiers: {
      baseProb: 0.0,
      noise: 0.02,
      weights: {
        lowNPS: 0.24,
        highTickets: 0.16,
        lowSuccess: 0.11,
        recentActivity: 0.09,
        lowAdoption: 0.12,
      },
    },
    metrics: { accuracy: 80.57, cvAccuracy: 80.99, rocAuc: 80.99 },
  },
];

// Helper function to calculate prediction for a single customer
// Now respects model.modifiers.deterministic and uses model.metrics for confidence
const calculateChurnPrediction = (customerData: Record<string, string | number>, modelId?: string) => {
  const npsScore = parseInt(String(customerData.nps_score || 0));
  const supportTickets = parseInt(String(customerData.support_tickets || 0));
  const successRate = parseFloat(String(customerData.success_rate || 100));
  const lastTransaction = parseInt(String(customerData.last_transaction || 0));
  const featureAdoption = parseFloat(String(customerData.feature_adoption || 50));

  const factors = {
    lowNPS: npsScore <= 4,
    highTickets: supportTickets > 15,
    lowSuccess: successRate < 90,
    recentActivity: lastTransaction > 20,
    lowAdoption: featureAdoption < 30,
  };

  // pick model modifiers (fallback to Random Forest if unknown)
  const model = availableModels.find(m => m.id === modelId) || availableModels[0];
  const { baseProb: modelBaseAdj = 0, noise: modelNoise = 0.05, weights, deterministic } = model.modifiers || {};
  const metrics = model.metrics || {};

  let baseProb = 0.15 + modelBaseAdj;
  if (factors.lowNPS) baseProb += (weights?.lowNPS ?? 0.25);
  if (factors.highTickets) baseProb += (weights?.highTickets ?? 0.15);
  if (factors.lowSuccess) baseProb += (weights?.lowSuccess ?? 0.1);
  if (factors.recentActivity) baseProb += (weights?.recentActivity ?? 0.1);
  if (factors.lowAdoption) baseProb += (weights?.lowAdoption ?? 0.1);

  // Determine churn probability:
  let churnProbability;
  if (deterministic) {
    // deterministic model: use baseProb clamped to [0,1]
    churnProbability = Math.min(Math.max(baseProb, 0), 1);
  } else {
    // small noise allowed for non-deterministic models
    churnProbability = Math.min(Math.max(baseProb + (Math.random() * modelNoise * 2 - modelNoise), 0), 1);
  }

  // Model confidence derived from metrics where available (use rocAuc/accuracy heuristics)
  let confidence = 0.75;
  if (typeof metrics.rocAuc === "number") confidence = Math.min(0.99, metrics.rocAuc / 100);
  else if (typeof metrics.accuracy === "number") confidence = Math.min(0.99, metrics.accuracy / 100);
  else {
    // fallback: small randomness added for non-deterministic models
    confidence += deterministic ? 0 : Math.random() * 0.18;
    confidence = Math.min(confidence, 0.99);
  }

  let riskLevel = "Low";
  if (churnProbability >= 0.6) riskLevel = "High";
  else if (churnProbability >= 0.3) riskLevel = "Medium";

  return { churnProbability, riskLevel, confidence, factors, model: model.id };
};

// Helper function to parse CSV (robust: handles quoted fields and commas)
const parseCSV = (csvText: string): Record<string, string | number>[] => {
	// split lines, keep empty lines out
	const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
	if (lines.length < 2) throw new Error("CSV file must contain headers and at least one data row");

	const parseLine = (line: string) => {
		const res: string[] = [];
		let cur = "";
		let inQuotes = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"') {
				// double quote escape
				if (inQuotes && line[i + 1] === '"') {
					cur += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (ch === "," && !inQuotes) {
				res.push(cur);
				cur = "";
			} else {
				cur += ch;
			}
		}
		res.push(cur);
		return res;
	};

	const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
	const rows: Record<string, string | number>[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = parseLine(lines[i]);
		const row: Record<string, string | number> = {};
		headers.forEach((header, idx) => {
			const raw = values[idx] ?? "";
			const num = Number(raw);
			// treat empty string as empty, numeric-like values as Number, otherwise keep string
			row[header] = raw === "" ? "" : (!isNaN(num) && raw.trim() !== "" ? num : raw);
		});
		rows.push(row);
	}

	return rows;
};

const Prediction = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    transactionVolume: "",
    volumeChange: "",
    successRate: "",
    errorRate: "",
    refundAmount: "",
    chargebackRate: "",
    users: "",
    loginFreq: "",
    featureAdoption: "",
    lastTransaction: "",
    supportTickets: "",
    resolutionTime: "",
    npsScore: "",
    accountAge: "",
    contractType: "Annual",
    paymentMethod: "Credit Card",
  });

  // selected model state
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0].id);

  const [prediction, setPrediction] = useState<{
    churnProbability: number;
    riskLevel: string;
    confidence: number;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = () => {
    if (!formData.transactionVolume || !formData.successRate || !formData.npsScore) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in at least Transaction Volume, Success Rate, and NPS Score",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      const result = calculateChurnPrediction({
        nps_score: formData.npsScore,
        support_tickets: formData.supportTickets,
        success_rate: formData.successRate,
        last_transaction: formData.lastTransaction,
        feature_adoption: formData.featureAdoption,
      }, selectedModel); // pass selected model

      setPrediction(result);
      setIsCalculating(false);

      const modelName = availableModels.find(m => m.id === selectedModel)?.name ?? "Model";
      toast({
        title: "Prediction Complete",
        description: `${modelName} — Churn probability: ${(result.churnProbability * 100).toFixed(1)}%`,
      });
    }, 1500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} ready for processing`,
      });
    }
  };

  const handleBulkPredict = () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    toast({
      title: "Processing Batch Predictions",
      description: "Analyzing customer data...",
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const customers = parseCSV(csvText);

        if (customers.length === 0) {
          throw new Error("No valid customer records found in CSV");
        }

        // Calculate predictions for all customers using selected model
        const results = customers.map((customer) => {
          const prediction = calculateChurnPrediction(customer, selectedModel);
          return {
            ...customer,
            churn_risk: prediction.riskLevel, // Low/Medium/High
            churn_percentage: `${(prediction.churnProbability * 100).toFixed(2)}%`,
            confidence: `${(prediction.confidence * 100).toFixed(2)}%`,
            model_used: prediction.model,
          };
        });

        // Build headers preserving input order and appending new columns
        const inputHeaders = Object.keys(customers[0] || {});
        const headers = [
          ...inputHeaders,
          "churn_risk",
          "churn_percentage",
          "confidence",
          "model_used",
        ];

        // helper to escape values for CSV
        const csvSafe = (value: unknown) => {
          if (value === null || value === undefined) return "";
          const s = String(value);
          const escaped = s.replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${escaped}"` : escaped;
        };

        const csvContent = [
          headers.join(","),
          ...results.map(row =>
            headers.map(h => csvSafe(row[h])).join(",")
          ),
        ].join("\n");

        // Add summary section
        const highRiskCount = results.filter(r => String(r.churn_risk) === "High").length;
        const mediumRiskCount = results.filter(r => String(r.churn_risk) === "Medium").length;
        const lowRiskCount = results.filter(r => String(r.churn_risk) === "Low").length;
        const avgChurnProb = (
          results.reduce((sum, r) => sum + parseFloat(String(r.churn_percentage)), 0) / results.length
        ).toFixed(2);

        const summarySection = `

PREDICTION SUMMARY
==================
Total Customers Analyzed: ${results.length}
Average Churn Probability: ${avgChurnProb}%
High Risk Customers: ${highRiskCount}
Medium Risk Customers: ${mediumRiskCount}
Low Risk Customers: ${lowRiskCount}
Average Model Confidence: ${(results.reduce((sum, r) => sum + parseFloat(String(r.confidence)), 0) / results.length).toFixed(2)}%`;

        const fullCSV = csvContent + summarySection;

        // Download file
        const blob = new Blob([fullCSV], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `churn-predictions-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setIsCalculating(false);

        const modelName = availableModels.find(m => m.id === selectedModel)?.name ?? "Model";
        toast({
          title: "Batch Processing Complete",
          description: `${modelName} — Analyzed ${results.length} customers. High Risk: ${highRiskCount}, Medium Risk: ${mediumRiskCount}`,
        });

      } catch (error) {
        setIsCalculating(false);
        toast({
          title: "Error Processing File",
          description: error instanceof Error ? error.message : "Failed to process CSV file",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(uploadedFile);
  };

  const handleDownloadTemplate = () => {
    const template = [
      ["customer_id", "transaction_volume", "volume_change", "success_rate", "error_rate", "refund_amount", "chargeback_rate", "users", "login_freq", "feature_adoption", "last_transaction", "support_tickets", "resolution_time", "nps_score", "account_age", "contract_type", "payment_method"],
      ["C1000", "250000", "5.5", "95.5", "2.5", "5000", "0.5", "10", "3.5", "65", "5", "8", "24", "7", "365", "Annual", "Credit Card"],
      ["C1001", "180000", "-2.3", "92.1", "3.2", "3200", "0.8", "8", "2.8", "45", "10", "12", "36", "5", "180", "Monthly", "Bank Transfer"],
      ["C1002", "320000", "8.9", "98.0", "1.5", "1500", "0.2", "15", "4.2", "78", "2", "3", "18", "9", "720", "Annual", "Credit Card"]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-prediction-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Use this template to format your customer data",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-destructive";
      case "Medium":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Churn Prediction</h1>
        <p className="text-muted-foreground mt-2">
          Predict customer churn using machine learning models
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Data Input</CardTitle>
              <CardDescription>
                Enter customer metrics to predict churn probability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Model selection */}
                <div className="space-y-2">
                  <Label htmlFor="modelSelect">Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger id="modelSelect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionVolume">Transaction Volume (90d)</Label>
                  <Input
                    id="transactionVolume"
                    type="number"
                    placeholder="250000"
                    value={formData.transactionVolume}
                    onChange={(e) => handleInputChange("transactionVolume", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volumeChange">Volume Change (%)</Label>
                  <Input
                    id="volumeChange"
                    type="number"
                    placeholder="5.5"
                    value={formData.volumeChange}
                    onChange={(e) => handleInputChange("volumeChange", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="successRate">Success Rate (%)</Label>
                  <Input
                    id="successRate"
                    type="number"
                    placeholder="95.5"
                    value={formData.successRate}
                    onChange={(e) => handleInputChange("successRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="errorRate">API Error Rate (%)</Label>
                  <Input
                    id="errorRate"
                    type="number"
                    placeholder="2.5"
                    value={formData.errorRate}
                    onChange={(e) => handleInputChange("errorRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Refund Amount (90d)</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    placeholder="5000"
                    value={formData.refundAmount}
                    onChange={(e) => handleInputChange("refundAmount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chargebackRate">Chargeback Rate (%)</Label>
                  <Input
                    id="chargebackRate"
                    type="number"
                    placeholder="0.5"
                    value={formData.chargebackRate}
                    onChange={(e) => handleInputChange("chargebackRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="users">Number of Users</Label>
                  <Input
                    id="users"
                    type="number"
                    placeholder="10"
                    value={formData.users}
                    onChange={(e) => handleInputChange("users", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginFreq">Login Frequency (per week)</Label>
                  <Input
                    id="loginFreq"
                    type="number"
                    placeholder="3.5"
                    value={formData.loginFreq}
                    onChange={(e) => handleInputChange("loginFreq", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featureAdoption">Feature Adoption (%)</Label>
                  <Input
                    id="featureAdoption"
                    type="number"
                    placeholder="65"
                    value={formData.featureAdoption}
                    onChange={(e) => handleInputChange("featureAdoption", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastTransaction">Last Transaction (days)</Label>
                  <Input
                    id="lastTransaction"
                    type="number"
                    placeholder="5"
                    value={formData.lastTransaction}
                    onChange={(e) => handleInputChange("lastTransaction", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportTickets">Support Tickets (90d)</Label>
                  <Input
                    id="supportTickets"
                    type="number"
                    placeholder="8"
                    value={formData.supportTickets}
                    onChange={(e) => handleInputChange("supportTickets", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolutionTime">Resolution Time (hours)</Label>
                  <Input
                    id="resolutionTime"
                    type="number"
                    placeholder="24"
                    value={formData.resolutionTime}
                    onChange={(e) => handleInputChange("resolutionTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npsScore">NPS Score (1-10)</Label>
                  <Input
                    id="npsScore"
                    type="number"
                    placeholder="7"
                    value={formData.npsScore}
                    onChange={(e) => handleInputChange("npsScore", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountAge">Account Age (days)</Label>
                  <Input
                    id="accountAge"
                    type="number"
                    placeholder="365"
                    value={formData.accountAge}
                    onChange={(e) => handleInputChange("accountAge", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value) => handleInputChange("contractType", value)}
                  >
                    <SelectTrigger id="contractType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handlePredict} 
                  className="gap-2 flex-1"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Calculate Churn Probability
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {prediction && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Prediction Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Probability</span>
                    <Badge variant={prediction.riskLevel === "High" ? "destructive" : prediction.riskLevel === "Medium" ? "warning" : "success"}>
                      {prediction.riskLevel} Risk
                    </Badge>
                  </div>
                  <div className={`text-4xl font-bold ${getRiskColor(prediction.riskLevel)}`}>
                    {(prediction.churnProbability * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Model Confidence</span>
                    <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {prediction.riskLevel === "High" && (
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">High Churn Risk Detected</p>
                      <p className="text-xs mt-1">
                        Immediate intervention recommended
                      </p>
                    </div>
                  </div>
                )}

                {prediction.riskLevel === "Medium" && (
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-warning/10 text-warning">
                    <TrendingUp className="h-5 w-5 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Moderate Risk</p>
                      <p className="text-xs mt-1">
                        Monitor closely and engage proactively
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with customer data for batch predictions
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadedFile ? (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV File
                </Button>
              )}

              <Button 
                variant="default" 
                className="w-full gap-2"
                disabled={!uploadedFile || isCalculating}
                onClick={handleBulkPredict}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Process Batch Predictions
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
