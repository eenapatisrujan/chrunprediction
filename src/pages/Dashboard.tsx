import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, AlertTriangle, DollarSign, Activity, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Dashboard = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing Data",
      description: "Updating dashboard metrics...",
    });
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Updated",
        description: "All metrics have been refreshed",
      });
    }, 1500);
  };

  const metrics = [
    {
      title: "Total Customers",
      value: "70,000",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Churn Rate",
      value: "24.44%",
      change: "-3.2%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Transaction Volume",
      value: "$808.6K",
      change: "+1.8%",
      trend: "up",
      icon: DollarSign,
      color: "text-success",
    },
  ];

  const churnRiskSegments = [
    { label: "Low Risk", value: 30, color: "bg-success" },
    { label: "Medium Risk", value: 50, color: "bg-warning" },
    { label: "High Risk", value: 20, color: "bg-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Customer churn analytics and predictions overview
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span>{metric.change} from last quarter</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Churn Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {churnRiskSegments.map((segment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{segment.label}</span>
                  <span className="text-muted-foreground">{segment.value}%</span>
                </div>
                <Progress value={segment.value} className={segment.color} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/10">
              <div className="h-2 w-2 rounded-full bg-success mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">High engagement customers</p>
                <p className="text-xs text-muted-foreground">
                  Customers with NPS score 8+ show 98% retention
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-warning/10">
              <div className="h-2 w-2 rounded-full bg-warning mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Support ticket correlation</p>
                <p className="text-xs text-muted-foreground">
                  High ticket count correlates with 40% churn increase
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-primary/10">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Model accuracy</p>
                <p className="text-xs text-muted-foreground">
                  Random Forest model achieves 81.3% ROC-AUC score
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$808.6K</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per customer (90 days)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">53.7%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22.8 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              Support ticket resolution
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
