import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data - in a real app, this would come from your backend
const mockCustomers = Array.from({ length: 50 }, (_, i) => ({
  id: `C${1000 + i}`,
  transactionVolume: Math.random() * 5000000,
  successRate: 85 + Math.random() * 15,
  churnProbability: Math.random(),
  npsScore: Math.floor(Math.random() * 10) + 1,
  contractType: Math.random() > 0.5 ? "Annual" : "Monthly",
  users: Math.floor(Math.random() * 200) + 1,
  lastTransaction: Math.floor(Math.random() * 30) + 1,
}));

const Customers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);

  const getRiskLevel = (probability: number) => {
    if (probability < 0.3) return { label: "Low", variant: "success" as const };
    if (probability < 0.6) return { label: "Medium", variant: "warning" as const };
    return { label: "High", variant: "destructive" as const };
  };

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch = customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const risk = getRiskLevel(customer.churnProbability);
    const matchesFilter =
      filterRisk === "all" || risk.label.toLowerCase() === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    const csvContent = [
      ["Customer ID", "Transaction Volume", "Success Rate", "NPS Score", "Contract Type", "Churn Risk"],
      ...filteredCustomers.map(c => [
        c.id,
        c.transactionVolume.toFixed(2),
        c.successRate.toFixed(2),
        c.npsScore,
        c.contractType,
        (c.churnProbability * 100).toFixed(2) + "%"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredCustomers.length} customers to CSV`,
    });
  };

  const handleViewCustomer = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-2">
            Manage and analyze customer data
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Transaction Volume</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>NPS Score</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Churn Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.slice(0, 20).map((customer) => {
                  const risk = getRiskLevel(customer.churnProbability);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.id}</TableCell>
                      <TableCell>
                        ${customer.transactionVolume.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell>{customer.successRate.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={customer.npsScore >= 7 ? "success" : "secondary"}>
                          {customer.npsScore}/10
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.contractType}</TableCell>
                      <TableCell>
                        <Badge variant={risk.variant}>{risk.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {customer.churnProbability > 0.6 ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {Math.min(20, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete profile for {selectedCustomer?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                  <p className="text-lg font-semibold">{selectedCustomer.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Churn Risk</p>
                  <Badge variant={getRiskLevel(selectedCustomer.churnProbability).variant}>
                    {getRiskLevel(selectedCustomer.churnProbability).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction Volume</p>
                  <p className="text-lg font-semibold">
                    ${selectedCustomer.transactionVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-semibold">{selectedCustomer.successRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                  <p className="text-lg font-semibold">{selectedCustomer.npsScore}/10</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contract Type</p>
                  <p className="text-lg font-semibold">{selectedCustomer.contractType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Number of Users</p>
                  <p className="text-lg font-semibold">{selectedCustomer.users}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Days Since Last Transaction</p>
                  <p className="text-lg font-semibold">{selectedCustomer.lastTransaction} days</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Churn Probability</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk Level</span>
                    <span className="font-semibold">{(selectedCustomer.churnProbability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedCustomer.churnProbability > 0.6
                          ? "bg-destructive"
                          : selectedCustomer.churnProbability > 0.3
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                      style={{ width: `${selectedCustomer.churnProbability * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
