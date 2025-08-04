import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Users, Star, Settings, 
  CheckCircle, XCircle, Search, Calendar, 
  TrendingUp, LogOut, Bell, Link, 
  Pill, RefreshCw, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '../lib/api';
import railwayAuth from '../lib/railwayAuth';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'refills', label: 'Refill Requests', icon: Pill },
  { id: 'transfers', label: 'Transfer Requests', icon: RefreshCw },
  { id: 'contacts', label: 'Contact Requests', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integration', label: 'Integration', icon: Link },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'success' });
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Data states
  const [orders, setOrders] = useState([]);
  const [refillRequests, setRefillRequests] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0, pendingOrders: 0,
    totalRefills: 0, pendingRefills: 0,
    totalTransfers: 0, pendingTransfers: 0,
    totalContacts: 0, unreadContacts: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    if (!railwayAuth.isAuthenticated()) {
      navigate('/admin-signin');
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!checkingAuth) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [checkingAuth]);

  async function fetchDashboardData() {
    try {
      await Promise.all([
        fetchOrders(), fetchRefillRequests(), fetchTransferRequests(),
        fetchContacts(), fetchNotifications()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  async function fetchOrders() {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
      setStats(prev => ({
        ...prev,
        totalOrders: response.data.length,
        pendingOrders: response.data.filter((o: any) => o.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  async function fetchRefillRequests() {
    try {
      const response = await api.get('/refill-requests');
      setRefillRequests(response.data);
      setStats(prev => ({
        ...prev,
        totalRefills: response.data.length,
        pendingRefills: response.data.filter((r: any) => r.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching refill requests:', error);
    }
  }

  async function fetchTransferRequests() {
    try {
      const response = await api.get('/transfer-requests');
      setTransferRequests(response.data);
      setStats(prev => ({
        ...prev,
        totalTransfers: response.data.length,
        pendingTransfers: response.data.filter((t: any) => t.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
    }
  }

  async function fetchContacts() {
    try {
      const response = await api.get('/contact');
      setContacts(response.data);
      setStats(prev => ({
        ...prev,
        totalContacts: response.data.length,
        unreadContacts: response.data.filter((c: any) => !c.notified).length
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  async function fetchNotifications() {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setStats(prev => ({
        ...prev,
        unreadNotifications: response.data.filter((n: any) => !n.read).length
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  async function logout() {
    try {
      await railwayAuth.logout();
      navigate('/admin-signin');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin-signin');
    }
  }

  function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: 'success' }), 3000);
  }

  async function updateOrderStatus(id: number, status: string) {
    try {
      await api.put(`/orders/${id}`, { status });
      showToastMessage('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showToastMessage('Failed to update order status', 'error');
    }
  }

  async function updateRefillStatus(id: number, status: string) {
    try {
      await api.put(`/refill-requests/${id}`, { status });
      showToastMessage('Refill request status updated successfully');
      fetchRefillRequests();
    } catch (error) {
      console.error('Error updating refill status:', error);
      showToastMessage('Failed to update refill status', 'error');
    }
  }

  async function updateTransferStatus(id: number, status: string) {
    try {
      await api.put(`/transfer-requests/${id}`, { status });
      showToastMessage('Transfer request status updated successfully');
      fetchTransferRequests();
    } catch (error) {
      console.error('Error updating transfer status:', error);
      showToastMessage('Failed to update transfer status', 'error');
    }
  }

  async function markNotificationRead(id: number) {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  function getStatusBadge(status: string) {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      urgent: 'bg-red-100 text-red-800',
      normal: 'bg-gray-100 text-gray-800',
      read: 'bg-green-100 text-green-800',
      unread: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">MyMeds Pharmacy Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {stats.unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                      {stats.unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowLogoutConfirm(true)}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-8 h-auto bg-transparent">
              {TABS.map((tabItem) => (
                <TabsTrigger
                  key={tabItem.id}
                  value={tabItem.id}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md data-[state=active]:bg-brand data-[state=active]:text-white"
                >
                  <tabItem.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tabItem.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingOrders} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Refill Requests</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRefills}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingRefills} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transfer Requests</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransfers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingTransfers} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContacts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.unreadContacts} unread
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status)}
                          <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                          )}
                          <span className="text-sm text-gray-500">{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders
                        .filter((order: any) => 
                          order.id.toString().includes(searchTerm) ||
                          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>{order.user?.name || 'N/A'}</TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  disabled={order.status === 'completed'}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  disabled={order.status === 'cancelled'}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refill Requests Tab */}
          <TabsContent value="refills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Refill Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refillRequests.map((refill: any) => (
                      <TableRow key={refill.id}>
                        <TableCell>#{refill.id}</TableCell>
                        <TableCell>{refill.user?.name || 'N/A'}</TableCell>
                        <TableCell>{refill.medication}</TableCell>
                        <TableCell>{refill.dosage}</TableCell>
                        <TableCell>{getStatusBadge(refill.urgency)}</TableCell>
                        <TableCell>{getStatusBadge(refill.status)}</TableCell>
                        <TableCell>{formatDate(refill.requestedDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRefillStatus(refill.id, 'approved')}
                              disabled={refill.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRefillStatus(refill.id, 'completed')}
                              disabled={refill.status === 'completed'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfer Requests Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Transfer Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>From Pharmacy</TableHead>
                      <TableHead>Medications</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferRequests.map((transfer: any) => (
                      <TableRow key={transfer.id}>
                        <TableCell>#{transfer.id}</TableCell>
                        <TableCell>{transfer.user?.name || 'N/A'}</TableCell>
                        <TableCell>{transfer.currentPharmacy}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {Array.isArray(transfer.medications) 
                              ? transfer.medications.join(', ')
                              : transfer.medications
                            }
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell>{formatDate(transfer.requestedDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTransferStatus(transfer.id, 'approved')}
                              disabled={transfer.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTransferStatus(transfer.id, 'completed')}
                              disabled={transfer.status === 'completed'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Requests Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Form Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact: any) => (
                      <TableRow key={contact.id}>
                        <TableCell>#{contact.id}</TableCell>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{contact.message}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contact.notified ? 'read' : 'unread')}
                        </TableCell>
                        <TableCell>{formatDate(contact.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification: any) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <Badge variant="outline">{notification.type}</Badge>
                        </TableCell>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{notification.message}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(notification.read ? 'read' : 'unread')}
                        </TableCell>
                        <TableCell>{formatDate(notification.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markNotificationRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="h-5 w-5" />
                    <span>WooCommerce Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className="bg-red-100 text-red-800">Disconnected</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Store URL</span>
                      <span className="text-sm font-medium">Not configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium">Never</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Link className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Products
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="h-5 w-5" />
                    <span>WordPress Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className="bg-red-100 text-red-800">Disconnected</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Site URL</span>
                      <span className="text-sm font-medium">Not configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium">Never</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Link className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Posts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Site Name</label>
                      <Input defaultValue="MyMeds Pharmacy" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input defaultValue="contact@mymedspharmacy.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Phone</label>
                      <Input defaultValue="(555) 123-4567" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Business Hours</label>
                      <Input defaultValue="Mon-Fri: 9AM-6PM, Sat: 9AM-4PM" />
                    </div>
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={logout}>
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
          showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {showToast.message}
        </div>
      )}
    </div>
  );
} 