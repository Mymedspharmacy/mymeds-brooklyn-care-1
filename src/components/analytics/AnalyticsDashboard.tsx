import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from 'lucide-react';
import { Chart } from '@/components/ui/chart';

interface AnalyticsData {
  orders: any[];
  revenue: any[];
  customers: any[];
  products: any[];
  monthlyStats: any[];
  topProducts: any[];
  customerSegments: any[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function AnalyticsDashboard({ data, timeRange, onTimeRangeChange }: AnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Calculate KPIs
  const totalRevenue = data.revenue.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = data.orders.length;
  const totalCustomers = data.customers.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const revenueGrowth = data.revenue.length > 1 
    ? ((data.revenue[data.revenue.length - 1].value - data.revenue[data.revenue.length - 2].value) / data.revenue[data.revenue.length - 2].value) * 100 
    : 0;

  const orderGrowth = data.orders.length > 1 
    ? ((data.orders[data.orders.length - 1]?.total || 0) - (data.orders[data.orders.length - 2]?.total || 0)) / (data.orders[data.orders.length - 2]?.total || 1) * 100 
    : 0;

  const COLORS = ['#376f6b', '#57bbb6', '#2e8f88', '#31968a', '#ff6b6b', '#4ecdc4'];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#376F6B]">Analytics Dashboard</h2>
          <p className="text-[#57BBB6]">Track your business performance and insights</p>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center space-x-2">
              {orderGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${orderGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {orderGrowth >= 0 ? '+' : ''}{orderGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Package className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart>
              <LineChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#376f6b" 
                  strokeWidth={3}
                  dot={{ fill: '#376f6b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#376f6b', strokeWidth: 2 }}
                />
              </LineChart>
            </Chart>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart>
              <AreaChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#57bbb6" 
                  fill="#57bbb6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </Chart>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart>
              <BarChart data={data.topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="sales" fill="#2e8f88" radius={[0, 4, 4, 0]} />
              </BarChart>
            </Chart>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart>
              <PieChart>
                <Pie
                  data={data.customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </Chart>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand">12.5%</div>
            <p className="text-sm text-[#57BBB6]">Website visitors to customers</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Target: 15%</span>
                <span className="text-green-500">+2.5%</span>
              </div>
              <div className="w-full bg-[#57BBB6]/20 rounded-full h-2 mt-2">
                <div className="bg-[#376F6B] h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand">78%</div>
            <p className="text-sm text-[#57BBB6]">Repeat customers</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Target: 80%</span>
                <span className="text-green-500">+3%</span>
              </div>
              <div className="w-full bg-[#57BBB6]/20 rounded-full h-2 mt-2">
                <div className="bg-[#376F6B] h-2 rounded-full" style={{ width: '97.5%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand">2.3h</div>
            <p className="text-sm text-[#57BBB6]">Customer support response</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Target: 4h</span>
                <span className="text-green-500">-1.7h</span>
              </div>
              <div className="w-full bg-[#57BBB6]/20 rounded-full h-2 mt-2">
                <div className="bg-[#376F6B] h-2 rounded-full" style={{ width: '57.5%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 