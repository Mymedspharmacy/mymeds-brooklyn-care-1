import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Users, Star, Settings, 
  CheckCircle, XCircle, Search, Calendar, 
  TrendingUp, LogOut, Bell, Link, 
  Pill, RefreshCw, MessageSquare, MapPin
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
  { id: 'delivery-map', label: 'Delivery Map', icon: MapPin },
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
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [deliveryOrders, setDeliveryOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState<any>(null);
  const [showRefillDetails, setShowRefillDetails] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [wooCommerceStatus, setWooCommerceStatus] = useState<any>(null);
  const [wordPressStatus, setWordPressStatus] = useState<any>(null);
  const [settings, setSettings] = useState({
    siteName: 'MyMeds Pharmacy',
    contactEmail: 'contact@mymedspharmacy.com',
    contactPhone: '(555) 123-4567',
    businessHours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM'
  });

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
        fetchContacts(), fetchNotifications(), fetchIntegrationStatus(), fetchSettings()
      ]);
      // Generate delivery orders after fetching orders
      setTimeout(() => generateDeliveryOrders(), 100);
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

  async function fetchIntegrationStatus() {
    try {
      // Fetch WooCommerce status
      const wooResponse = await api.get('/woocommerce/settings');
      setWooCommerceStatus(wooResponse.data);
    } catch (error) {
      console.error('Error fetching WooCommerce status:', error);
      setWooCommerceStatus({ enabled: false });
    }

    try {
      // Fetch WordPress status
      const wpResponse = await api.get('/wordpress/settings');
      setWordPressStatus(wpResponse.data);
    } catch (error) {
      console.error('Error fetching WordPress status:', error);
      setWordPressStatus({ enabled: false });
    }
  }

  async function fetchSettings() {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
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

  // Action button handlers
  async function handleViewContact(contact: any) {
    setSelectedContact(contact);
    setShowContactDialog(true);
  }

  async function handleViewNotification(notification: any) {
    setSelectedNotification(notification);
    setShowNotificationDialog(true);
  }

  async function handleTestWooCommerceConnection() {
    try {
      showToastMessage('Testing WooCommerce connection...', 'success');
      const response = await api.get('/woocommerce/test-connection');
      if (response.data.success) {
        showToastMessage('WooCommerce connection successful', 'success');
      } else {
        showToastMessage('WooCommerce connection failed', 'error');
      }
    } catch (error) {
      console.error('WooCommerce connection test error:', error);
      showToastMessage('Failed to test WooCommerce connection', 'error');
    }
  }

  async function handleSyncWooCommerceProducts() {
    try {
      showToastMessage('Syncing WooCommerce products...', 'success');
      const response = await api.post('/woocommerce/sync-products');
      if (response.data.success) {
        showToastMessage(`Synced ${response.data.count} products successfully`, 'success');
      } else {
        showToastMessage('Failed to sync WooCommerce products', 'error');
      }
    } catch (error) {
      console.error('WooCommerce sync error:', error);
      showToastMessage('Failed to sync WooCommerce products', 'error');
    }
  }

  async function handleTestWordPressConnection() {
    try {
      showToastMessage('Testing WordPress connection...', 'success');
      const response = await api.get('/wordpress/test-connection');
      if (response.data.success) {
        showToastMessage('WordPress connection successful', 'success');
      } else {
        showToastMessage('WordPress connection failed', 'error');
      }
    } catch (error) {
      console.error('WordPress connection test error:', error);
      showToastMessage('Failed to test WordPress connection', 'error');
    }
  }

  async function handleSyncWordPressPosts() {
    try {
      showToastMessage('Syncing WordPress posts...', 'success');
      const response = await api.post('/wordpress/sync-posts');
      if (response.data.success) {
        showToastMessage(`Synced ${response.data.count} posts successfully`, 'success');
      } else {
        showToastMessage('Failed to sync WordPress posts', 'error');
      }
    } catch (error) {
      console.error('WordPress sync error:', error);
      showToastMessage('Failed to sync WordPress posts', 'error');
    }
  }

  async function handleSaveSettings() {
    try {
      showToastMessage('Saving settings...', 'success');
      
      const response = await api.put('/settings', settings);
      if (response.data.success) {
        showToastMessage('Settings saved successfully', 'success');
        // Refresh settings after save
        await fetchSettings();
      } else {
        showToastMessage('Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      showToastMessage('Failed to save settings', 'error');
    }
  }

  // Delivery Map Functions
  function generateDeliveryOrders() {
    // Filter orders that are eligible for delivery (pending or approved)
    const deliveryOrders = orders
      .filter((order: any) => order.status === 'pending' || order.status === 'approved')
      .map((order: any) => ({
        ...order,
        // Use actual delivery address from order or default
        deliveryAddress: order.deliveryAddress || order.user?.address || 'Address not provided',
        // Generate coordinates based on order ID for consistent positioning
        coordinates: generateCoordinatesFromOrderId(order.id),
        // Calculate estimated delivery based on order creation time
        estimatedDelivery: calculateEstimatedDelivery(order.createdAt),
        // Use actual delivery notes or default
        deliveryNotes: order.deliveryNotes || 'Standard delivery'
      }));
    
    setDeliveryOrders(deliveryOrders);
  }

  function generateCoordinatesFromOrderId(orderId: number) {
    // Generate consistent coordinates based on order ID
    // This ensures the same order always appears in the same location
    const baseLat = 40.6782; // Brooklyn center latitude
    const baseLng = -73.9442; // Brooklyn center longitude
    
    // Use order ID to create deterministic but varied positions
    const latVariation = ((orderId * 7) % 100) / 1000 - 0.05; // ±0.05 degrees
    const lngVariation = ((orderId * 11) % 100) / 1000 - 0.05; // ±0.05 degrees
    
    return {
      lat: baseLat + latVariation,
      lng: baseLng + lngVariation
    };
  }

  function calculateEstimatedDelivery(createdAt: string) {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - orderTime.getTime();
    
    // If order is older than 4 hours, set ETA to 1 hour from now
    if (timeDiff > 4 * 60 * 60 * 1000) {
      const eta = new Date(now.getTime() + 60 * 60 * 1000);
      return eta.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Otherwise, set ETA to 2-4 hours from order time
    const hoursToAdd = 2 + (Math.floor(Math.random() * 3)); // 2-4 hours
    const eta = new Date(orderTime.getTime() + hoursToAdd * 60 * 60 * 1000);
    return eta.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  function handleOrderClick(order: any) {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }

  function handleRefillClick(refill: any) {
    setSelectedRefill(refill);
    setShowRefillDetails(true);
  }

  function handleTransferClick(transfer: any) {
    setSelectedTransfer(transfer);
    setShowTransferDetails(true);
  }

  async function updateOrderDeliveryStatus(orderId: number, status: string) {
    try {
      // Update the order status via API
      await updateOrderStatus(orderId, status);
      
      // Update local delivery orders state
      setDeliveryOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status } 
            : order
        )
      );
      
      showToastMessage(`Order #${orderId} status updated to ${status}`, 'success');
    } catch (error) {
      console.error('Error updating delivery status:', error);
      showToastMessage('Failed to update order status', 'error');
    }
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
            <TabsList className="grid w-full grid-cols-9 h-auto bg-transparent">
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
                          <TableRow 
                            key={order.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleOrderClick(order)}
                          >
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOrderStatus(order.id, 'completed');
                                  }}
                                  disabled={order.status === 'completed'}
                                  className="text-green-600 hover:text-green-700"
                                  title="Mark as Completed"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="ml-1 hidden sm:inline">Complete</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOrderStatus(order.id, 'cancelled');
                                  }}
                                  disabled={order.status === 'cancelled'}
                                  className="text-red-600 hover:text-red-700"
                                  title="Cancel Order"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="ml-1 hidden sm:inline">Cancel</span>
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

          {/* Delivery Map Tab */}
          <TabsContent value="delivery-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Delivery Map</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  View and manage delivery orders on an interactive map
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Map Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {deliveryOrders.length} Active Deliveries
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {deliveryOrders.filter((o: any) => o.status === 'approved').length} Approved
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {deliveryOrders.filter((o: any) => o.status === 'pending').length} Pending
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateDeliveryOrders()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Map
                    </Button>
                  </div>

                  {/* Interactive Map */}
                  <div className="relative">
                    <div className="bg-gray-100 rounded-lg overflow-hidden min-h-[500px] relative">
                      {/* Real Map */}
                      <iframe
                        src="https://www.openstreetmap.org/export/embed.html?bbox=-74.1,40.6,-73.8,40.8&layer=mapnik&marker=40.6782,-73.9442"
                        width="100%"
                        height="500"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        title="Brooklyn Delivery Map"
                        className="rounded-lg"
                      />
                      
                      {/* Overlay with Delivery Pins */}
                      <div className="absolute inset-0 pointer-events-none">
                        {deliveryOrders.map((order: any, index: number) => (
                          <div
                            key={order.id}
                            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full pointer-events-auto"
                            style={{
                              left: `${20 + (index * 8) % 80}%`,
                              top: `${30 + (index * 6) % 60}%`,
                            }}
                            onClick={() => handleOrderClick(order)}
                          >
                            {/* Pin */}
                            <div className="relative">
                              <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                                order.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}>
                                <MapPin className="w-4 h-4 text-white" />
                              </div>
                              
                              {/* Order Info Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg border p-3 opacity-0 hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                                <div className="text-xs">
                                  <div className="font-semibold text-gray-900">Order #{order.id}</div>
                                  <div className="text-gray-600">{order.user?.name || 'Customer'}</div>
                                  <div className="text-gray-600">{formatCurrency(order.total)}</div>
                                  <div className="text-gray-600">ETA: {order.estimatedDelivery}</div>
                                  <div className="mt-1">
                                    {getStatusBadge(order.status)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Map Legend */}
                      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                        <div className="text-sm font-semibold mb-2">Legend</div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-xs">Approved Orders</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs">Pending Orders</span>
                          </div>
                        </div>
                      </div>

                      {/* Map Title */}
                      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
                        <div className="text-sm font-semibold text-gray-900">Brooklyn Delivery Area</div>
                        <div className="text-xs text-gray-600">MyMeds Pharmacy Delivery Zone</div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Orders List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pending Deliveries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {deliveryOrders
                            .filter((order: any) => order.status === 'pending')
                            .slice(0, 5)
                            .map((order: any) => (
                              <div 
                                key={order.id} 
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleOrderClick(order)}
                              >
                                <div>
                                  <div className="font-medium">Order #{order.id}</div>
                                  <div className="text-sm text-gray-600">{order.user?.name || 'Customer'}</div>
                                  <div className="text-sm text-gray-500">{order.deliveryAddress}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{formatCurrency(order.total)}</div>
                                  <div className="text-xs text-gray-500">ETA: {order.estimatedDelivery}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Approved Deliveries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {deliveryOrders
                            .filter((order: any) => order.status === 'approved')
                            .slice(0, 5)
                            .map((order: any) => (
                              <div 
                                key={order.id} 
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => handleOrderClick(order)}
                              >
                                <div>
                                  <div className="font-medium">Order #{order.id}</div>
                                  <div className="text-sm text-gray-600">{order.user?.name || 'Customer'}</div>
                                  <div className="text-sm text-gray-500">{order.deliveryAddress}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{formatCurrency(order.total)}</div>
                                  <div className="text-xs text-gray-500">ETA: {order.estimatedDelivery}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                      <TableRow 
                        key={refill.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRefillClick(refill)}
                      >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRefillStatus(refill.id, 'approved');
                              }}
                              disabled={refill.status === 'approved'}
                              className="text-blue-600 hover:text-blue-700"
                              title="Approve Refill"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="ml-1 hidden sm:inline">Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRefillStatus(refill.id, 'completed');
                              }}
                              disabled={refill.status === 'completed'}
                              className="text-green-600 hover:text-green-700"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="ml-1 hidden sm:inline">Complete</span>
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
                      <TableRow 
                        key={transfer.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTransferClick(transfer)}
                      >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTransferStatus(transfer.id, 'approved');
                              }}
                              disabled={transfer.status === 'approved'}
                              className="text-blue-600 hover:text-blue-700"
                              title="Approve Transfer"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="ml-1 hidden sm:inline">Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTransferStatus(transfer.id, 'completed');
                              }}
                              disabled={transfer.status === 'completed'}
                              className="text-green-600 hover:text-green-700"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="ml-1 hidden sm:inline">Complete</span>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewContact(contact)}
                          >
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewNotification(notification)}
                            >
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
                    <Badge className={wooCommerceStatus?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {wooCommerceStatus?.enabled ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Store URL</span>
                      <span className="text-sm font-medium">{wooCommerceStatus?.storeUrl || "Not configured"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium">
                        {wooCommerceStatus?.lastSync ? formatDate(wooCommerceStatus.lastSync) : "Never"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestWooCommerceConnection}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSyncWooCommerceProducts}
                    >
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
                    <Badge className={wordPressStatus?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {wordPressStatus?.enabled ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Site URL</span>
                      <span className="text-sm font-medium">{wordPressStatus?.siteUrl || "Not configured"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium">
                        {wordPressStatus?.lastSync ? formatDate(wordPressStatus.lastSync) : "Never"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestWordPressConnection}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSyncWordPressPosts}
                    >
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
                      <Input 
                        value={settings.siteName}
                        onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input 
                        value={settings.contactEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Phone</label>
                      <Input 
                        value={settings.contactPhone}
                        onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Business Hours</label>
                      <Input 
                        value={settings.businessHours}
                        onChange={(e) => setSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
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

      {/* Contact Details Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Form Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedContact.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Submitted</label>
                <p className="text-sm text-gray-900">{formatDate(selectedContact.createdAt)}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Details Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <Badge variant="outline">{selectedNotification.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className={selectedNotification.read ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedNotification.read ? 'Read' : 'Unread'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900">{selectedNotification.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">{formatDate(selectedNotification.createdAt)}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Delivery Order Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Order ID</label>
                  <p className="text-lg font-semibold text-gray-900">#{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedOrder.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedOrder.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedOrder.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Delivery Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                      <p className="text-sm text-gray-900">{selectedOrder.deliveryAddress}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Estimated Delivery</label>
                      <p className="text-sm text-gray-900">{selectedOrder.estimatedDelivery}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Delivery Notes</label>
                      <p className="text-sm text-gray-900">{selectedOrder.deliveryNotes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.name || 'Product'}</TableCell>
                          <TableCell>{item.quantity || 1}</TableCell>
                          <TableCell>{formatCurrency(item.price || 0)}</TableCell>
                          <TableCell>{formatCurrency((item.price || 0) * (item.quantity || 1))}</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500">
                            No items available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Order Date: {formatDate(selectedOrder.createdAt)}</p>
                  <p>Last Updated: {formatDate(selectedOrder.updatedAt || selectedOrder.createdAt)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateOrderDeliveryStatus(selectedOrder.id, 'approved');
                        setShowOrderDetails(false);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Delivery
                    </Button>
                  )}
                  {selectedOrder.status === 'approved' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateOrderDeliveryStatus(selectedOrder.id, 'completed');
                        setShowOrderDetails(false);
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refill Request Details Dialog */}
      <Dialog open={showRefillDetails} onOpenChange={setShowRefillDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5" />
              <span>Refill Request Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedRefill && (
            <div className="space-y-6">
              {/* Request Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Request ID</label>
                  <p className="text-lg font-semibold text-gray-900">#{selectedRefill.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRefill.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Urgency</label>
                  <div className="mt-1">{getStatusBadge(selectedRefill.urgency)}</div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedRefill.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedRefill.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedRefill.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Medication Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Medication</label>
                      <p className="text-sm text-gray-900">{selectedRefill.medication}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dosage</label>
                      <p className="text-sm text-gray-900">{selectedRefill.dosage}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Instructions</label>
                      <p className="text-sm text-gray-900">{selectedRefill.instructions || 'No special instructions'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedRefill.notes || 'No additional notes'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Prescription ID</label>
                    <p className="text-sm text-gray-900">{selectedRefill.prescriptionId || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Requested: {formatDate(selectedRefill.requestedDate)}</p>
                  {selectedRefill.completedDate && (
                    <p>Completed: {formatDate(selectedRefill.completedDate)}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {selectedRefill.status === 'pending' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateRefillStatus(selectedRefill.id, 'approved');
                        setShowRefillDetails(false);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Refill
                    </Button>
                  )}
                  {selectedRefill.status === 'approved' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateRefillStatus(selectedRefill.id, 'completed');
                        setShowRefillDetails(false);
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowRefillDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Request Details Dialog */}
      <Dialog open={showTransferDetails} onOpenChange={setShowTransferDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Transfer Request Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-6">
              {/* Request Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Request ID</label>
                  <p className="text-lg font-semibold text-gray-900">#{selectedTransfer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTransfer.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">From Pharmacy</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.currentPharmacy}</p>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedTransfer.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedTransfer.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedTransfer.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Transfer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Pharmacy</label>
                      <p className="text-sm text-gray-900">{selectedTransfer.currentPharmacy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">New Pharmacy</label>
                      <p className="text-sm text-gray-900">{selectedTransfer.newPharmacy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Reason</label>
                      <p className="text-sm text-gray-900">{selectedTransfer.reason || 'No reason provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Medications to Transfer</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {Array.isArray(selectedTransfer.medications) ? (
                    <div className="space-y-2">
                      {selectedTransfer.medications.map((med: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-900">{med}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">{selectedTransfer.medications}</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedTransfer.notes || 'No additional notes'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Requested: {formatDate(selectedTransfer.requestedDate)}</p>
                  {selectedTransfer.completedDate && (
                    <p>Completed: {formatDate(selectedTransfer.completedDate)}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {selectedTransfer.status === 'pending' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateTransferStatus(selectedTransfer.id, 'approved');
                        setShowTransferDetails(false);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Transfer
                    </Button>
                  )}
                  {selectedTransfer.status === 'approved' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateTransferStatus(selectedTransfer.id, 'completed');
                        setShowTransferDetails(false);
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowTransferDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {showToast.message}
        </div>
      )}
    </div>
  );
} 