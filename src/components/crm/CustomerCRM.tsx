import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, UserPlus, Star, TrendingUp, DollarSign, 
  Calendar, MapPin, Phone, Mail, MessageSquare,
  ShoppingCart, Heart, Crown, Filter, Search,
  Edit, Trash2, Eye, Plus, BarChart3, Download
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  segment: 'new' | 'returning' | 'vip' | 'loyal';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  firstOrderDate: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  tags: string[];
  healthScore: number;
}

interface CustomerCRMProps {
  customers: Customer[];
  onUpdateCustomer: (id: number, data: Partial<Customer>) => Promise<void>;
  onDeleteCustomer: (id: number) => Promise<void>;
  onAddCustomer: (data: Omit<Customer, 'id'>) => Promise<void>;
}

export function CustomerCRM({
  customers,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddCustomer
}: CustomerCRMProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'analytics' | 'segments'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});

  // Calculate CRM metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const vipCustomers = customers.filter(c => c.segment === 'vip').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const avgOrdersPerCustomer = totalCustomers > 0 ? 
    customers.reduce((sum, c) => sum + c.totalOrders, 0) / totalCustomers : 0;

  const filteredCustomers = customers.filter(customer => {
    if (searchTerm && !customer.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !customer.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (segmentFilter !== 'all' && customer.segment !== segmentFilter) return false;
    if (statusFilter !== 'all' && customer.status !== statusFilter) return false;
    return true;
  });

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'loyal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'returning': return 'bg-green-100 text-green-800 border-green-200';
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.email) {
      await onAddCustomer(newCustomer as Omit<Customer, 'id'>);
      setNewCustomer({});
      setShowAddCustomer(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Relationship Management</h2>
          <p className="text-gray-600">Manage customer profiles, segments, and relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAddCustomer(true)}
            className="text-brand hover:text-brand-dark"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {activeCustomers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Premium segment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOrdersPerCustomer.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'segments', label: 'Segments', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Search</label>
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Segment</label>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      <SelectItem value="new">New Customers</SelectItem>
                      <SelectItem value="returning">Returning Customers</SelectItem>
                      <SelectItem value="loyal">Loyal Customers</SelectItem>
                      <SelectItem value="vip">VIP Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Health Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-xs text-gray-400">
                            Member since {formatDate(customer.firstOrderDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.phone}</div>
                          <div className="text-sm text-gray-500">{customer.city}, {customer.state}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSegmentColor(customer.segment)}>
                          {customer.segment.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{customer.totalOrders}</div>
                          <div className="text-xs text-gray-500">
                            {customer.lastOrderDate ? `Last: ${formatDate(customer.lastOrderDate)}` : 'No orders'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getHealthScoreColor(customer.healthScore)}`}>
                          {customer.healthScore}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className={`h-1 rounded-full ${
                              customer.healthScore >= 80 ? 'bg-green-500' :
                              customer.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${customer.healthScore}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: 'VIP', count: vipCustomers, color: 'bg-purple-100 text-purple-800' },
                    { segment: 'Loyal', count: customers.filter(c => c.segment === 'loyal').length, color: 'bg-blue-100 text-blue-800' },
                    { segment: 'Returning', count: customers.filter(c => c.segment === 'returning').length, color: 'bg-green-100 text-green-800' },
                    { segment: 'New', count: customers.filter(c => c.segment === 'new').length, color: 'bg-yellow-100 text-yellow-800' }
                  ].map((item) => (
                    <div key={item.segment} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.segment}</span>
                      <Badge className={item.color}>
                        {item.count} customers
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: 'VIP', revenue: customers.filter(c => c.segment === 'vip').reduce((sum, c) => sum + c.totalSpent, 0) },
                    { segment: 'Loyal', revenue: customers.filter(c => c.segment === 'loyal').reduce((sum, c) => sum + c.totalSpent, 0) },
                    { segment: 'Returning', revenue: customers.filter(c => c.segment === 'returning').reduce((sum, c) => sum + c.totalSpent, 0) },
                    { segment: 'New', revenue: customers.filter(c => c.segment === 'new').reduce((sum, c) => sum + c.totalSpent, 0) }
                  ].map((item) => (
                    <div key={item.segment} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.segment}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Health Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {customers.filter(c => c.healthScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-600">Excellent (80%+)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {customers.filter(c => c.healthScore >= 60 && c.healthScore < 80).length}
                  </div>
                  <div className="text-sm text-gray-600">Good (60-79%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {customers.filter(c => c.healthScore < 60).length}
                  </div>
                                      <div className="text-sm text-gray-600">At Risk (&lt;60%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                segment: 'VIP', 
                icon: Crown, 
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                count: vipCustomers,
                description: 'High-value customers with premium service'
              },
              { 
                segment: 'Loyal', 
                icon: Heart, 
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                count: customers.filter(c => c.segment === 'loyal').length,
                description: 'Regular customers with good engagement'
              },
              { 
                segment: 'Returning', 
                icon: TrendingUp, 
                color: 'bg-green-100 text-green-800 border-green-200',
                count: customers.filter(c => c.segment === 'returning').length,
                description: 'Customers with multiple purchases'
              },
              { 
                segment: 'New', 
                icon: UserPlus, 
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                count: customers.filter(c => c.segment === 'new').length,
                description: 'First-time customers'
              }
            ].map((item) => (
              <Card key={item.segment}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.segment}</CardTitle>
                  <item.icon className="h-4 w-4 text-brand" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-2">
                    <Badge className={item.color}>
                      {item.segment}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={newCustomer.name || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newCustomer.email || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newCustomer.phone || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Segment</label>
                <Select onValueChange={(value) => setNewCustomer({ ...newCustomer, segment: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Customer</SelectItem>
                    <SelectItem value="returning">Returning Customer</SelectItem>
                    <SelectItem value="loyal">Loyal Customer</SelectItem>
                    <SelectItem value="vip">VIP Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={newCustomer.city || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  value={newCustomer.state || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  value={newCustomer.zipCode || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                  placeholder="Enter ZIP"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomer} className="bg-brand hover:bg-brand-dark">
                Add Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 