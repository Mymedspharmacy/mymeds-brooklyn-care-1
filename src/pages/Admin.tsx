import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Users, Star, Settings, 
  CheckCircle, XCircle, Search, Calendar, 
  TrendingUp, LogOut, Bell, Link, 
  Pill, RefreshCw, MessageSquare, MapPin,
  Edit, Trash2, Eye, Download, Filter,
  BarChart3, PieChart, LineChart, Activity,
  Package,
  Volume2, VolumeX, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../lib/api';
import railwayAuth from '../lib/railwayAuth';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { EnhancedNotifications } from '../components/notifications/EnhancedNotifications';
import { ExportManager } from '../components/export/ExportManager';
import { InventoryManager } from '../components/inventory/InventoryManager';
import { CustomerCRM } from '../components/crm/CustomerCRM';
import { AdvancedScheduling } from '../components/scheduling/AdvancedScheduling';
import MedicineSearch from '../components/MedicineSearch';
import { useNotifications } from '@/hooks/useNotifications';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import logo from "@/assets/logo.png";

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'delivery-map', label: 'Delivery Map', icon: MapPin },
  { id: 'refills', label: 'Refill Requests', icon: Pill },
  { id: 'transfers', label: 'Transfer Requests', icon: RefreshCw },
  { id: 'contacts', label: 'Contact Requests', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'inventory', label: 'Inventory', icon: ShoppingCart },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: number; name: string } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectAllOrders, setSelectAllOrders] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'MyMeds Pharmacy',
            contactEmail: 'mymedspharmacy@outlook.com',
    contactPhone: '(555) 123-4567',
    businessHours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM'
  });

  // Analytics and Export states
  const [analyticsData, setAnalyticsData] = useState({
    orders: [],
    revenue: [],
    customers: [],
    products: [],
    monthlyStats: [],
    topProducts: [],
    customerSegments: []
  });
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [notificationFilters, setNotificationFilters] = useState({
    priority: 'all',
    type: 'all',
  });

  // Data states
  const [orders, setOrders] = useState([]);
  const [refillRequests, setRefillRequests] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Phase 2 Data states
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0, pendingOrders: 0,
    totalRefills: 0, pendingRefills: 0,
    totalTransfers: 0, pendingTransfers: 0,
    totalContacts: 0, unreadContacts: 0,
    unreadNotifications: 0
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);

  // ✅ ADDED: Use notifications hook with sound control
  const { notifications: realTimeNotifications, isConnected } = useNotifications(soundEnabled);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await railwayAuth.isAuthenticated();
        if (!isAuth) {
          navigate('/admin-signin');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/admin-signin');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Monitor authentication status and redirect if needed
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuth = await railwayAuth.isAuthenticated();
        if (!isAuth && !checkingAuth) {
          console.log('Authentication lost, redirecting to signin');
          navigate('/admin-signin');
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        navigate('/admin-signin');
      }
    };

    // Check auth status every 30 seconds
    const authInterval = setInterval(checkAuthStatus, 30000);
    
    return () => clearInterval(authInterval);
  }, [navigate, checkingAuth]);

  useEffect(() => {
    if (!checkingAuth) {
      const startDataFetching = async () => {
        // Check authentication before starting data fetching
        const isAuth = await railwayAuth.isAuthenticated();
        if (!isAuth) {
          console.log('Not authenticated, stopping data fetching');
          return;
        }
        
        fetchDashboardData();
        const interval = setInterval(async () => {
          const stillAuth = await railwayAuth.isAuthenticated();
          if (stillAuth) {
            fetchDashboardData();
          } else {
            console.log('Authentication lost, stopping interval');
            clearInterval(interval);
          }
        }, 30000);
        
        return () => clearInterval(interval);
      };
      
      startDataFetching();
    }
  }, [checkingAuth]);

  async function fetchDashboardData() {
    try {
      // Check authentication before making API calls
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping API calls');
        return;
      }

      await Promise.all([
        fetchOrders(), fetchRefillRequests(), fetchTransferRequests(),
        fetchContacts(), fetchNotifications(), fetchIntegrationStatus(), fetchSettings()
      ]);
      // Remove dummy data generation calls
      // setTimeout(() => generateDeliveryOrders(), 100);
      // generateAnalyticsData();
      
      // Remove Phase 2 dummy data generation
      // generateProducts();
      // generateSuppliers();
      // generateCustomers();
      // generateAppointments();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  async function fetchOrders() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping orders fetch');
        return;
      }

      const response = await api.get('/orders');
      setOrders(response.data);
      setStats(prev => ({
        ...prev,
        totalOrders: response.data.length,
        pendingOrders: response.data.filter((o: any) => o.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
    }
  }

  async function fetchRefillRequests() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping refill requests fetch');
        return;
      }

      const response = await api.get('/refill-requests');
      setRefillRequests(response.data);
      setStats(prev => ({
        ...prev,
        totalRefills: response.data.length,
        pendingRefills: response.data.filter((r: any) => r.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching refill requests:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
    }
  }

  async function fetchTransferRequests() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping transfer requests fetch');
        return;
      }

      const response = await api.get('/transfer-requests');
      setTransferRequests(response.data);
      setStats(prev => ({
        ...prev,
        totalTransfers: response.data.length,
        pendingTransfers: response.data.filter((t: any) => t.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
    }
  }

  async function fetchContacts() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping contacts fetch');
        return;
      }

      const response = await api.get('/contact');
      setContacts(response.data);
      setStats(prev => ({
        ...prev,
        totalContacts: response.data.length,
        unreadContacts: response.data.filter((c: any) => !c.notified).length
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
    }
  }

  async function fetchNotifications() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping notifications fetch');
        return;
      }

      const response = await api.get('/notifications');
      setNotifications(response.data);
      setStats(prev => ({
        ...prev,
        totalNotifications: response.data.length,
        unreadNotifications: response.data.filter((n: any) => !n.read).length
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
    }
  }

  async function fetchIntegrationStatus() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping integration status fetch');
        return;
      }

      const [wooResponse, wpResponse] = await Promise.all([
        api.get('/woocommerce/settings'),
        api.get('/wordpress/settings')
      ]);
      
      setWooCommerceStatus(wooResponse.data);
      setWordPressStatus(wpResponse.data);
    } catch (error) {
      console.error('Error fetching integration status:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
    }
  }

  async function fetchSettings() {
    try {
      // Check authentication before making API call
      const isAuth = await railwayAuth.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, skipping settings fetch');
        return;
      }

      const response = await api.get('/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // If it's an auth error, redirect to signin
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin-signin');
      }
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
        // Use actual coordinates if available, otherwise show as pending
        coordinates: order.coordinates || null,
        // Use actual delivery time if available
        estimatedDelivery: order.estimatedDelivery || 'To be determined',
        // Use actual delivery notes or default
        deliveryNotes: order.deliveryNotes || 'Standard delivery'
      }));
    
    setDeliveryOrders(deliveryOrders);
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

  // CRUD Operations for Orders
  async function deleteOrder(id: number) {
    try {
      await api.delete(`/orders/${id}`);
      showToastMessage('Order deleted successfully');
      fetchOrders();
      generateDeliveryOrders(); // Refresh delivery map
    } catch (error) {
      console.error('Error deleting order:', error);
      showToastMessage('Failed to delete order', 'error');
    }
  }

  async function updateOrder(id: number, orderData: any) {
    try {
      await api.put(`/orders/${id}`, orderData);
      showToastMessage('Order updated successfully');
      fetchOrders();
      generateDeliveryOrders(); // Refresh delivery map
    } catch (error) {
      console.error('Error updating order:', error);
      showToastMessage('Failed to update order', 'error');
    }
  }

  // CRUD Operations for Refill Requests
  async function deleteRefillRequest(id: number) {
    try {
      await api.delete(`/refill-requests/${id}`);
      showToastMessage('Refill request deleted successfully');
      fetchRefillRequests();
    } catch (error) {
      console.error('Error deleting refill request:', error);
      showToastMessage('Failed to delete refill request', 'error');
    }
  }

  async function updateRefillRequest(id: number, refillData: any) {
    try {
      await api.put(`/refill-requests/${id}`, refillData);
      showToastMessage('Refill request updated successfully');
      fetchRefillRequests();
    } catch (error) {
      console.error('Error updating refill request:', error);
      showToastMessage('Failed to update refill request', 'error');
    }
  }

  // CRUD Operations for Transfer Requests
  async function deleteTransferRequest(id: number) {
    try {
      await api.delete(`/transfer-requests/${id}`);
      showToastMessage('Transfer request deleted successfully');
      fetchTransferRequests();
    } catch (error) {
      console.error('Error deleting transfer request:', error);
      showToastMessage('Failed to delete transfer request', 'error');
    }
  }

  async function updateTransferRequest(id: number, transferData: any) {
    try {
      await api.put(`/transfer-requests/${id}`, transferData);
      showToastMessage('Transfer request updated successfully');
      fetchTransferRequests();
    } catch (error) {
      console.error('Error updating transfer request:', error);
      showToastMessage('Failed to update transfer request', 'error');
    }
  }

  // CRUD Operations for Contact Forms
  async function deleteContact(id: number) {
    try {
      await api.delete(`/contact/${id}`);
      showToastMessage('Contact form deleted successfully');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact form:', error);
      showToastMessage('Failed to delete contact form', 'error');
    }
  }

  async function updateContact(id: number, contactData: any) {
    try {
      await api.put(`/contact/${id}`, contactData);
      showToastMessage('Contact form updated successfully');
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact form:', error);
      showToastMessage('Failed to update contact form', 'error');
    }
  }

  async function markContactAsRead(id: number) {
    try {
      await api.put(`/contact/${id}/read`);
      showToastMessage('Contact marked as read');
      fetchContacts();
    } catch (error) {
      console.error('Error marking contact as read:', error);
      showToastMessage('Failed to mark contact as read', 'error');
    }
  }

  // CRUD Operations for Notifications
  async function deleteNotification(id: number) {
    try {
      await api.delete(`/notifications/${id}`);
      showToastMessage('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToastMessage('Failed to delete notification', 'error');
    }
  }

  async function updateNotification(id: number, notificationData: any) {
    try {
      await api.put(`/notifications/${id}`, notificationData);
      showToastMessage('Notification updated successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      showToastMessage('Failed to update notification', 'error');
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await api.put('/notifications/mark-all-read');
      showToastMessage('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToastMessage('Failed to mark all notifications as read', 'error');
    }
  }

  // Enhanced notification functions
  async function acknowledgeNotification(id: number) {
    try {
      await api.put(`/notifications/${id}/acknowledge`);
      showToastMessage('Notification acknowledged');
      fetchNotifications();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      showToastMessage('Failed to acknowledge notification', 'error');
    }
  }

  // Export functionality
  async function handleExport(options: any) {
    setIsExporting(true);
    try {
      // Implement real export functionality
      const response = await api.post('/export', {
        type: options.dataType,
        format: options.format,
        fields: options.fields
      });
      
      if (response.data.downloadUrl) {
        // Download the actual exported file
        const a = document.createElement('a');
        a.href = response.data.downloadUrl;
        a.download = `export_${new Date().toISOString().split('T')[0]}.${options.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      showToastMessage('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showToastMessage('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }

  // Bulk Operations for Orders
  async function bulkDeleteOrders() {
    if (selectedOrders.length === 0) {
      showToastMessage('No orders selected for deletion', 'error');
      return;
    }

    try {
      // Delete orders one by one (or implement bulk delete endpoint)
      for (const orderId of selectedOrders) {
        await api.delete(`/orders/${orderId}`);
      }
      
      showToastMessage(`Successfully deleted ${selectedOrders.length} order(s)`);
      setSelectedOrders([]);
      setSelectAllOrders(false);
      fetchOrders();
      generateDeliveryOrders(); // Refresh delivery map
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      showToastMessage('Failed to delete some orders', 'error');
    }
  }

  function handleOrderSelection(orderId: number) {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  }

  function handleSelectAllOrders() {
    if (selectAllOrders) {
      setSelectedOrders([]);
      setSelectAllOrders(false);
    } else {
      const filteredOrders = orders.filter((order: any) => 
        order.id.toString().includes(searchTerm) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSelectedOrders(filteredOrders.map((order: any) => order.id));
      setSelectAllOrders(true);
    }
  }

  // Helper functions for delete and edit operations
  function handleDeleteClick(type: string, id: number, name: string) {
    setDeleteItem({ type, id, name });
    setShowDeleteConfirm(true);
  }

  function handleEditClick(type: string, data: any) {
    setEditingItem({ type, data });
    setShowEditDialog(true);
  }

  async function confirmDelete() {
    if (!deleteItem) return;

    try {
      switch (deleteItem.type) {
        case 'order':
          await deleteOrder(deleteItem.id);
          break;
        case 'refill':
          await deleteRefillRequest(deleteItem.id);
          break;
        case 'transfer':
          await deleteTransferRequest(deleteItem.id);
          break;
        case 'contact':
          await deleteContact(deleteItem.id);
          break;
        case 'notification':
          await deleteNotification(deleteItem.id);
          break;
        default:
          showToastMessage('Unknown item type', 'error');
      }
    } catch (error) {
      console.error('Error in confirmDelete:', error);
    } finally {
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    }
  }

  async function handleEditSave(updatedData: any) {
    if (!editingItem) return;

    try {
      switch (editingItem.type) {
        case 'order':
          await updateOrder(editingItem.data.id, updatedData);
          break;
        case 'refill':
          await updateRefillRequest(editingItem.data.id, updatedData);
          break;
        case 'transfer':
          await updateTransferRequest(editingItem.data.id, updatedData);
          break;
        case 'contact':
          await updateContact(editingItem.data.id, updatedData);
          break;
        case 'notification':
          await updateNotification(editingItem.data.id, updatedData);
          break;
        default:
          showToastMessage('Unknown item type', 'error');
      }
    } catch (error) {
      console.error('Error in handleEditSave:', error);
    } finally {
      setShowEditDialog(false);
      setEditingItem(null);
    }
  }

  // Phase 2 Handler Functions
  async function handleUpdateProduct(id: number, data: any) {
    try {
      const response = await api.put(`/products/${id}`, data);
      if (response.data.success) {
        showToastMessage('Product updated successfully');
        // Refresh products from API
        // await fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showToastMessage('Error updating product', 'error');
    }
  }

  async function handleDeleteProduct(id: number) {
    try {
      const response = await api.delete(`/products/${id}`);
      if (response.data.success) {
        showToastMessage('Product deleted successfully');
        // Refresh products from API
        // await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToastMessage('Error deleting product', 'error');
    }
  }

  async function handleAddProduct(data: any) {
    try {
      const response = await api.post('/products', data);
      if (response.data.success) {
        showToastMessage('Product added successfully');
        // Refresh products from API
        // await fetchProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showToastMessage('Error adding product', 'error');
    }
  }

  async function handleUpdateSupplier(id: number, data: any) {
    try {
      const response = await api.put(`/suppliers/${id}`, data);
      if (response.data.success) {
        showToastMessage('Supplier updated successfully');
        // Refresh suppliers from API
        // await fetchSuppliers();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      showToastMessage('Error updating supplier', 'error');
    }
  }

  async function handleDeleteSupplier(id: number) {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      if (response.data.success) {
        showToastMessage('Supplier deleted successfully');
        // Refresh suppliers from API
        // await fetchSuppliers();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showToastMessage('Error deleting supplier', 'error');
    }
  }

  async function handleAddSupplier(data: any) {
    try {
      const response = await api.post('/suppliers', data);
      if (response.data.success) {
        showToastMessage('Supplier added successfully');
        // Refresh suppliers from API
        // await fetchSuppliers();
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      showToastMessage('Error adding supplier', 'error');
    }
  }

  async function handleUpdateCustomer(id: number, data: any) {
    try {
      const response = await api.put(`/customers/${id}`, data);
      if (response.data.success) {
        showToastMessage('Customer updated successfully');
        // Refresh customers from API
        // await fetchCustomers();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      showToastMessage('Error updating customer', 'error');
    }
  }

  async function handleDeleteCustomer(id: number) {
    try {
      const response = await api.delete(`/customers/${id}`);
      if (response.data.success) {
        showToastMessage('Customer deleted successfully');
        // Refresh customers from API
        // await fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToastMessage('Error deleting customer', 'error');
    }
  }

  async function handleAddCustomer(data: any) {
    try {
      const response = await api.post('/customers', data);
      if (response.data.success) {
        showToastMessage('Customer added successfully');
        // Refresh customers from API
        // await fetchCustomers();
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      showToastMessage('Error adding customer', 'error');
    }
  }

  async function handleUpdateAppointment(id: number, data: any) {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      if (response.data.success) {
        showToastMessage('Appointment updated successfully');
        // Refresh appointments from API
        // await fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      showToastMessage('Error updating appointment', 'error');
    }
  }

  async function handleDeleteAppointment(id: number) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      if (response.data.success) {
        showToastMessage('Appointment deleted successfully');
        // Refresh appointments from API
        // await fetchAppointments();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showToastMessage('Error deleting appointment', 'error');
    }
  }

  async function handleAddAppointment(data: any) {
    try {
      const response = await api.post('/appointments', data);
      if (response.data.success) {
        showToastMessage('Appointment added successfully');
        // Refresh appointments from API
        // await fetchAppointments();
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      showToastMessage('Error adding appointment', 'error');
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

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Additional check to ensure we have valid user data
  const currentUser = railwayAuth.getUser();
  if (!currentUser || !currentUser.role || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Admin access required</div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Prevent API calls if not authenticated
  const isAuthenticated = railwayAuth.isAuthenticatedSync();
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Authentication required</div>
          <p className="text-gray-600">Please sign in to continue...</p>
        </div>
      </div>
    );
  }

  // Show user info in the header
  const userInfo = currentUser ? `${currentUser.name} (${currentUser.email})` : 'Admin User';

  // Add logout confirmation dialog
  const handleLogout = async () => {
    try {
      await railwayAuth.logout();
      navigate('/admin-signin');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      localStorage.clear();
      navigate('/admin-signin');
    }
  };

  // Add user info display in the header
  const showUserInfo = () => {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Logged in as:</span>
        <span className="font-medium text-gray-900">{userInfo}</span>
      </div>
    );
  };

  // Add authentication status indicator
  const showAuthStatus = () => {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-600">Authenticated</span>
      </div>
    );
  };

  // Add session timeout warning
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      setShowSessionWarning(true);
    }, 25 * 60 * 1000); // Show warning 5 minutes before session expires (30 min session)

    return () => clearTimeout(sessionTimeout);
  }, []);

  // Extend session
  const extendSession = async () => {
    try {
      await railwayAuth.getCurrentUser(); // This will refresh the token
      setShowSessionWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      navigate('/admin-signin');
    }
  };

  // Add session timeout warning dialog
  const SessionWarningDialog = () => {
    if (!showSessionWarning) return null;
    
    return (
      <Dialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Your session will expire in 5 minutes. Would you like to extend it?</p>
            <div className="flex space-x-2">
              <Button onClick={extendSession} className="bg-[#376F6B] hover:bg-[#57BBB6]">
                Extend Session
              </Button>
              <Button variant="outline" onClick={() => setShowSessionWarning(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Session Timeout Warning
  {showSessionWarning && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-800 font-medium">Session Expiring Soon</span>
          <span className="text-yellow-600 text-sm">Your session will expire in 5 minutes</span>
        </div>
        <Button 
          onClick={extendSession} 
          size="sm"
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Extend Session
        </Button>
      </div>
    </div>
  )}

  return (
    <>
      <SEOHead 
        title="Admin Dashboard - My Meds Pharmacy | Brooklyn Pharmacy Management"
        description="Access the My Meds Pharmacy admin dashboard for comprehensive pharmacy management, analytics, and patient care coordination in Brooklyn."
        keywords="admin dashboard, pharmacy management, pharmacy analytics, patient management, prescription management, Brooklyn pharmacy admin"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
      
      <div className="pt-20">
        {/* Toast Notification */}
        {showToast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            showToast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              {showToast.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span>{showToast.message}</span>
            </div>
          </div>
        )}

        {/* Admin Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating Admin Icons */}
            <div className="absolute top-10 left-10 text-[#57BBB6]/10 animate-bounce" style={{ animationDelay: '0s' }}>
              <Settings className="w-6 h-6" />
            </div>
            <div className="absolute top-20 right-20 text-[#376F6B]/8 animate-bounce" style={{ animationDelay: '1s' }}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="absolute bottom-20 left-20 text-[#D5C6BC]/12 animate-bounce" style={{ animationDelay: '2s' }}>
              <TrendingUp className="w-7 h-7" />
            </div>
            <div className="absolute bottom-10 right-10 text-[#57BBB6]/9 animate-bounce" style={{ animationDelay: '3s' }}>
              <Shield className="w-6 h-6" />
            </div>
            
            {/* Animated Particles */}
            <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-[#57BBB6]/15 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-[#376F6B]/10 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Admin Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 rounded-lg mb-8 relative z-10 hover:shadow-md transition-shadow duration-300">
            {/* Background Image Placeholder - Replace with actual pharmacy management/analytics image */}
                         <div
               className="absolute inset-0 opacity-50 pointer-events-none rounded-lg"
               style={{
                 backgroundImage: `url('/images/new/homepage.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             ></div>
             
             {/* Subtle Text Enhancement - No Dark Overlay */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-lg z-10"></div>
            
            <div className="px-6 py-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 group">
                    <img
                      src={logo}
                      alt="My Meds Pharmacy Logo"
                      className="h-8 w-auto sm:h-10 md:h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900">MyMeds Pharmacy Admin</h1>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-semibold text-gray-900">Admin</h1>
                  </div>
                </div>

                {/* Right: Action Buttons - Mobile Responsive */}
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                  {/* User Info Display */}
                  <div className="hidden lg:block">
                    {showUserInfo()}
                  </div>
                  
                  {/* Authentication Status */}
                  <div className="hidden lg:block">
                    {showAuthStatus()}
                  </div>
                  
                  {/* Medicine Search Button - Responsive */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowMedicineSearch(true)}
                    title="Search medicines using OpenFDA"
                    className="hidden sm:flex items-center space-x-1 px-2 py-1 text-xs border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white transition-colors"
                  >
                    <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Medicine Search</span>
                  </Button>
                  
                  {/* Notification Sound Toggle - Responsive */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? "Disable notification sound" : "Enable notification sound"}
                    className="p-2 sm:px-3"
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Test Notification Button - Responsive */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Test notification sound
                      const audio = new Audio('/notification.mp3');
                      audio.volume = 0.5;
                      audio.play().catch(err => console.log('Test sound failed:', err));
                      
                      // Show test toast
                      showToastMessage('Test notification sound played!', 'success');
                    }}
                    title="Test notification sound"
                    className="p-2 sm:px-3"
                  >
                    <span className="text-sm">🔊</span>
                  </Button>
                  
                  {/* Notifications Button - Responsive */}
                  <div className="relative">
                    <Button variant="outline" size="sm" className="relative p-2 sm:px-3" onClick={() => setShowNotificationDialog(true)}>
                      <Bell className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Notifications</span>
                      {stats.unreadNotifications > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                          {stats.unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* Logout Button - Responsive */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowLogoutConfirm(true)}
                    title="Logout from admin panel"
                    className="hidden sm:flex items-center space-x-1 px-2 py-1 text-xs border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>

                  {/* Mobile Menu Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="sm:hidden p-2"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Mobile Display */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 rounded-lg mb-4">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {showUserInfo()}
                {showAuthStatus()}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filter Bar */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-6 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search orders, refills, transfers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-[#376F6B] focus:ring-[#376F6B]"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Authentication Status Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg mb-6 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">Session Active</span>
                  <span className="text-green-600 text-sm">• {userInfo}</span>
                </div>
                <Button 
                  onClick={extendSession} 
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  Extend Session
                </Button>
              </div>
            </div>

            {/* Session Timeout Warning */}
            {showSessionWarning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-800 font-medium">Session Expiring Soon</span>
                    <span className="text-yellow-600 text-sm">Your session will expire in 5 minutes</span>
                  </div>
                  <Button 
                    onClick={extendSession} 
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Extend Session
                  </Button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2">
                {TABS.map((tabItem) => {
                  const Icon = tabItem.icon;
                  return (
                    <TabsTrigger
                      key={tabItem.id}
                      value={tabItem.id}
                      className="flex items-center space-x-2 px-4 py-2 data-[state=active]:bg-[#376F6B] data-[state=active]:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tabItem.label}</span>
                    </TabsTrigger>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.pendingOrders} pending
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Refill Requests</CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRefills}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.pendingRefills} pending
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transfer Requests</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTransfers}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.pendingTransfers} pending
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />
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

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <AnalyticsDashboard
                    data={analyticsData}
                    timeRange={analyticsTimeRange}
                    onTimeRangeChange={setAnalyticsTimeRange}
                  />
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Order Management</CardTitle>
                        <div className="flex items-center space-x-2">
                          <ExportManager
                            dataType="orders"
                            availableFields={['id', 'total', 'status', 'createdAt', 'user.name', 'user.email', 'user.phone', 'items']}
                            onExport={handleExport}
                            isExporting={isExporting}
                          />
                          {selectedOrders.length > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {selectedOrders.length} selected
                            </Badge>
                          )}
                          {selectedOrders.length > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setShowBulkDeleteConfirm(true)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Selected ({selectedOrders.length})
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                          />
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectAllOrders}
                              onCheckedChange={handleSelectAllOrders}
                              className="data-[state=checked]:bg-[#376F6B]"
                            />
                            <span className="text-sm text-gray-600">Select All</span>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectAllOrders}
                                  onCheckedChange={handleSelectAllOrders}
                                  className="data-[state=checked]:bg-[#376F6B]"
                                />
                              </TableHead>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Items</TableHead>
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
                                  className={`hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}
                                >
                                  <TableCell>
                                                                        <Checkbox
                                      checked={selectedOrders.includes(order.id)}
                                      onCheckedChange={() => handleOrderSelection(order.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="data-[state=checked]:bg-[#376F6B]"
                                    />
                                  </TableCell>
                                  <TableCell 
                                    className="cursor-pointer font-medium text-[#376F6B] hover:text-[#57BBB6]"
                                    onClick={() => handleOrderClick(order)}
                                  >
                                    #{order.id}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{order.user?.name || 'N/A'}</div>
                                      <div className="text-sm text-gray-500">ID: {order.user?.id || 'N/A'}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="text-sm">{order.user?.email || 'N/A'}</div>
                                      <div className="text-sm text-gray-500">{order.user?.phone || 'N/A'}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {order.items?.length || 0} item(s)
                                      {order.items?.length > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {order.items.slice(0, 2).map((item: any, index: number) => (
                                            <div key={index}>• {item.name || 'Product'} ({item.quantity || 1})</div>
                                          ))}
                                          {order.items.length > 2 && (
                                            <div className="text-xs text-gray-500">+{order.items.length - 2} more</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="text-sm">{formatDate(order.createdAt)}</div>
                                      {order.updatedAt && order.updatedAt !== order.createdAt && (
                                        <div className="text-xs text-gray-500">Updated: {formatDate(order.updatedAt)}</div>
                                      )}
                                    </div>
                                  </TableCell>
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
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick('order', order);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Edit Order"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span className="ml-1 hidden sm:inline">Edit</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick('order', order.id, `Order #${order.id}`);
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                        title="Delete Order"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="ml-1 hidden sm:inline">Delete</span>
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick('refill', refill);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Edit Refill Request"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick('refill', refill.id, `Refill #${refill.id}`);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete Refill Request"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Delete</span>
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick('transfer', transfer);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Edit Transfer Request"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick('transfer', transfer.id, `Transfer #${transfer.id}`);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete Transfer Request"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Delete</span>
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
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewContact(contact)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">View</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditClick('contact', contact)}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Edit Contact"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markContactAsRead(contact.id)}
                                    disabled={contact.notified}
                                    className="text-green-600 hover:text-green-700"
                                    title="Mark as Read"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Read</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteClick('contact', contact.id, `Contact #${contact.id}`)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete Contact"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Delete</span>
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

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <EnhancedNotifications
                    notifications={notifications}
                    onMarkRead={markNotificationRead}
                    onMarkAllRead={markAllNotificationsAsRead}
                    onDelete={deleteNotification}
                    onAcknowledge={acknowledgeNotification}
                    onFilterChange={setNotificationFilters}
                  />
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                  <InventoryManager
                    products={products}
                    suppliers={suppliers}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onAddProduct={handleAddProduct}
                    onUpdateSupplier={handleUpdateSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                    onAddSupplier={handleAddSupplier}
                  />
                </TabsContent>

                {/* CRM Tab */}
                <TabsContent value="crm" className="space-y-6">
                  <CustomerCRM
                    customers={customers}
                    onUpdateCustomer={handleUpdateCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    onAddCustomer={handleAddCustomer}
                  />
                </TabsContent>

                {/* Scheduling Tab */}
                <TabsContent value="scheduling" className="space-y-6">
                  <AdvancedScheduling
                    appointments={appointments}
                    onUpdateAppointment={handleUpdateAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                    onAddAppointment={handleAddAppointment}
                  />
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
              </div>
            </Tabs>
          </div>
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
              <Button onClick={handleLogout}>
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

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span>Confirm Bulk Delete</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedOrders.length} order(s)</strong>? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete all selected orders and their associated data.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    bulkDeleteOrders();
                    setShowBulkDeleteConfirm(false);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedOrders.length} Order(s)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span>Confirm Delete</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{deleteItem?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Edit {editingItem?.type}</span>
              </DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                {editingItem.type === 'order' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                          defaultValue={editingItem.data.status}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, status: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={editingItem.data.total}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, total: parseFloat(e.target.value) };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                          className="focus:border-[#376F6B] focus:ring-[#376F6B]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                      <Input
                        defaultValue={editingItem.data.deliveryAddress}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, deliveryAddress: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                        className="focus:border-[#376F6B] focus:ring-[#376F6B]"
                      />
                    </div>
                  </div>
                )}

                {editingItem.type === 'refill' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                          defaultValue={editingItem.data.status}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, status: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Urgency</label>
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                          defaultValue={editingItem.data.urgency}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, urgency: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Medication</label>
                      <Input
                        defaultValue={editingItem.data.medication}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, medication: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dosage</label>
                      <Input
                        defaultValue={editingItem.data.dosage}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, dosage: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                        rows={3}
                        defaultValue={editingItem.data.notes}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, notes: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                  </div>
                )}

                {editingItem.type === 'transfer' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                          defaultValue={editingItem.data.status}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, status: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Current Pharmacy</label>
                        <Input
                          defaultValue={editingItem.data.currentPharmacy}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, currentPharmacy: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Medications</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                        rows={3}
                        defaultValue={Array.isArray(editingItem.data.medications) ? editingItem.data.medications.join(', ') : editingItem.data.medications}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, medications: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Reason</label>
                      <Input
                        defaultValue={editingItem.data.reason}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, reason: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                        rows={3}
                        defaultValue={editingItem.data.notes}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, notes: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                  </div>
                )}

                {editingItem.type === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <Input
                          defaultValue={editingItem.data.name}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, name: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                          type="email"
                          defaultValue={editingItem.data.email}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, email: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                        rows={4}
                        defaultValue={editingItem.data.message}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, message: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                  </div>
                )}

                {editingItem.type === 'notification' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                          defaultValue={editingItem.data.type}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, type: e.target.value };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        >
                          <option value="order">Order</option>
                          <option value="prescription">Prescription</option>
                          <option value="appointment">Appointment</option>
                          <option value="contact">Contact</option>
                          <option value="refill">Refill</option>
                          <option value="transfer">Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Read Status</label>
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                          defaultValue={editingItem.data.read ? 'read' : 'unread'}
                          onChange={(e) => {
                            const updatedData = { ...editingItem.data, read: e.target.value === 'read' };
                            setEditingItem({ ...editingItem, data: updatedData });
                          }}
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <Input
                        defaultValue={editingItem.data.title}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, title: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                        className="focus:border-[#376F6B] focus:ring-[#376F6B]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#376F6B] focus:ring-[#376F6B]"
                        rows={4}
                        defaultValue={editingItem.data.message}
                        onChange={(e) => {
                          const updatedData = { ...editingItem.data, message: e.target.value };
                          setEditingItem({ ...editingItem, data: updatedData });
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleEditSave(editingItem.data)}
                    className="bg-[#376F6B] hover:bg-[#57BBB6]"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
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

        {/* Session Warning Dialog */}
        <SessionWarningDialog />

        {/* Medicine Search Component */}
        <MedicineSearch 
          isOpen={showMedicineSearch} 
          onClose={() => setShowMedicineSearch(false)} 
        />
        
        <Footer />
      </div>
      </div>
      </>
    );
} 