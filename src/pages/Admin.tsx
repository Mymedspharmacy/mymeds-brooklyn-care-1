import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Users, Star, Settings, 
  CheckCircle, XCircle, Search, Calendar, 
  TrendingUp, LogOut, Bell, Link, 
  Pill, RefreshCw, MessageSquare, MapPin,
  Edit, Trash2, Eye, Download, Filter,
  BarChart3, PieChart, LineChart, Activity,
  Package, Volume2, VolumeX, Shield, Plus, Clock,
  Truck, Navigation, AlertTriangle, AlertCircle,
  Save, Zap, Check, ExternalLink
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
import adminAuth from '../lib/adminAuth';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { EnhancedNotifications } from '../components/notifications/EnhancedNotifications';
import { ExportManager } from '../components/export/ExportManager';
import MedicineSearch from '../components/MedicineSearch';
import { useNotifications } from '@/hooks/useNotifications';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();
  const { toast } = useToast();
  
  // Core state management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  // Data states for real functionality
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [refillRequests, setRefillRequests] = useState([]);
  const [refillStats, setRefillStats] = useState(null);
  const [transferRequests, setTransferRequests] = useState([]);
  const [transferStats, setTransferStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [refillStatusFilter, setRefillStatusFilter] = useState('all');
  const [transferStatusFilter, setTransferStatusFilter] = useState('all');
  const [notificationTypeFilter, setNotificationTypeFilter] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [refillsLoading, setRefillsLoading] = useState(false);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  // Inventory state
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  
  // CRM state
  const [crmCustomers, setCrmCustomers] = useState([]);
  const [crmStats, setCrmStats] = useState(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmSearch, setCrmSearch] = useState('');
  const [crmSegmentFilter, setCrmSegmentFilter] = useState('all');

  // Scheduling state
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    availableSlots: 0
  });
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  
  // Schedule management state
  const [timeSlots, setTimeSlots] = useState([
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ]);
  const [appointmentTypes, setAppointmentTypes] = useState([
    { id: 1, name: 'Consultation', duration: 30, price: 50 },
    { id: 2, name: 'Medication Review', duration: 45, price: 75 },
    { id: 3, name: 'Vaccination', duration: 15, price: 25 },
    { id: 4, name: 'Health Screening', duration: 60, price: 100 }
  ]);
  const [workingHours, setWorkingHours] = useState([
    { name: 'Monday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Tuesday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Thursday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Friday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Saturday', enabled: true, startTime: '09:00', endTime: '16:00' },
    { name: 'Sunday', enabled: false, startTime: '09:00', endTime: '16:00' }
  ]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showTimeSlotDialog, setShowTimeSlotDialog] = useState(false);
  const [showAppointmentTypeDialog, setShowAppointmentTypeDialog] = useState(false);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [showBlockTimeDialog, setShowBlockTimeDialog] = useState(false);

  // WordPress management state
  const [wordPressStatus, setWordPressStatus] = useState({
    connected: false,
    testing: false,
    syncing: false
  });
  const [wordPressStats, setWordPressStats] = useState({
    postCount: 0,
    lastSync: 'Never',
    cacheStatus: 'Empty'
  });
  const [showWordPressSettingsDialog, setShowWordPressSettingsDialog] = useState(false);
  const [showWordPressPostDialog, setShowWordPressPostDialog] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    siteName: 'My Meds Pharmacy',
    contactEmail: 'mymedspharmacy@outlook.com',
    businessHours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM',
    phoneNumber: '(555) 123-4567'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  
  // Delivery Map state
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Delivery Zones state
  const [deliveryZones, setDeliveryZones] = useState([
    {
      id: 1,
      name: 'Zone 1 - Immediate',
      radius: '0-5 miles',
      status: 'Active',
      color: 'green',
      description: 'Immediate delivery zone'
    },
    {
      id: 2,
      name: 'Zone 2 - Extended',
      radius: '5-10 miles',
      status: 'Active',
      color: 'blue',
      description: 'Extended delivery zone'
    },
    {
      id: 3,
      name: 'Zone 3 - Premium',
      radius: '10-15 miles',
      status: 'Limited',
      color: 'yellow',
      description: 'Premium delivery zone'
    }
  ]);
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    radius: '',
    status: 'Active',
    color: 'green',
    description: ''
  });

  // Delivery Fees state - simplified approach
  const [deliveryFees, setDeliveryFees] = useState({
    freeDeliveryThreshold: 25,
    standardDeliveryFee: 5.00,
    sameDayDeliveryFee: 3.00,
    freeDeliveryText: 'Free',
    currency: '$'
  });
  const [showDeliveryFeesDialog, setShowDeliveryFeesDialog] = useState(false);
  const [deliveryFeesChanged, setDeliveryFeesChanged] = useState(false);
  
  // Temporary form values for editing
  const [tempFreeThreshold, setTempFreeThreshold] = useState(25);
  const [tempStandardFee, setTempStandardFee] = useState(5.00);
  const [tempSameDayFee, setTempSameDayFee] = useState(3.00);
  const [tempFreeText, setTempFreeText] = useState('Free');
  const [tempCurrency, setTempCurrency] = useState('$');

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await adminAuth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin-signin');
        return;
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('admin-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    };

    loadSettings();
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [user]);

  // Load orders data when orders tab is active
  const loadOrdersData = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const [ordersResponse, statsResponse] = await Promise.all([
        api.get(`/orders/admin/all?status=${orderStatusFilter}&search=${searchTerm}&limit=50`),
        api.get('/orders/admin/stats')
      ]);
      
      if (ordersResponse.data.success) {
        // Ensure data is always an array
        const ordersData = Array.isArray(ordersResponse.data.data.orders) 
          ? ordersResponse.data.data.orders 
          : [];
        setOrders(ordersData);
      }
      if (statsResponse.data.success) {
        setOrderStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to load orders data:', error);
      // Set empty array on error
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderStatusFilter, searchTerm]);

  // Load refill requests data
  const loadRefillsData = useCallback(async () => {
    setRefillsLoading(true);
    try {
      const [refillsResponse, statsResponse] = await Promise.all([
        api.get(`/refill-requests?status=${refillStatusFilter}&limit=50`),
        api.get('/refill-requests/stats/overview')
      ]);
      
      if (refillsResponse.data) {
        // Ensure data is always an array
        const refillsData = Array.isArray(refillsResponse.data) ? refillsResponse.data : [];
        setRefillRequests(refillsData);
      }
      if (statsResponse.data) {
        setRefillStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load refills data:', error);
      // Set empty array on error
      setRefillRequests([]);
    } finally {
      setRefillsLoading(false);
    }
  }, [refillStatusFilter]);

  // Load orders when orders tab becomes active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrdersData();
    }
  }, [activeTab, user, loadOrdersData]);

  // Load transfer requests data
  const loadTransfersData = useCallback(async () => {
    setTransfersLoading(true);
    try {
      const [transfersResponse, statsResponse] = await Promise.all([
        api.get(`/transfer-requests?status=${transferStatusFilter}&limit=50`),
        api.get('/transfer-requests/stats/overview')
      ]);
      
      if (transfersResponse.data) {
        // Ensure data is always an array
        const transfersData = Array.isArray(transfersResponse.data) ? transfersResponse.data : [];
        setTransferRequests(transfersData);
      }
      if (statsResponse.data) {
        setTransferStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load transfers data:', error);
      // Set empty array on error
      setTransferRequests([]);
    } finally {
      setTransfersLoading(false);
    }
  }, [transferStatusFilter]);

  // Load refills when refills tab becomes active
  useEffect(() => {
    if (activeTab === 'refills' && user) {
      loadRefillsData();
    }
  }, [activeTab, user, loadRefillsData]);

  // Load contact requests data
  const loadContactsData = useCallback(async () => {
    setContactsLoading(true);
    try {
      const [contactsResponse, statsResponse] = await Promise.all([
        api.get('/contact?limit=50'),
        api.get('/contact/stats/overview')
      ]);
      
      if (contactsResponse.data) {
        // Ensure data is always an array
        const contactsData = Array.isArray(contactsResponse.data) ? contactsResponse.data : [];
        setContacts(contactsData);
      }
      if (statsResponse.data) {
        setContactStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load contacts data:', error);
      // Set empty array on error
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  // Load transfers when transfers tab becomes active
  useEffect(() => {
    if (activeTab === 'transfers' && user) {
      loadTransfersData();
    }
  }, [activeTab, user, loadTransfersData]);

  // Load notifications data
  const loadNotificationsData = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const [notificationsResponse, statsResponse] = await Promise.all([
        api.get(`/notifications?type=${notificationTypeFilter}&limit=50`),
        api.get('/notifications/stats/overview')
      ]);
      
      if (notificationsResponse.data) {
        // Ensure data is always an array
        const notificationsData = Array.isArray(notificationsResponse.data) ? notificationsResponse.data : [];
        setAdminNotifications(notificationsData);
      }
      if (statsResponse.data) {
        setNotificationStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load notifications data:', error);
      // Set empty array on error
      setAdminNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notificationTypeFilter]);

  // Load contacts when contacts tab becomes active
  useEffect(() => {
    if (activeTab === 'contacts' && user) {
      loadContactsData();
    }
  }, [activeTab, user, loadContactsData]);

  // Load notifications when notifications tab becomes active
  useEffect(() => {
    if (activeTab === 'notifications' && user) {
      loadNotificationsData();
    }
  }, [activeTab, user, loadNotificationsData]);

  // Load inventory data
  const loadInventoryData = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const [inventoryResponse, statsResponse] = await Promise.all([
        api.get(`/inventory/admin/all?search=${inventorySearch}&categoryId=${inventoryCategoryFilter === 'all' ? '' : inventoryCategoryFilter}&lowStock=${lowStockOnly}&limit=50`).catch(err => ({ data: { success: false, data: { products: [] } } })),
        api.get('/inventory/admin/stats').catch(err => ({ data: { success: false, data: {} } }))
      ]);
      
      if (inventoryResponse.data && inventoryResponse.data.success) {
        const inventoryData = Array.isArray(inventoryResponse.data.data?.products) 
          ? inventoryResponse.data.data.products 
          : [];
        setInventoryItems(inventoryData);
      } else {
        setInventoryItems([]);
      }
      
      if (statsResponse.data && statsResponse.data.success) {
        setInventoryStats(statsResponse.data.data || {});
      } else {
        setInventoryStats({
          totalProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          totalValue: 0,
          categories: []
        });
      }
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      // Set empty data on error
      setInventoryItems([]);
      setInventoryStats({
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalValue: 0,
        categories: []
      });
    } finally {
      setInventoryLoading(false);
    }
  }, [inventorySearch, inventoryCategoryFilter, lowStockOnly]);

  // Load inventory when inventory tab becomes active
  useEffect(() => {
    if (activeTab === 'inventory' && user) {
      loadInventoryData();
    }
  }, [activeTab, user, loadInventoryData]);

  // Load CRM data
  const loadCrmData = useCallback(async () => {
    setCrmLoading(true);
    try {
      const [customersResponse, statsResponse] = await Promise.all([
        api.get(`/crm/admin/customers?search=${crmSearch}&segment=${crmSegmentFilter === 'all' ? '' : crmSegmentFilter}&limit=50`).catch(err => ({ data: { success: false, data: { customers: [] } } })),
        api.get('/crm/admin/stats').catch(err => ({ data: { success: false, data: {} } }))
      ]);
      
      if (customersResponse.data && customersResponse.data.success) {
        const customersData = Array.isArray(customersResponse.data.data?.customers) 
          ? customersResponse.data.data.customers 
          : [];
        setCrmCustomers(customersData);
      } else {
        setCrmCustomers([]);
      }
      
      if (statsResponse.data && statsResponse.data.success) {
        setCrmStats(statsResponse.data.data || {});
      } else {
        setCrmStats({
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomersThisMonth: 0,
          totalRevenue: 0,
          topCustomers: []
        });
      }
    } catch (error) {
      console.error('Failed to load CRM data:', error);
      // Set empty data on error
      setCrmCustomers([]);
      setCrmStats({
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomersThisMonth: 0,
        totalRevenue: 0,
        topCustomers: []
      });
    } finally {
      setCrmLoading(false);
    }
  }, [crmSearch, crmSegmentFilter]);

  // Load appointment data
  const loadAppointmentData = useCallback(async () => {
    setAppointmentLoading(true);
    try {
      const [appointmentsResponse, statsResponse] = await Promise.all([
        api.get('/appointments/admin/all').catch(err => ({ data: { success: false, data: { appointments: [] } } })),
        api.get('/appointments/admin/stats').catch(err => ({ data: { success: false, data: {} } }))
      ]);
      
      if (appointmentsResponse.data && appointmentsResponse.data.success) {
        const appointmentsData = Array.isArray(appointmentsResponse.data.data?.appointments) 
          ? appointmentsResponse.data.data.appointments 
          : [];
        setAppointments(appointmentsData);
      } else {
        setAppointments([]);
      }
      
      if (statsResponse.data && statsResponse.data.success) {
        setAppointmentStats(statsResponse.data.data || {
          total: 0,
          today: 0,
          pending: 0,
          availableSlots: 0
        });
      } else {
        setAppointmentStats({
          total: 0,
          today: 0,
          pending: 0,
          availableSlots: 0
        });
      }
    } catch (error) {
      console.error('Failed to load appointment data:', error);
      setAppointments([]);
      setAppointmentStats({
        total: 0,
        today: 0,
        pending: 0,
        availableSlots: 0
      });
    } finally {
      setAppointmentLoading(false);
    }
  }, []);

  // Schedule management functions
  const editTimeSlot = useCallback((slot) => {
    // Implementation for editing time slot
    console.log('Edit time slot:', slot);
  }, []);

  const deleteTimeSlot = useCallback((slot) => {
    setTimeSlots(prev => prev.filter(s => s !== slot));
  }, []);

  const editAppointmentType = useCallback((type) => {
    // Implementation for editing appointment type
    console.log('Edit appointment type:', type);
  }, []);

  const deleteAppointmentType = useCallback((id) => {
    setAppointmentTypes(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleWorkingDay = useCallback((dayName, enabled) => {
    setWorkingHours(prev => prev.map(day => 
      day.name === dayName ? { ...day, enabled } : day
    ));
  }, []);

  const exportSchedule = useCallback(async () => {
    try {
      const scheduleData = {
        timeSlots,
        appointmentTypes,
        workingHours,
        appointments: appointments.map(apt => ({
          patientName: apt.patientName,
          date: apt.date,
          time: apt.time,
          type: apt.type,
          status: apt.status
        }))
      };
      
      const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export schedule:', error);
    }
  }, [timeSlots, appointmentTypes, workingHours, appointments]);

  // WordPress management functions
  const testWordPressConnection = useCallback(async () => {
    setWordPressStatus(prev => ({ ...prev, testing: true }));
    try {
      const response = await api.get('/wordpress/test-connection');
      if (response.data.success) {
        setWordPressStatus(prev => ({ ...prev, connected: true }));
        toast({ title: 'WordPress Connected!', description: 'Successfully connected to WordPress API.' });
      } else {
        setWordPressStatus(prev => ({ ...prev, connected: false }));
        toast({ title: 'Connection Failed', description: 'Unable to connect to WordPress.', variant: 'destructive' });
      }
    } catch (error) {
      setWordPressStatus(prev => ({ ...prev, connected: false }));
      toast({ title: 'Connection Error', description: 'Failed to test WordPress connection.', variant: 'destructive' });
    } finally {
      setWordPressStatus(prev => ({ ...prev, testing: false }));
    }
  }, []);

  const syncWordPressPosts = useCallback(async () => {
    setWordPressStatus(prev => ({ ...prev, syncing: true }));
    try {
      const response = await api.post('/wordpress/sync-posts');
      if (response.data.success) {
        setWordPressStats(prev => ({ 
          ...prev, 
          lastSync: new Date().toLocaleString(),
          postCount: response.data.syncedPosts || prev.postCount
        }));
        toast({ title: 'Posts Synced!', description: `Successfully synced ${response.data.syncedPosts || 0} posts.` });
      }
    } catch (error) {
      toast({ title: 'Sync Failed', description: 'Failed to sync WordPress posts.', variant: 'destructive' });
    } finally {
      setWordPressStatus(prev => ({ ...prev, syncing: false }));
    }
  }, []);

  const clearWordPressCache = useCallback(async () => {
    try {
      await api.post('/wordpress/clear-cache');
      setWordPressStats(prev => ({ ...prev, cacheStatus: 'Cleared' }));
      toast({ title: 'Cache Cleared', description: 'WordPress cache has been cleared.' });
    } catch (error) {
      toast({ title: 'Cache Clear Failed', description: 'Failed to clear WordPress cache.', variant: 'destructive' });
    }
  }, []);

  // Settings functions
  const handleSaveSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      // Try to save to backend first
      try {
        await api.put('/admin/settings', settings);
        alert('Settings saved successfully!');
      } catch (backendError) {
        // If backend endpoint doesn't exist, save to localStorage as fallback
        if (backendError.response?.status === 404) {
          localStorage.setItem('admin-settings', JSON.stringify(settings));
          alert('Settings saved locally (backend endpoint not available)');
        } else {
          throw backendError; // Re-throw if it's a different error
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  }, [settings]);

  const handleExportSettings = useCallback(async () => {
    try {
      try {
        const response = await api.get('/admin/settings/export');
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settings-backup.json';
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (backendError) {
        // If backend endpoint doesn't exist, export from localStorage
        if (backendError.response?.status === 404) {
          const localSettings = localStorage.getItem('admin-settings');
          const settingsData = localSettings ? JSON.parse(localSettings) : settings;
          const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'settings-backup.json';
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          throw backendError;
        }
      }
    } catch (error) {
      console.error('Failed to export settings:', error);
      alert('Failed to export settings. Please try again.');
    }
  }, [settings]);

  const handleSecurityAudit = useCallback(async () => {
    try {
      const response = await api.get('/admin/security/audit');
      alert(`Security audit completed. Score: ${response.data.score}/100`);
    } catch (error) {
      console.error('Failed to run security audit:', error);
      alert('Failed to run security audit. Please try again.');
    }
  }, []);

  // Export data functions
  const handleExportData = useCallback(async (format: string, dataType: string) => {
    setExportLoading(true);
    try {
      const response = await api.get(`/admin/export/${format}?dataType=${dataType}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        // For Excel, we'll download as JSON for now (in production, you'd use a library like SheetJS)
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      alert(`${dataType} exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }, []);

  // Backup system function
  const handleBackupSystem = useCallback(async () => {
    setBackupLoading(true);
    try {
      const response = await api.post('/admin/backup');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('System backup created successfully!');
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setBackupLoading(false);
    }
  }, []);

  // Test notification function
  const handleTestNotification = useCallback(async () => {
    try {
      const message = prompt('Enter test notification message:', 'This is a test notification from the admin panel');
      if (message) {
        await api.post('/admin/test-notification', { message, type: 'info' });
        alert('Test notification sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('Failed to send test notification. Please try again.');
    }
  }, []);

  // Create new order function
  const handleCreateNewOrder = useCallback(async () => {
    try {
      const userId = prompt('Enter User ID for the new order:');
      if (!userId) return;

      const itemsInput = prompt('Enter order items (format: productId:quantity,productId:quantity):');
      if (!itemsInput) return;

      const items = itemsInput.split(',').map(item => {
        const [productId, quantity] = item.split(':');
        return { productId: parseInt(productId.trim()), quantity: parseInt(quantity.trim()) };
      });

      const shippingAddress = prompt('Enter shipping address (optional):') || '';
      const notes = prompt('Enter order notes (optional):') || '';

      const response = await api.post('/orders/admin/create', {
        userId: parseInt(userId),
        items,
        shippingAddress,
        notes
      });

      if (response.data.success) {
        alert('New order created successfully!');
        // Refresh orders data
        if (activeTab === 'orders') {
          loadOrdersData();
        }
      }
    } catch (error) {
      console.error('Failed to create new order:', error);
      alert('Failed to create new order. Please try again.');
    }
  }, [activeTab, loadOrdersData]);

  // Create new refill function
  const handleCreateNewRefill = useCallback(async () => {
    try {
      const userId = prompt('Enter User ID for the new refill request:');
      if (!userId) return;

      const medicationName = prompt('Enter medication name:');
      if (!medicationName) return;

      const prescriptionNumber = prompt('Enter prescription number:');
      if (!prescriptionNumber) return;

      const quantity = prompt('Enter quantity:');
      if (!quantity) return;

      const dosage = prompt('Enter dosage (optional):') || '';
      const instructions = prompt('Enter instructions (optional):') || '';

      const response = await api.post('/refill-requests/admin/create', {
        userId: parseInt(userId),
        medicationName,
        prescriptionNumber,
        quantity: parseInt(quantity),
        dosage,
        instructions
      });

      if (response.data.success) {
        alert('New refill request created successfully!');
        // Refresh refills data
        if (activeTab === 'refills') {
          loadRefillsData();
        }
      }
    } catch (error) {
      console.error('Failed to create new refill request:', error);
      alert('Failed to create new refill request. Please try again.');
    }
  }, [activeTab, loadRefillsData]);

  // Create new transfer function
  const handleCreateNewTransfer = useCallback(async () => {
    try {
      const userId = prompt('Enter User ID for the new transfer request:');
      if (!userId) return;

      const fromPharmacy = prompt('Enter from pharmacy name:');
      if (!fromPharmacy) return;

      const toPharmacy = prompt('Enter to pharmacy name:');
      if (!toPharmacy) return;

      const medicationName = prompt('Enter medication name:');
      if (!medicationName) return;

      const prescriptionNumber = prompt('Enter prescription number:');
      if (!prescriptionNumber) return;

      const quantity = prompt('Enter quantity:');
      if (!quantity) return;

      const dosage = prompt('Enter dosage (optional):') || '';
      const reason = prompt('Enter reason for transfer (optional):') || '';

      const response = await api.post('/transfer-requests/admin/create', {
        userId: parseInt(userId),
        fromPharmacy,
        toPharmacy,
        medicationName,
        prescriptionNumber,
        quantity: parseInt(quantity),
        dosage,
        reason
      });

      if (response.data.success) {
        alert('New transfer request created successfully!');
        // Refresh transfers data
        if (activeTab === 'transfers') {
          loadTransfersData();
        }
      }
    } catch (error) {
      console.error('Failed to create new transfer request:', error);
      alert('Failed to create new transfer request. Please try again.');
    }
  }, [activeTab, loadTransfersData]);

  // Load delivery orders for map
  const loadDeliveryOrders = useCallback(async () => {
    setDeliveryLoading(true);
    try {
      const response = await api.get('/admin/delivery-orders');
      if (response.data.success) {
        setDeliveryOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load delivery orders:', error);
    } finally {
      setDeliveryLoading(false);
    }
  }, []);

  // Load delivery orders when delivery-map tab becomes active
  useEffect(() => {
    if (activeTab === 'delivery-map' && user) {
      loadDeliveryOrders();
    }
  }, [activeTab, user, loadDeliveryOrders]);

  // Load delivery settings
  const loadDeliverySettings = useCallback(async () => {
    try {
      // Try to load from localStorage first (for immediate functionality)
      const savedSettings = localStorage.getItem('delivery-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDeliveryFees(settings);
        setDeliveryZones(settings.deliveryZones || []);
        // Update temp form state if dialog is open
        if (showDeliveryFeesDialog) {
          setTempFreeThreshold(settings.freeDeliveryThreshold || 25);
          setTempStandardFee(settings.standardDeliveryFee || 5.00);
          setTempSameDayFee(settings.sameDayDeliveryFee || 3.00);
          setTempFreeText(settings.freeDeliveryText || 'Free');
          setTempCurrency(settings.currency || '$');
        }
        return;
      }

      // Fallback to API if localStorage is empty
      const response = await api.get('/api/admin/delivery-settings');
      if (response.data.success) {
        setDeliveryFees(response.data.data);
        setDeliveryZones(response.data.data.deliveryZones || []);
        // Update temp form state if dialog is open
        if (showDeliveryFeesDialog) {
          setTempFreeThreshold(response.data.data.freeDeliveryThreshold || 25);
          setTempStandardFee(response.data.data.standardDeliveryFee || 5.00);
          setTempSameDayFee(response.data.data.sameDayDeliveryFee || 3.00);
          setTempFreeText(response.data.data.freeDeliveryText || 'Free');
          setTempCurrency(response.data.data.currency || '$');
        }
        // Save to localStorage for future use
        localStorage.setItem('delivery-settings', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Failed to load delivery settings:', error);
      // Keep default values if loading fails
    }
  }, [showDeliveryFeesDialog]);

  // Load delivery settings on component mount
  useEffect(() => {
    if (user) {
      loadDeliverySettings();
    }
  }, [user, loadDeliverySettings]);

  // Delivery Zone handlers
  const handleAddZone = useCallback(() => {
    setShowAddZoneDialog(true);
  }, []);

  const handleSaveZone = useCallback(async () => {
    if (!newZone.name || !newZone.radius) {
      alert('Please fill in zone name and radius');
      return;
    }

    const zone = {
      id: deliveryZones.length + 1,
      ...newZone
    };

    const updatedZones = [...deliveryZones, zone];
    setDeliveryZones(updatedZones);
    
    // Save to localStorage immediately
    const settingsToSave = {
      ...deliveryFees,
      deliveryZones: updatedZones
    };
    localStorage.setItem('delivery-settings', JSON.stringify(settingsToSave));
    
    // Try to save to backend as well
    try {
      const response = await api.put('/api/admin/delivery-settings', settingsToSave);
      if (response.data.success) {
        console.log('Zone saved to backend successfully');
      }
    } catch (backendError) {
      console.warn('Backend save failed, but zone saved locally:', backendError);
    }

    setShowAddZoneDialog(false);
    setNewZone({
      name: '',
      radius: '',
      status: 'Active',
      color: 'green',
      description: ''
    });
    alert('Delivery zone added successfully!');
  }, [newZone, deliveryFees]);

  const handleDeleteZone = useCallback(async (zoneId: number) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      const updatedZones = deliveryZones.filter(zone => zone.id !== zoneId);
      setDeliveryZones(updatedZones);
      
      // Save to localStorage immediately
      const settingsToSave = {
        ...deliveryFees,
        deliveryZones: updatedZones
      };
      localStorage.setItem('delivery-settings', JSON.stringify(settingsToSave));
      
      // Try to save to backend as well
      try {
        const response = await api.put('/api/admin/delivery-settings', settingsToSave);
        if (response.data.success) {
          console.log('Zone deletion saved to backend successfully');
        }
      } catch (backendError) {
        console.warn('Backend save failed, but zone deletion saved locally:', backendError);
      }

      alert('Delivery zone deleted successfully!');
    }
  }, [deliveryZones, deliveryFees]);

  const handleEditZone = useCallback(async (zoneId: number) => {
    const zone = deliveryZones.find(z => z.id === zoneId);
    if (zone) {
      const newName = prompt('Enter new zone name:', zone.name);
      if (newName && newName !== zone.name) {
        const updatedZones = deliveryZones.map(z => 
          z.id === zoneId ? { ...z, name: newName } : z
        );
        setDeliveryZones(updatedZones);
        
        // Save to localStorage immediately
        const settingsToSave = {
          ...deliveryFees,
          deliveryZones: updatedZones
        };
        localStorage.setItem('delivery-settings', JSON.stringify(settingsToSave));
        
        // Try to save to backend as well
        try {
          const response = await api.put('/api/admin/delivery-settings', settingsToSave);
          if (response.data.success) {
            console.log('Zone update saved to backend successfully');
          }
        } catch (backendError) {
          console.warn('Backend save failed, but zone update saved locally:', backendError);
        }

        alert('Zone updated successfully!');
      }
    }
  }, [deliveryZones, deliveryFees]);

  // Delivery Fees handlers
  const handleEditDeliveryFees = useCallback(() => {
    // Copy current values to temporary form state when opening
    console.log('Opening delivery fees dialog with values:', deliveryFees);
    setTempFreeThreshold(deliveryFees.freeDeliveryThreshold);
    setTempStandardFee(deliveryFees.standardDeliveryFee);
    setTempSameDayFee(deliveryFees.sameDayDeliveryFee);
    setTempFreeText(deliveryFees.freeDeliveryText);
    setTempCurrency(deliveryFees.currency);
    setDeliveryFeesChanged(false);
    setShowDeliveryFeesDialog(true);
  }, [deliveryFees]);

  const handleCancelDeliveryFees = useCallback(() => {
    // Reset form state to current display values
    setTempFreeThreshold(deliveryFees.freeDeliveryThreshold);
    setTempStandardFee(deliveryFees.standardDeliveryFee);
    setTempSameDayFee(deliveryFees.sameDayDeliveryFee);
    setTempFreeText(deliveryFees.freeDeliveryText);
    setTempCurrency(deliveryFees.currency);
    setDeliveryFeesChanged(false);
    setShowDeliveryFeesDialog(false);
  }, [deliveryFees]);

  const handleSaveDeliveryFees = useCallback(async () => {
    if (tempFreeThreshold < 0 || tempStandardFee < 0 || tempSameDayFee < 0) {
      alert('Delivery fees cannot be negative');
      return;
    }
    
    try {
      // Create new settings object from temp values
      const newSettings = {
        freeDeliveryThreshold: tempFreeThreshold,
        standardDeliveryFee: tempStandardFee,
        sameDayDeliveryFee: tempSameDayFee,
        freeDeliveryText: tempFreeText,
        currency: tempCurrency,
        deliveryZones: deliveryZones
      };
      
      // Save to localStorage immediately (for instant functionality)
      localStorage.setItem('delivery-settings', JSON.stringify(newSettings));
      
      // Update display state with temp values
      setDeliveryFees({
        freeDeliveryThreshold: tempFreeThreshold,
        standardDeliveryFee: tempStandardFee,
        sameDayDeliveryFee: tempSameDayFee,
        freeDeliveryText: tempFreeText,
        currency: tempCurrency
      });
      
      // Try to save to backend as well (but don't fail if backend is down)
      try {
        const response = await api.put('/api/admin/delivery-settings', newSettings);
        if (response.data.success) {
          console.log('Settings saved to backend successfully');
        }
      } catch (backendError) {
        console.warn('Backend save failed, but settings saved locally:', backendError);
      }

      setDeliveryFeesChanged(false);
      setShowDeliveryFeesDialog(false);
      alert('Delivery settings updated successfully!');
    } catch (error) {
      console.error('Failed to save delivery settings:', error);
      alert('Failed to save delivery settings. Please try again.');
    }
  }, [tempFreeThreshold, tempStandardFee, tempSameDayFee, tempFreeText, tempCurrency, deliveryZones]);

  // Load CRM when CRM tab becomes active
  useEffect(() => {
    if (activeTab === 'crm' && user) {
      loadCrmData();
    }
  }, [activeTab, user, loadCrmData]);

  // Load appointment data when scheduling tab becomes active
  useEffect(() => {
    if (activeTab === 'scheduling' && user) {
      loadAppointmentData();
    }
  }, [activeTab, user, loadAppointmentData]);

  // Session timeout warning
  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      setShowSessionWarning(true);
    }, 25 * 60 * 1000); // Show warning 5 minutes before session expires

    return () => clearTimeout(sessionTimeout);
  }, []);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      await adminAuth.getCurrentUser();
      setShowSessionWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      navigate('/admin-signin');
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await adminAuth.logout();
      navigate('/admin-signin');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin-signin');
    }
  }, [navigate]);

  // Order management functions
  const handleUpdateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status });
      await loadOrdersData(); // Refresh data
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  }, [loadOrdersData]);

  const handleCancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      await api.put(`/orders/admin/${orderId}/cancel`, { reason });
      await loadOrdersData(); // Refresh data
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    }
  }, [loadOrdersData]);

  const handleExportOrders = useCallback(async (format = 'csv') => {
    try {
      const response = await api.get(`/orders/admin/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export orders:', error);
      alert('Failed to export orders');
    }
  }, []);

  // Refill management functions
  const handleUpdateRefillStatus = useCallback(async (refillId: string, status: string) => {
    try {
      await api.put(`/refill-requests/${refillId}`, { status });
      await loadRefillsData(); // Refresh data
    } catch (error) {
      console.error('Failed to update refill status:', error);
      alert('Failed to update refill status');
    }
  }, [loadRefillsData]);

  const handleDeleteRefill = useCallback(async (refillId: string) => {
    if (!confirm('Are you sure you want to delete this refill request?')) {
      return;
    }
    
    try {
      await api.delete(`/refill-requests/${refillId}`);
      await loadRefillsData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete refill request:', error);
      alert('Failed to delete refill request');
    }
  }, [loadRefillsData]);

  // Transfer management functions
  const handleUpdateTransferStatus = useCallback(async (transferId: string, status: string) => {
    try {
      await api.put(`/transfer-requests/${transferId}`, { status });
      await loadTransfersData(); // Refresh data
    } catch (error) {
      console.error('Failed to update transfer status:', error);
      alert('Failed to update transfer status');
    }
  }, [loadTransfersData]);

  const handleDeleteTransfer = useCallback(async (transferId: string) => {
    if (!confirm('Are you sure you want to delete this transfer request?')) {
      return;
    }
    
    try {
      await api.delete(`/transfer-requests/${transferId}`);
      await loadTransfersData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete transfer request:', error);
      alert('Failed to delete transfer request');
    }
  }, [loadTransfersData]);

  // Contact management functions
  const handleMarkContactAsRead = useCallback(async (contactId: string) => {
    try {
      await api.put(`/contact/${contactId}/read`);
      await loadContactsData(); // Refresh data
    } catch (error) {
      console.error('Failed to mark contact as read:', error);
      alert('Failed to mark contact as read');
    }
  }, [loadContactsData]);

  const handleDeleteContact = useCallback(async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact request?')) {
      return;
    }
    
    try {
      await api.delete(`/contact/${contactId}`);
      await loadContactsData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete contact request:', error);
      alert('Failed to delete contact request');
    }
  }, [loadContactsData]);

  // Notification management functions
  const handleMarkNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      await loadNotificationsData(); // Refresh data
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      alert('Failed to mark notification as read');
    }
  }, [loadNotificationsData]);

  const handleMarkAllNotificationsAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      await loadNotificationsData(); // Refresh data
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      alert('Failed to mark all notifications as read');
    }
  }, [loadNotificationsData]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await api.delete(`/notifications/${notificationId}`);
      await loadNotificationsData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  }, [loadNotificationsData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#57BBB6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Admin Dashboard - My Meds Pharmacy"
        description="Admin dashboard for managing pharmacy operations, orders, and customer data."
        keywords="admin, dashboard, pharmacy, management, orders, customers"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header 
          onRefillClick={() => {}}
          onAppointmentClick={() => {}}
          onTransferClick={() => {}}
        />
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <img src={logo} alt="My Meds Pharmacy" className="h-8 w-8" />
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              
              <div className="space-y-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#57BBB6] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Authenticated</span>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData ? dashboardData.statistics?.totalUsers || 0 : '...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                      <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData ? dashboardData.statistics?.totalPrescriptions || 0 : '...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData ? dashboardData.statistics?.totalAppointments || 0 : '...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Orders</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData ? dashboardData.statistics?.totalOrders || 0 : '...'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                {dashboardData?.recentActivity && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(dashboardData.recentActivity.users || []).slice(0, 5).map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <Badge variant="outline">{user.role}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Appointments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(dashboardData.recentActivity.appointments || []).slice(0, 5).map((appointment: any) => (
                            <div key={appointment.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{appointment.patientName}</p>
                                <p className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()}</p>
                              </div>
                              <Badge variant={
                                appointment.status === 'CONFIRMED' ? 'default' :
                                appointment.status === 'PENDING' ? 'secondary' : 'outline'
                              }>
                                {appointment.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">
                        Database: {dashboardData?.systemHealth?.database || 'Loading...'}
                      </span>
                      <span className="text-sm text-gray-500 ml-4">
                        Uptime: {dashboardData?.systemHealth?.uptime 
                          ? `${Math.floor(dashboardData.systemHealth.uptime / 60)} minutes`
                          : 'Loading...'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other tabs - simplified placeholders */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <AnalyticsDashboard 
                  data={{
                    orders: orders || [],
                    revenue: orderStats?.revenueData || [],
                    customers: crmCustomers || [],
                    products: inventoryItems || [],
                    monthlyStats: orderStats?.monthlyStats || [],
                    topProducts: inventoryStats?.topProducts || [],
                    customerSegments: crmStats?.customerSegments || []
                  }}
                  timeRange="30d"
                  onTimeRangeChange={(range) => {
                    // Real functionality - could trigger data refresh with new time range
                    console.log('Analytics time range changed:', range);
                  }}
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                  <Button 
                    className="bg-[#57BBB6] hover:bg-[#376F6B]"
                    onClick={handleCreateNewOrder}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </div>

                {/* Order Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
                      <p className="text-xs text-muted-foreground">+{orderStats?.periodStats?.today || 0} today</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orderStats?.statusBreakdown?.pending || 0}</div>
                      <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Processing</CardTitle>
                      <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orderStats?.statusBreakdown?.processing || 0}</div>
                      <p className="text-xs text-muted-foreground">Being prepared</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orderStats?.statusBreakdown?.delivered || 0}</div>
                      <p className="text-xs text-muted-foreground">Successfully delivered</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Orders</CardTitle>
                      <div className="flex items-center space-x-4">
                        <Input
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="max-w-sm"
                        />
                        <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={() => handleExportOrders('csv')}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57BBB6]"></div>
                                <span className="ml-2">Loading orders...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No orders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          (orders || []).map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.orderNumber}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{order.guestName}</p>
                                  <p className="text-sm text-gray-500">{order.guestEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{order.items?.length || 0} items</p>
                                  <p className="text-xs text-gray-500">
                                    {(order.items || []).slice(0, 2).map((item: any) => item.productName).join(', ')}
                                    {order.items?.length > 2 && '...'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    order.status === 'PENDING' ? 'destructive' :
                                    order.status === 'PROCESSING' ? 'default' :
                                    order.status === 'SHIPPED' ? 'secondary' :
                                    order.status === 'DELIVERED' ? 'outline' : 'secondary'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {order.status === 'PENDING' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {order.status === 'PROCESSING' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Package className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCancelOrder(order.id, 'Cancelled by admin')}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Refill Requests Tab */}
            {activeTab === 'refills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Refill Requests</h2>
                  <Button 
                    className="bg-[#57BBB6] hover:bg-[#376F6B]"
                    onClick={handleCreateNewRefill}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Refill
                  </Button>
                </div>

                {/* Refill Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                      <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{refillStats?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{refillStats?.pending || 0}</div>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{refillStats?.approved || 0}</div>
                      <p className="text-xs text-muted-foreground">Ready for pickup</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{refillStats?.completed || 0}</div>
                      <p className="text-xs text-muted-foreground">Picked up</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Refill Requests</CardTitle>
                      <div className="flex items-center space-x-4">
                        <Input
                          placeholder="Search refills..."
                          className="max-w-sm"
                        />
                        <Select value={refillStatusFilter} onValueChange={setRefillStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Medication</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Urgency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {refillsLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57BBB6]"></div>
                                <span className="ml-2">Loading refill requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : refillRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              No refill requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          (refillRequests || []).map((refill: any) => (
                            <TableRow key={refill.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{refill.user?.name || 'Unknown Patient'}</p>
                                  <p className="text-sm text-gray-500">{refill.user?.email || 'No email'}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{refill.medication}</TableCell>
                              <TableCell>{refill.dosage}</TableCell>
                              <TableCell>{refill.quantity} tablets</TableCell>
                              <TableCell>
                                <Badge variant={
                                  refill.urgency === 'urgent' ? 'destructive' :
                                  refill.urgency === 'normal' ? 'outline' : 'secondary'
                                }>
                                  {refill.urgency}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  refill.status === 'pending' ? 'destructive' :
                                  refill.status === 'approved' ? 'default' :
                                  refill.status === 'completed' ? 'outline' : 'secondary'
                                }>
                                  {refill.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(refill.requestedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`/admin/refills/${refill.id}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {refill.status === 'pending' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateRefillStatus(refill.id, 'approved')}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {refill.status === 'approved' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateRefillStatus(refill.id, 'completed')}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Package className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteRefill(refill.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Transfer Requests Tab */}
            {activeTab === 'transfers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Transfer Requests</h2>
                  <Button 
                    className="bg-[#57BBB6] hover:bg-[#376F6B]"
                    onClick={handleCreateNewTransfer}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Transfer
                  </Button>
                </div>

                {/* Transfer Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transferStats?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transferStats?.pending || 0}</div>
                      <p className="text-xs text-muted-foreground">Awaiting verification</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                      <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transferStats?.approved || 0}</div>
                      <p className="text-xs text-muted-foreground">Being processed</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transferStats?.completed || 0}</div>
                      <p className="text-xs text-muted-foreground">Successfully transferred</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Prescription Transfers</CardTitle>
                      <div className="flex items-center space-x-4">
                        <Input
                          placeholder="Search transfers..."
                          className="max-w-sm"
                        />
                        <Select value={transferStatusFilter} onValueChange={setTransferStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>From Pharmacy</TableHead>
                          <TableHead>Medications</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transfersLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57BBB6]"></div>
                                <span className="ml-2">Loading transfer requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : transferRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No transfer requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          (transferRequests || []).map((transfer: any) => (
                            <TableRow key={transfer.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{transfer.user?.name || 'Unknown Patient'}</p>
                                  <p className="text-sm text-gray-500">{transfer.user?.email || 'No email'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{transfer.fromPharmacy || transfer.currentPharmacy}</p>
                                  <p className="text-sm text-gray-500">Transfer to MyMeds</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{transfer.medication}</p>
                                  <p className="text-sm text-gray-500">
                                    {Array.isArray(transfer.medications) 
                                      ? transfer.medications.slice(0, 2).join(', ')
                                      : transfer.medications?.slice(0, 50) + '...' || 'Multiple medications'
                                    }
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  transfer.status === 'pending' ? 'destructive' :
                                  transfer.status === 'approved' ? 'default' :
                                  transfer.status === 'completed' ? 'outline' : 'secondary'
                                }>
                                  {transfer.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(transfer.requestedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`/admin/transfers/${transfer.id}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {transfer.status === 'pending' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateTransferStatus(transfer.id, 'approved')}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {transfer.status === 'approved' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateTransferStatus(transfer.id, 'completed')}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Package className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteTransfer(transfer.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Contact Requests Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Contact Requests</h2>

                {/* Contact Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contactStats?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unread</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contactStats?.unread || 0}</div>
                      <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today</CardTitle>
                      <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contactStats?.today || 0}</div>
                      <p className="text-xs text-muted-foreground">New today</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Week</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contactStats?.thisWeek || 0}</div>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Customer Inquiries</CardTitle>
                      <div className="flex items-center space-x-4">
                        <Input
                          placeholder="Search inquiries..."
                          className="max-w-sm"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Message Preview</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactsLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57BBB6]"></div>
                                <span className="ml-2">Loading contact requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : contacts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No contact requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          (contacts || []).map((contact: any) => (
                            <TableRow key={contact.id}>
                              <TableCell className="font-medium">{contact.name}</TableCell>
                              <TableCell>{contact.email}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{contact.subject}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-gray-500 max-w-xs truncate">
                                    {contact.message?.split('\n')[1] || contact.message?.substring(0, 100) + '...' || 'No message preview'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={contact.notified ? 'outline' : 'destructive'}>
                                  {contact.notified ? 'Read' : 'Unread'}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(contact.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`/admin/contacts/${contact.id}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {!contact.notified && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleMarkContactAsRead(contact.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Delivery Map Tab */}
            {activeTab === 'delivery-map' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Delivery Map Management</h2>

                {/* Delivery Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Delivery Zones</CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{deliveryZones.length}</div>
                      <p className="text-xs text-muted-foreground">Active zones</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
                      <Navigation className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">15 mi</div>
                      <p className="text-xs text-muted-foreground">Radius coverage</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                      <Truck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{deliveryOrders.length}</div>
                      <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">45m</div>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Interactive Delivery Map */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Coverage Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-[400px] rounded-lg overflow-hidden border">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.5!2d-73.9857!3d40.7589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2590f9b3d6b3b%3A0x1c7b1c7b1c7b1c7b!2sMy%20Meds%20Pharmacy%20Inc%2C%202242%2065th%20St%2C%20New%20York%2011204!5e0!3m2!1sen!2sus!4v1234567890"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Delivery Coverage Map"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Zone Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Zones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {deliveryZones.map((zone) => {
                          const colorClasses = {
                            green: 'bg-green-50 border-green-200 text-green-900',
                            blue: 'bg-blue-50 border-blue-200 text-blue-900',
                            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
                            red: 'bg-red-50 border-red-200 text-red-900',
                            purple: 'bg-purple-50 border-purple-200 text-purple-900'
                          };
                          const badgeClasses = {
                            green: 'bg-green-100 text-green-800',
                            blue: 'bg-blue-100 text-blue-800',
                            yellow: 'bg-yellow-100 text-yellow-800',
                            red: 'bg-red-100 text-red-800',
                            purple: 'bg-purple-100 text-purple-800'
                          };
                          const dotClasses = {
                            green: 'bg-green-500',
                            blue: 'bg-blue-500',
                            yellow: 'bg-yellow-500',
                            red: 'bg-red-500',
                            purple: 'bg-purple-500'
                          };

                          return (
                            <div key={zone.id} className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses[zone.color as keyof typeof colorClasses]}`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${dotClasses[zone.color as keyof typeof dotClasses]}`}></div>
                                <div>
                                  <p className={`font-medium ${colorClasses[zone.color as keyof typeof colorClasses].split(' ')[2]}`}>
                                    {zone.name}
                                  </p>
                                  <p className={`text-sm ${colorClasses[zone.color as keyof typeof colorClasses].split(' ')[2].replace('900', '600')}`}>
                                    {zone.radius} radius
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={badgeClasses[zone.color as keyof typeof badgeClasses]}>
                                  {zone.status}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditZone(zone.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <Button 
                          className="w-full mt-4 bg-[#57BBB6] hover:bg-[#376F6B]"
                          onClick={handleAddZone}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Zone
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Delivery Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Active Delivery Orders</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadDeliveryOrders}
                        disabled={deliveryLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${deliveryLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deliveryLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#57BBB6] mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading delivery orders...</p>
                      </div>
                    ) : deliveryOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active delivery orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {deliveryOrders.map((order: any) => (
                            <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                                  <p className="text-sm text-gray-600">{order.user?.name || 'Unknown Customer'}</p>
                                </div>
                                <Badge 
                                  className={`${
                                    order.deliveryStatus === 'IN_TRANSIT' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {order.deliveryStatus === 'IN_TRANSIT' ? 'In Transit' : 'Preparing'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{order.shippingAddress}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    {order.items?.length || 0} items • ${order.total?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Navigation className="h-4 w-4 text-blue-500" />
                                  <span className="text-blue-600 text-xs">
                                    Lat: {order.coordinates?.lat?.toFixed(4)} • Lng: {order.coordinates?.lng?.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`https://www.google.com/maps?q=${order.coordinates?.lat},${order.coordinates?.lng}`, '_blank')}
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  View Map
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.coordinates?.lat},${order.coordinates?.lng}`, '_blank')}
                                >
                                  <Navigation className="h-3 w-3 mr-1" />
                                  Directions
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Delivery Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Delivery Hours</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Monday - Friday</span>
                            <span className="text-sm font-medium">9:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Saturday</span>
                            <span className="text-sm font-medium">9:00 AM - 4:00 PM</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Sunday</span>
                            <span className="text-sm font-medium text-red-600">Closed</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">Delivery Fees</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditDeliveryFees}
                            className="h-8 px-3"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Orders over {deliveryFees.currency}{deliveryFees.freeDeliveryThreshold}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {deliveryFees.freeDeliveryText}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Orders under {deliveryFees.currency}{deliveryFees.freeDeliveryThreshold}
                            </span>
                            <span className="text-sm font-medium">
                              {deliveryFees.currency}{deliveryFees.standardDeliveryFee.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Same-day delivery</span>
                            <span className="text-sm font-medium">
                              {deliveryFees.currency}{deliveryFees.sameDayDeliveryFee.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>

                {/* Notification Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notificationStats?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unread</CardTitle>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notificationStats?.unread || 0}</div>
                      <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today</CardTitle>
                      <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notificationStats?.today || 0}</div>
                      <p className="text-xs text-muted-foreground">New today</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Week</CardTitle>
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notificationStats?.thisWeek || 0}</div>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Notifications */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Recent Notifications</CardTitle>
                          <div className="flex items-center space-x-4">
                            <Input
                              placeholder="Search notifications..."
                              className="max-w-sm"
                            />
                            <Select value={notificationTypeFilter} onValueChange={setNotificationTypeFilter}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="ORDER">Orders</SelectItem>
                                <SelectItem value="APPOINTMENT">Appointments</SelectItem>
                                <SelectItem value="PRESCRIPTION">Prescriptions</SelectItem>
                                <SelectItem value="CONTACT">Contact</SelectItem>
                                <SelectItem value="INVENTORY">Inventory</SelectItem>
                                <SelectItem value="PAYMENT">Payment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {notificationsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57BBB6]"></div>
                            <span className="ml-2">Loading notifications...</span>
                          </div>
                        ) : adminNotifications.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No notifications found
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(adminNotifications || []).map((notification: any) => (
                              <div 
                                key={notification.id} 
                                className={`flex items-start space-x-4 p-4 border rounded-lg ${
                                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    notification.type === 'ORDER' ? 'bg-blue-100' :
                                    notification.type === 'APPOINTMENT' ? 'bg-green-100' :
                                    notification.type === 'PRESCRIPTION' ? 'bg-purple-100' :
                                    notification.type === 'CONTACT' ? 'bg-orange-100' :
                                    notification.type === 'INVENTORY' ? 'bg-yellow-100' :
                                    notification.type === 'PAYMENT' ? 'bg-green-100' :
                                    'bg-gray-100'
                                  }`}>
                                    {notification.type === 'ORDER' ? <Package className="h-4 w-4 text-blue-600" /> :
                                     notification.type === 'APPOINTMENT' ? <Calendar className="h-4 w-4 text-green-600" /> :
                                     notification.type === 'PRESCRIPTION' ? <Pill className="h-4 w-4 text-purple-600" /> :
                                     notification.type === 'CONTACT' ? <MessageSquare className="h-4 w-4 text-orange-600" /> :
                                     notification.type === 'INVENTORY' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                                     notification.type === 'PAYMENT' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                                     <Bell className="h-4 w-4 text-gray-600" />
                                    }
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-500">{notification.message}</p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 flex space-x-2">
                                  {!notification.read && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Notification Types & Actions */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(notificationStats?.typeCounts || []).map((typeCount: any) => (
                            <div key={typeCount.type} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  typeCount.type === 'ORDER' ? 'bg-blue-500' :
                                  typeCount.type === 'APPOINTMENT' ? 'bg-green-500' :
                                  typeCount.type === 'PRESCRIPTION' ? 'bg-purple-500' :
                                  typeCount.type === 'CONTACT' ? 'bg-orange-500' :
                                  typeCount.type === 'INVENTORY' ? 'bg-yellow-500' :
                                  typeCount.type === 'PAYMENT' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <span className="text-sm">{typeCount.type}</span>
                              </div>
                              <span className="text-sm font-medium">{typeCount._count.type}</span>
                            </div>
                          )) || (
                            <div className="text-center text-gray-500 py-4">
                              No notification types found
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={handleMarkAllNotificationsAsRead}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark All as Read
                          </Button>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={handleTestNotification}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Test Notification
                          </Button>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => alert('Notification settings will be implemented in a future update. For now, notifications are managed through the main settings.')}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Notification Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                  <div className="flex space-x-4">
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Inventory Stats */}
                {inventoryStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</p>
                          </div>
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStockProducts}</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockProducts}</p>
                          </div>
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Value</p>
                            <p className="text-2xl font-bold text-green-600">${inventoryStats.totalValue?.toFixed(2) || '0.00'}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search products..."
                          value={inventorySearch}
                          onChange={(e) => setInventorySearch(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={inventoryCategoryFilter} onValueChange={setInventoryCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {inventoryStats?.categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name} ({category._count.products})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="low-stock"
                          checked={lowStockOnly}
                          onCheckedChange={(checked) => setLowStockOnly(checked === true)}
                        />
                        <label htmlFor="low-stock" className="text-sm font-medium">
                          Low Stock Only
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {inventoryLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Last Updated</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(inventoryItems || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                  No products found
                                </TableCell>
                              </TableRow>
                            ) : (
                              (inventoryItems || []).map((product: any) => (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{product.name}</p>
                                      <p className="text-sm text-gray-500">{product.description}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{product.category?.name}</TableCell>
                                  <TableCell className="font-medium">${product.price?.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <span className={`
                                        px-2 py-1 rounded-full text-xs font-medium
                                        ${product.stock === 0 ? 'bg-red-100 text-red-800' :
                                          product.stock <= 10 ? 'bg-orange-100 text-orange-800' :
                                          'bg-green-100 text-green-800'}
                                      `}>
                                        {product.stock}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      product.stock === 0 ? 'destructive' :
                                      product.stock <= 10 ? 'secondary' :
                                      'default'
                                    }>
                                      {product.stock === 0 ? 'Out of Stock' :
                                       product.stock <= 10 ? 'Low Stock' :
                                       'In Stock'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{new Date(product.updatedAt).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CRM Tab */}
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Relationship Management</h2>
                  <div className="flex space-x-4">
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* CRM Stats */}
                {crmStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{crmStats.totalCustomers}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Customers</p>
                            <p className="text-2xl font-bold text-green-600">{crmStats.activeCustomers}</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">New This Month</p>
                            <p className="text-2xl font-bold text-purple-600">{crmStats.newCustomersThisMonth}</p>
                          </div>
                          <Plus className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">${crmStats.totalRevenue?.toFixed(2) || '0.00'}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Customer Search and Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search customers..."
                          value={crmSearch}
                          onChange={(e) => setCrmSearch(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={crmSegmentFilter} onValueChange={setCrmSegmentFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="All Segments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Segments</SelectItem>
                          <SelectItem value="new">New Customers</SelectItem>
                          <SelectItem value="regular">Regular Customers</SelectItem>
                          <SelectItem value="frequent">Frequent Customers</SelectItem>
                          <SelectItem value="vip">VIP Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {crmLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Orders</TableHead>
                              <TableHead>Total Spent</TableHead>
                              <TableHead>Last Order</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(crmCustomers || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                  No customers found
                                </TableCell>
                              </TableRow>
                            ) : (
                              (crmCustomers || []).map((customer: any) => (
                                <TableRow key={customer.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{customer.name || 'Unknown'}</p>
                                      <p className="text-sm text-gray-500">ID: {customer.id}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="text-sm">{customer.email}</p>
                                      <p className="text-sm text-gray-500">{customer.phone || 'No phone'}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-center">
                                      <p className="font-medium">{customer._count?.orders || 0}</p>
                                      <p className="text-xs text-gray-500">
                                        {customer._count?.prescriptions || 0} prescriptions
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">${customer.totalSpent?.toFixed(2) || '0.00'}</TableCell>
                                  <TableCell>
                                    {customer.lastOrder ? (
                                      <div>
                                        <p className="text-sm">{new Date(customer.lastOrder.createdAt).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-500">{customer.lastOrder.status}</p>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No orders</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                                      {customer.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Customers */}
                {crmStats?.topCustomers && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(crmStats.topCustomers || []).map((customer: any, index: number) => (
                          <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{customer.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{customer._count?.orders || 0} orders</p>
                              <p className="text-sm text-gray-500">${customer.totalSpent?.toFixed(2) || '0.00'} spent</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Scheduling Tab */}
            {activeTab === 'scheduling' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Appointment Scheduling</h2>
                  <div className="flex space-x-4">
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Scheduling Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                          <p className="text-2xl font-bold text-gray-900">{appointmentStats.total}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                          <p className="text-2xl font-bold text-green-600">{appointmentStats.today}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                          <p className="text-2xl font-bold text-orange-600">{appointmentStats.pending}</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Available Slots</p>
                          <p className="text-2xl font-bold text-purple-600">{appointmentStats.availableSlots}</p>
                        </div>
                        <Plus className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Appointment Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointmentLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#57BBB6] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading appointments...</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No appointments scheduled yet</p>
                        <p className="text-sm">Appointments will appear here once patients book them</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(appointments || []).map((appointment: any) => (
                          <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">{appointment.patientName}</p>
                                <p className="text-sm text-gray-500">{appointment.email}</p>
                                <p className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Schedule Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Schedule Management</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setShowTimeSlotDialog(true)} className="bg-[#57bbb6] hover:bg-[#2e8f88]">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Time Slot
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAppointmentTypeDialog(true)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Manage Types
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Time Slot Configuration */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Available Time Slots</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">{slot}</span>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => editTimeSlot(slot)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteTimeSlot(slot)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Appointment Types */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Appointment Types</h3>
                        <div className="space-y-2">
                          {appointmentTypes.map((type, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-sm text-gray-600">
                                  Duration: {type.duration} min • Price: ${type.price}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => editAppointmentType(type)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteAppointmentType(type.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Schedule Rules */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Schedule Rules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">Advance Booking Limit</div>
                                <div className="text-sm text-gray-600">How far in advance patients can book</div>
                              </div>
                              <Select defaultValue="30">
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="7">7 days</SelectItem>
                                  <SelectItem value="14">14 days</SelectItem>
                                  <SelectItem value="30">30 days</SelectItem>
                                  <SelectItem value="60">60 days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">Minimum Notice</div>
                                <div className="text-sm text-gray-600">Minimum time before appointment</div>
                              </div>
                              <Select defaultValue="2">
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 hour</SelectItem>
                                  <SelectItem value="2">2 hours</SelectItem>
                                  <SelectItem value="4">4 hours</SelectItem>
                                  <SelectItem value="24">24 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">Max Appointments per Day</div>
                                <div className="text-sm text-gray-600">Daily appointment limit</div>
                              </div>
                              <Input type="number" defaultValue="20" className="w-20" />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">Buffer Time</div>
                                <div className="text-sm text-gray-600">Time between appointments</div>
                              </div>
                              <Select defaultValue="15">
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0 min</SelectItem>
                                  <SelectItem value="5">5 min</SelectItem>
                                  <SelectItem value="15">15 min</SelectItem>
                                  <SelectItem value="30">30 min</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Working Hours */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Working Hours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {workingHours.map((day, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="font-medium w-20">{day.name}</div>
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  checked={day.enabled} 
                                  onChange={(checked) => toggleWorkingDay(day.name, checked)}
                                />
                                {day.enabled ? (
                                  <div className="flex items-center gap-2">
                                    <Input type="time" defaultValue={day.startTime} className="w-24" />
                                    <span>to</span>
                                    <Input type="time" defaultValue={day.endTime} className="w-24" />
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">Closed</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Integration Tab */}
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">System Integrations</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Third-Party Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Link className="h-5 w-5 text-blue-500" />
                          <div>
                            <h3 className="font-medium">WooCommerce</h3>
                            <p className="text-sm text-gray-500">E-commerce integration</p>
                          </div>
                        </div>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Link className="h-5 w-5 text-green-500" />
                          <div>
                            <h3 className="font-medium">WordPress</h3>
                            <p className="text-sm text-gray-500">Content management</p>
                          </div>
                        </div>
                        <Badge variant={wordPressStatus.connected ? 'default' : 'destructive'}>
                          {wordPressStatus.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-purple-500" />
                          <div>
                            <h3 className="font-medium">Payment Gateway</h3>
                            <p className="text-sm text-gray-500">Stripe integration</p>
                          </div>
                        </div>
                        <Badge variant="outline">Connected</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-5 w-5 text-orange-500" />
                          <div>
                            <h3 className="font-medium">Email Service</h3>
                            <p className="text-sm text-gray-500">SMTP configuration</p>
                          </div>
                        </div>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* WordPress Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Link className="h-5 w-5 text-green-500" />
                        WordPress Content Management
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowWordPressSettingsDialog(true)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setShowWordPressPostDialog(true)}
                          className="bg-[#57bbb6] hover:bg-[#2e8f88]"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New Post
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* WordPress Status */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${wordPressStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <h3 className="font-medium">WordPress Connection</h3>
                            <p className="text-sm text-gray-500">
                              {wordPressStatus.connected ? 'Connected' : 'Not Connected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={testWordPressConnection}
                            disabled={wordPressStatus.testing}
                          >
                            {wordPressStatus.testing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                              'Test Connection'
                            )}
                          </Button>
                          <Badge variant={wordPressStatus.connected ? 'default' : 'destructive'}>
                            {wordPressStatus.connected ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      {/* WordPress Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{wordPressStats.postCount}</div>
                          <p className="text-sm text-gray-600">Total Posts</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{wordPressStats.lastSync}</div>
                          <p className="text-sm text-gray-600">Last Sync</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{wordPressStats.cacheStatus}</div>
                          <p className="text-sm text-gray-600">Cache Status</p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={syncWordPressPosts}
                          disabled={wordPressStatus.syncing}
                        >
                          {wordPressStatus.syncing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sync Posts
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.open('https://mymedspharmacyinc.com/blog/wp-admin', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open WP Admin
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={clearWordPressCache}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Database Connection</span>
                        </div>
                        <Badge variant="secondary">Healthy</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">API Services</span>
                        </div>
                        <Badge variant="secondary">Running</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">File Storage</span>
                        </div>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Background Jobs</span>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                  <div className="flex space-x-4">
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportSettings}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </div>
                </div>

                {/* Settings Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">System Status</p>
                          <p className="text-2xl font-bold text-green-600">Online</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Database</p>
                          <p className="text-2xl font-bold text-green-600">Connected</p>
                        </div>
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Security</p>
                          <p className="text-2xl font-bold text-green-600">Active</p>
                        </div>
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Uptime</p>
                          <p className="text-2xl font-bold text-blue-600">99.9%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>General Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site Name</label>
                        <Input 
                          value={settings.siteName}
                          onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Email</label>
                        <Input 
                          value={settings.contactEmail}
                          onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Business Hours</label>
                        <Input 
                          value={settings.businessHours}
                          onChange={(e) => setSettings({...settings, businessHours: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input 
                          value={settings.phoneNumber}
                          onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleSaveSettings}
                        disabled={settingsLoading}
                      >
                        {settingsLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save General Settings
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Security Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Password Policy</h3>
                          <p className="text-sm text-gray-500">Strong passwords required</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Session Timeout</h3>
                          <p className="text-sm text-gray-500">30 minutes</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Rate Limiting</h3>
                          <p className="text-sm text-gray-500">20 requests/15min</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">CSRF Protection</h3>
                          <p className="text-sm text-gray-500">Enabled</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleSecurityAudit}>
                        <Shield className="h-4 w-4 mr-2" />
                        Security Audit
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Link className="h-5 w-5" />
                      <span>Integration Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">WooCommerce</h3>
                            <p className="text-sm text-gray-500">E-commerce Integration</p>
                          </div>
                        </div>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Email Service</h3>
                            <p className="text-sm text-gray-500">SMTP Configuration</p>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Bell className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Notifications</h3>
                            <p className="text-sm text-gray-500">WebSocket & Email</p>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Inventory API</h3>
                            <p className="text-sm text-gray-500">Real-time Updates</p>
                          </div>
                        </div>
                        <Badge variant="default">Connected</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export & Data Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Export & Data Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Export Data</h3>
                        <p className="text-sm text-gray-500">Download system data in various formats</p>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExportData('csv', 'orders')}
                            disabled={exportLoading}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            CSV
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExportData('json', 'orders')}
                            disabled={exportLoading}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            JSON
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExportData('excel', 'orders')}
                            disabled={exportLoading}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Backup & Restore</h3>
                        <p className="text-sm text-gray-500">Manage system backups and restoration</p>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleBackupSystem}
                            disabled={backupLoading}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Backup
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => alert('Restore functionality will be implemented in a future update. For now, please contact system administrator.')}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Add other tabs as needed */}
          </div>
        </div>

        {/* Session Warning Dialog */}
        {showSessionWarning && (
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
        )}

        {/* Add New Zone Dialog */}
        <Dialog open={showAddZoneDialog} onOpenChange={setShowAddZoneDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Delivery Zone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Zone Name</label>
                <Input
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Zone 4 - Express"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Radius</label>
                <Input
                  value={newZone.radius}
                  onChange={(e) => setNewZone(prev => ({ ...prev, radius: e.target.value }))}
                  placeholder="e.g., 15-20 miles"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newZone.status}
                  onValueChange={(value) => setNewZone(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Color</label>
                <Select
                  value={newZone.color}
                  onValueChange={(value) => setNewZone(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  value={newZone.description}
                  onChange={(e) => setNewZone(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this zone"
                  className="mt-1"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSaveZone}
                  className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B]"
                >
                  Save Zone
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddZoneDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Delivery Fees Dialog */}
        <Dialog open={showDeliveryFeesDialog} onOpenChange={(open) => {
          if (!open && deliveryFeesChanged) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
              handleCancelDeliveryFees();
            }
          } else if (!open) {
            handleCancelDeliveryFees();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Edit Delivery Fees
                {deliveryFeesChanged && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Unsaved Changes
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Free Delivery Threshold</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempFreeThreshold}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Free Delivery Threshold changed:', value);
                    // Allow empty string for editing
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setTempFreeThreshold(value === '' ? 0 : parseFloat(value));
                      setDeliveryFeesChanged(true);
                    }
                  }}
                  placeholder="25"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orders over this amount get free delivery
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Standard Delivery Fee</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempStandardFee}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for editing
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setTempStandardFee(value === '' ? 0 : parseFloat(value));
                      setDeliveryFeesChanged(true);
                    }
                  }}
                  placeholder="5.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fee for orders under the free delivery threshold
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Same-Day Delivery Fee</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempSameDayFee}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for editing
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setTempSameDayFee(value === '' ? 0 : parseFloat(value));
                      setDeliveryFeesChanged(true);
                    }
                  }}
                  placeholder="3.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional fee for same-day delivery
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Free Delivery Text</label>
                <Input
                  value={tempFreeText}
                  onChange={(e) => {
                    setTempFreeText(e.target.value);
                    setDeliveryFeesChanged(true);
                  }}
                  placeholder="Free"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Text displayed for free delivery
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Currency Symbol</label>
                <Select
                  value={tempCurrency}
                  onValueChange={(value) => {
                    setTempCurrency(value);
                    setDeliveryFeesChanged(true);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (USD)</SelectItem>
                    <SelectItem value="€">€ (EUR)</SelectItem>
                    <SelectItem value="£">£ (GBP)</SelectItem>
                    <SelectItem value="¥">¥ (JPY)</SelectItem>
                    <SelectItem value="₹">₹ (INR)</SelectItem>
                    <SelectItem value="₽">₽ (RUB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSaveDeliveryFees}
                  className={`flex-1 ${deliveryFeesChanged ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#57BBB6] hover:bg-[#376F6B]'}`}
                >
                  {deliveryFeesChanged ? 'Save Changes' : 'Save Fees'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelDeliveryFees}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Management Dialogs */}
        
        {/* Time Slot Management Dialog */}
        <Dialog open={showTimeSlotDialog} onOpenChange={setShowTimeSlotDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Time Slots</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Add New Time Slot</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., 9:00 AM" 
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newSlot = e.target.value;
                        if (newSlot && !timeSlots.includes(newSlot)) {
                          setTimeSlots(prev => [...prev, newSlot].sort());
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const newSlot = input.value;
                      if (newSlot && !timeSlots.includes(newSlot)) {
                        setTimeSlots(prev => [...prev, newSlot].sort());
                        input.value = '';
                      }
                    }}
                    className="bg-[#57bbb6] hover:bg-[#2e8f88]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Current Time Slots</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{slot}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteTimeSlot(slot)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Appointment Type Management Dialog */}
        <Dialog open={showAppointmentTypeDialog} onOpenChange={setShowAppointmentTypeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Appointment Types</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type Name</label>
                  <Input placeholder="e.g., Consultation" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <Input type="number" placeholder="30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <Input type="number" placeholder="50.00" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input placeholder="Brief description of this appointment type" />
              </div>
              
              <div className="flex gap-2">
                <Button className="bg-[#57bbb6] hover:bg-[#2e8f88]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Current Types</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {appointmentTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-gray-600">
                          {type.duration} min • ${type.price}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => editAppointmentType(type)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteAppointmentType(type.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Appointment Dialog */}
        <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Patient Name</label>
                <Input placeholder="Enter patient name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" placeholder="patient@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot, index) => (
                        <SelectItem key={index} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Appointment Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type, index) => (
                      <SelectItem key={index} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Input placeholder="Additional notes (optional)" />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="bg-[#57bbb6] hover:bg-[#2e8f88] flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Create Appointment
                </Button>
                <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Block Time Dialog */}
        <Dialog open={showBlockTimeDialog} onOpenChange={setShowBlockTimeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Block Time Slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Lunch Break</SelectItem>
                    <SelectItem value="meeting">Staff Meeting</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="personal">Personal Time</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot, index) => (
                        <SelectItem key={index} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot, index) => (
                        <SelectItem key={index} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Input placeholder="Additional notes (optional)" />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="bg-orange-500 hover:bg-orange-600 flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Block Time
                </Button>
                <Button variant="outline" onClick={() => setShowBlockTimeDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* WordPress Management Dialogs */}
        
        {/* WordPress Settings Dialog */}
        <Dialog open={showWordPressSettingsDialog} onOpenChange={setShowWordPressSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>WordPress Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">WordPress Site URL</label>
                <Input 
                  placeholder="https://mymedspharmacyinc.com/blog" 
                  defaultValue="https://mymedspharmacyinc.com/blog"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input 
                  placeholder="admin" 
                  defaultValue="mymeds_api_user"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Application Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter WordPress application password" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="enable-wordpress" defaultChecked />
                <label htmlFor="enable-wordpress" className="text-sm font-medium">
                  Enable WordPress Integration
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="bg-[#57bbb6] hover:bg-[#2e8f88] flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={() => setShowWordPressSettingsDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* WordPress New Post Dialog */}
        <Dialog open={showWordPressPostDialog} onOpenChange={setShowWordPressPostDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create WordPress Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Post Title</label>
                <Input placeholder="Enter post title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Post Content</label>
                <textarea 
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
                  placeholder="Enter post content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <Input placeholder="Brief description of the post" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="publish">Publish</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categories</label>
                  <Input placeholder="Health, Pharmacy, News" />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="bg-[#57bbb6] hover:bg-[#2e8f88] flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="outline" onClick={() => setShowWordPressPostDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </>
  );
}
