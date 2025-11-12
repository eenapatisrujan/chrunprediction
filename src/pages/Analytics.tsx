import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";

const Analytics = () => {
  const churnByContractType = [
    { name: "Annual", churned: 15, retained: 85 },
    { name: "Monthly", churned: 35, retained: 65 },
  ];

  const churnByNPS = [
    { score: "1-3", rate: 65 },
    { score: "4-6", rate: 35 },
    { score: "7-8", rate: 15 },
    { score: "9-10", rate: 5 },
  ];

  const volumeDistribution = [
    { name: "Low (<100K)", value: 30, color: "#8b5cf6" },
    { name: "Medium (100K-750K)", value: 50, color: "#22c55e" },
    { name: "High (>750K)", value: 20, color: "#eab308" },
  ];

  const featureAdoptionTrend = [
    { month: "Jan", adoption: 45 },
    { month: "Feb", adoption: 48 },
    { month: "Mar", adoption: 51 },
    { month: "Apr", adoption: 52 },
    { month: "May", adoption: 54 },
    { month: "Jun", adoption: 53 },
  ];

  const supportTicketCorrelation = [
    { tickets: "0-5", churnRate: 10 },
    { tickets: "6-10", churnRate: 18 },
    { tickets: "11-15", churnRate: 28 },
    { tickets: "16-20", churnRate: 42 },
    { tickets: "21+", churnRate: 58 },
  ];

  const COLORS = ["#8b5cf6", "#22c55e", "#eab308", "#ef4444", "#3b82f6"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Detailed insights and visualizations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Churn Rate by Contract Type</CardTitle>
            <CardDescription>
              Annual contracts show significantly lower churn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={churnByContractType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar dataKey="churned" fill="#ef4444" name="Churned (%)" />
                <Bar dataKey="retained" fill="#22c55e" name="Retained (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Volume Distribution</CardTitle>
            <CardDescription>
              Distribution across transaction volume segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={volumeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn Rate by NPS Score</CardTitle>
            <CardDescription>
              Strong inverse correlation between NPS and churn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={churnByNPS}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="score" className="text-sm" />
                <YAxis className="text-sm" label={{ value: "Churn Rate (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Adoption Trend</CardTitle>
            <CardDescription>
              Monthly feature adoption rate over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={featureAdoptionTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line type="monotone" dataKey="adoption" stroke="#22c55e" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets vs Churn Correlation</CardTitle>
          <CardDescription>
            Higher ticket count strongly correlates with increased churn risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={supportTicketCorrelation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-sm" label={{ value: "Churn Rate (%)", position: "insideBottom" }} />
              <YAxis dataKey="tickets" type="category" className="text-sm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="churnRate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Key Finding #1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Customers with <span className="font-semibold text-foreground">NPS score 8+</span> have a <span className="font-semibold text-success">98% retention rate</span>, compared to 35% for scores below 4.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Key Finding #2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Annual contracts reduce churn by <span className="font-semibold text-success">57%</span> compared to monthly contracts across all customer segments.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Key Finding #3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Support ticket count over 15 correlates with <span className="font-semibold text-destructive">42% higher churn risk</span>, indicating service issues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
