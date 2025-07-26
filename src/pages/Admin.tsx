import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  MapPin, 
  Users, 
  Star, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  LogOut,
  AlertCircle,
  Phone,
  Home,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '../lib/api';
import supabase from '../lib/supabaseClient';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Filter },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'delivery', label: 'Delivery Map', icon: MapPin },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'success' });
  useEffect(() => {
    console.log('Admin page mounted - checking authentication...');
    
    // Check for admin authentication token
    const adminToken = localStorage.getItem('sb-admin-token');
    const adminAuth = localStorage.getItem('admin-auth');
    
    console.log('Admin token:', adminToken ? 'exists' : 'missing');
    console.log('Admin auth:', adminAuth);
    
    if (!adminToken || adminAuth !== 'true') {
      console.log('Authentication check failed - redirecting to signin');
      navigate('/admin-signin');
      return;
    }

    // Verify the token is still valid by checking Supabase session
    supabase.auth.getSession().then(({ data }) => {
      console.log('Supabase session check:', data.session ? 'valid' : 'invalid');
      if (!data.session) {
        console.log('Supabase session invalid - clearing tokens and redirecting');
        // Clear invalid tokens
        localStorage.removeItem('sb-admin-token');
        localStorage.removeItem('admin-auth');
        navigate('/admin-signin');
      } else {
        console.log('Authentication successful - staying on admin page');
      }
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'session exists' : 'no session');
      if (!session) {
        console.log('Auth state change detected no session - clearing tokens and redirecting');
        localStorage.removeItem('sb-admin-token');
        localStorage.removeItem('admin-auth');
        navigate('/admin-signin');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);
  function logout() {
    // Clear local storage first
    localStorage.removeItem('sb-admin-token');
    localStorage.removeItem('admin-auth');
    localStorage.removeItem('admin-remember');
    
    // Then sign out from Supabase
    supabase.auth.signOut().then(() => {
      navigate('/admin-signin');
    });
  }

  function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: 'success' }), 3000);
  }

  function confirmLogout() {
    setShowLogoutConfirm(true);
  }

  function handleLogout() {
    logout();
    setShowLogoutConfirm(false);
  }

  // Product CRUD state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [editing, setEditing] = useState(null);
  // Update product form state to include categoryId
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    available: true, 
    image: '', 
    categoryId: '',
    stock: 0,
    sku: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  // Add state for product images
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (tab === 'products') {
      setProductsLoading(true);
      setProductsError('');
      api.get('/products')
        .then(res => setProducts(res.data))
        .catch(err => setProductsError(err.response?.data?.error || 'Failed to load products'))
        .finally(() => setProductsLoading(false));
    }
  }, [tab]);

  function handleProductImage(e) {
    const files = Array.from(e.target.files) as File[];
    setNewImages(prev => [...prev, ...files]);
    // Optionally, show previews for new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = typeof ev.target.result === 'string' ? ev.target.result : '';
        setImagePreview(prev => prev ? prev : result); // Show first image as preview
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.description || !form.sku) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }
    try {
      let productRes;
      if (editing) {
        productRes = await api.put(`/products/${editing}`, { ...form, price: Number(form.price), stock: Number(form.stock) });
        setProducts(products.map(p => p.id === editing ? productRes.data : p));
        setEditing(null);
        showToastMessage('Product updated successfully');
      } else {
        productRes = await api.post('/products', { ...form, price: Number(form.price), stock: Number(form.stock) });
        setProducts([...products, productRes.data]);
        showToastMessage('Product added successfully');
      }
      // Upload new images if any
      if (newImages.length > 0) {
        setUploadingImages(true);
        for (const file of newImages) {
          const formData = new FormData();
          formData.append('file', file);
          await api.post(`/products/${productRes.data.id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        setUploadingImages(false);
        setNewImages([]);
      }
      setForm({ name: '', price: '', description: '', available: true, image: '', categoryId: '', stock: 0, sku: '' });
      setImagePreview('');
      // Optionally, refetch products to get updated images
      api.get('/products').then(res => setProducts(res.data));
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to save product', 'error');
    }
  }
  function handleEditProduct(p) {
    setEditing(p.id);
    setForm({ name: p.name, price: String(p.price), description: p.description, available: p.available, image: p.image, categoryId: p.categoryId ? String(p.categoryId) : '', stock: p.stock, sku: p.sku });
    setImagePreview(p.image);
  }
  async function handleDeleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      showToastMessage('Product deleted successfully');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to delete product', 'error');
    }
  }

  // Function to delete an image
  async function handleDeleteProductImage(imageId, productId) {
    try {
      await api.delete(`/products/images/${imageId}`);
      // Refetch products to update images
      api.get('/products').then(res => setProducts(res.data));
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to delete image', 'error');
    }
  }

  // Blog CRUD state
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState('');
  const [blogEditing, setBlogEditing] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', image: '', published: false, tags: [] as string[] });
  const [blogImagePreview, setBlogImagePreview] = useState('');

  useEffect(() => {
    if (tab === 'blogs') {
      setBlogsLoading(true);
      setBlogsError('');
      api.get('/blogs')
        .then(res => setBlogs(res.data))
        .catch(err => setBlogsError(err.response?.data?.error || 'Failed to load blogs'))
        .finally(() => setBlogsLoading(false));
    }
  }, [tab]);

  function handleBlogImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = typeof ev.target.result === 'string' ? ev.target.result : '';
        setBlogForm(f => ({ ...f, image: result }));
        setBlogImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleBlogSubmit(e) {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }
    try {
      if (blogEditing) {
        const res = await api.put(`/blogs/${blogEditing}`, blogForm);
        setBlogs(blogs.map(b => b.id === blogEditing ? res.data : b));
        setBlogEditing(null);
        showToastMessage('Blog updated successfully');
      } else {
        const res = await api.post('/blogs', blogForm);
        setBlogs([...blogs, res.data]);
        showToastMessage('Blog added successfully');
      }
      setBlogForm({ title: '', content: '', image: '', published: false, tags: [] });
      setBlogImagePreview('');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to save blog', 'error');
    }
  }
  function handleEditBlog(b) {
    setBlogEditing(b.id);
    setBlogForm({ title: b.title, content: b.content, image: b.image, published: b.published, tags: b.tags || [] });
    setBlogImagePreview(b.image);
  }
  async function handleDeleteBlog(id) {
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(b => b.id !== id));
      showToastMessage('Blog deleted successfully');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to delete blog', 'error');
    }
  }

  // Order CRUD state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  
  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      setOrdersError('');
      api.get('/orders')
        .then(res => setOrders(res.data))
        .catch(err => setOrdersError(err.response?.data?.error || 'Failed to load orders'))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab]);
  
  async function updateOrderStatus(id, status) {
    try {
      await api.put(`/orders/${id}`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      showToastMessage(`Order status updated to ${status}`);
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to update order status', 'error');
    }
  }
  
  async function handleDeleteOrder(id) {
    try {
      await api.delete(`/orders/${id}`);
      setOrders(orders.filter(o => o.id !== id));
      showToastMessage('Order deleted successfully');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to delete order', 'error');
    }
  }

  // For Delivery Address on Map
  const [selectedOrder, setSelectedOrder] = useState(null);
  function getMapSrc(address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }

  // User Management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    if (tab === 'users') {
      setUsersLoading(true);
      setUsersError('');
      api.get('/users')
        .then(res => setUsers(res.data))
        .catch(err => setUsersError(err.response?.data?.error || 'Failed to load users'))
        .finally(() => setUsersLoading(false));
    }
  }, [tab]);

  async function handleUserUpdate(id, data) {
    try {
      const res = await api.put(`/users/${id}`, data);
      setUsers(users.map(u => u.id === id ? res.data : u));
      showToastMessage('User updated successfully');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to update user', 'error');
    }
  }
  async function handleDeleteUser(id) {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      showToastMessage('User deleted successfully');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  }

  // Reviews Management state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    if (tab === 'reviews') {
      setReviewsLoading(true);
      setReviewsError('');
      api.get('/reviews')
        .then(res => setReviews(res.data))
        .catch(err => setReviewsError(err.response?.data?.error || 'Failed to load reviews'))
        .finally(() => setReviewsLoading(false));
    }
  }, [tab]);

  async function approveReview(id) {
    try {
      await api.put(`/reviews/${id}`, { status: 'approved' });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      showToastMessage('Review approved successfully');
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to approve review', 'error');
    }
  }
  async function rejectReview(id) {
    try {
      await api.put(`/reviews/${id}`, { status: 'rejected' });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      showToastMessage('Review rejected successfully');
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to reject review', 'error');
    }
  }
  async function handleDeleteReview(id) {
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      showToastMessage('Review deleted successfully');
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to delete review', 'error');
    }
  }

  // Category CRUD state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [categoryEditing, setCategoryEditing] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  useEffect(() => {
    if (tab === 'categories' || tab === 'products') {
      setCategoriesLoading(true);
      setCategoriesError('');
      api.get('/products/categories')
        .then(res => setCategories(res.data))
        .catch(err => setCategoriesError(err.response?.data?.error || 'Failed to load categories'))
        .finally(() => setCategoriesLoading(false));
    }
  }, [tab]);

  async function handleCategorySubmit(e) {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      if (categoryEditing) {
        const res = await api.put(`/products/categories/${categoryEditing}`, { name: categoryForm.name });
        setCategories(categories.map(c => c.id === categoryEditing ? res.data : c));
        setCategoryEditing(null);
      } else {
        const res = await api.post('/products/categories', { name: categoryForm.name });
        setCategories([...categories, res.data]);
      }
      setCategoryForm({ name: '' });
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to save category', 'error');
    }
  }
  function handleEditCategory(c) {
    setCategoryEditing(c.id);
    setCategoryForm({ name: c.name });
  }
  async function handleDeleteCategory(id) {
    try {
      await api.delete(`/products/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to delete category', 'error');
    }
  }

  // Settings state
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    businessHours: '',
    facebook: '',
    instagram: '',
    twitter: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    if (tab === 'settings') {
      setSettingsLoading(true);
      setSettingsError('');
      api.get('/settings')
        .then(res => {
          if (res.data) setSettings(res.data);
        })
        .catch(err => setSettingsError(err.response?.data?.error || 'Failed to load settings'))
        .finally(() => setSettingsLoading(false));
    }
  }, [tab]);

  async function handleSettingsSave(e) {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      showToastMessage('Settings updated successfully');
    } catch (err) {
      showToastMessage(err.response?.data?.error || 'Failed to update settings', 'error');
    }
  }

  // Notification state
  const [notifications, setNotifications] = useState<{ orders: any[]; appointments: any[]; prescriptions: any[]; contacts: any[] }>({ orders: [], appointments: [], prescriptions: [], contacts: [] });
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');

  // For sound notification
  const notifSound = typeof window !== 'undefined' ? new Audio('/notification.mp3') : null;
  const [lastNotifCount, setLastNotifCount] = useState(0);

  // For highlighting selected notification
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const [highlightedTab, setHighlightedTab] = useState(null);

  async function fetchNotifications() {
    setNotifLoading(true);
    setNotifError('');
    console.log('Fetching notifications...');
    try {
      const res = await api.get('/notifications');
      console.log('Notifications API response:', res);
      setNotifications(res.data);
      // Play sound if new notifications arrived
      const total = (Object.values(res.data) as any[]).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      if (total > lastNotifCount && notifSound) {
        notifSound.play();
      }
      setLastNotifCount(total);
    } catch (err) {
      console.error('Notifications API error:', err);
      setNotifError(err.response?.data?.error || 'Failed to fetch notifications');
    } finally {
      setNotifLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  async function markNotificationRead(type, id) {
    try {
      await api.post('/notifications/mark-read', { type, id });
      fetchNotifications();
    } catch {}
  }

  function handleNotifClick(type, id) {
    setNotifOpen(false);
    if (type === 'order') {
      setTab('orders');
      setHighlightedOrder(id);
      setHighlightedTab('orders');
      setTimeout(() => setHighlightedOrder(null), 3000);
    } else if (type === 'appointment') {
      setTab('appointments');
      setHighlightedTab('appointments');
    } else if (type === 'prescription') {
      setTab('prescriptions');
      setHighlightedTab('prescriptions');
    } else if (type === 'contact') {
      setTab('contact');
      setHighlightedTab('contact');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {showToast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="w-14 h-14 bg-gradient-to-br from-[#376f6b] to-[#2e8f88] rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Home className="h-8 w-8 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#376f6b] to-[#2e8f88] bg-clip-text text-transparent">
                  MY MEDS PHARMACY
                </h1>
                <p className="text-sm text-gray-600 font-medium">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6 text-[#376f6b]" />
                  {Object.values(notifications).some(arr => arr.length > 0) && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 border">
                    <div className="p-4 border-b font-bold text-[#376f6b] flex items-center justify-between">
                      Notifications
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifLoading && <div className="p-4 text-gray-500">Loading...</div>}
                      {notifError && <div className="p-4 text-red-500">{notifError}</div>}
                      {Object.values(notifications).every(arr => arr.length === 0) && !notifLoading && (
                        <div className="p-4 text-gray-500">No new notifications</div>
                      )}
                      {notifications.orders.length > 0 && (
                        <div className="border-b">
                          <div className="p-2 font-semibold text-[#376f6b]">New Orders</div>
                          {notifications.orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => handleNotifClick('order', order.id)}>
                              <div>
                                <div className="font-medium">Order #{order.id} - {order.user?.name || 'Customer'}</div>
                                <div className="text-xs text-gray-500">{order.createdAt && new Date(order.createdAt).toLocaleString()}</div>
                              </div>
                              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); markNotificationRead('order', order.id); }}>
                                Mark Read
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.appointments.length > 0 && (
                        <div className="border-b">
                          <div className="p-2 font-semibold text-[#376f6b]">New Appointments</div>
                          {notifications.appointments.map(app => (
                            <div key={app.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => handleNotifClick('appointment', app.id)}>
                              <div>
                                <div className="font-medium">Appointment #{app.id}</div>
                                <div className="text-xs text-gray-500">{app.createdAt && new Date(app.createdAt).toLocaleString()}</div>
                              </div>
                              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); markNotificationRead('appointment', app.id); }}>
                                Mark Read
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.prescriptions.length > 0 && (
                        <div className="border-b">
                          <div className="p-2 font-semibold text-[#376f6b]">New Prescriptions</div>
                          {notifications.prescriptions.map(pres => (
                            <div key={pres.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => handleNotifClick('prescription', pres.id)}>
                              <div>
                                <div className="font-medium">Prescription #{pres.id}</div>
                                <div className="text-xs text-gray-500">{pres.createdAt && new Date(pres.createdAt).toLocaleString()}</div>
                              </div>
                              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); markNotificationRead('prescription', pres.id); }}>
                                Mark Read
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.contacts.length > 0 && (
                        <div className="border-b">
                          <div className="p-2 font-semibold text-[#376f6b]">New Contact Forms</div>
                          {notifications.contacts.map(contact => (
                            <div key={contact.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => handleNotifClick('contact', contact.id)}>
                              <div>
                                <div className="font-medium">Contact #{contact.id} - {contact.name}</div>
                                <div className="text-xs text-gray-500">{contact.createdAt && new Date(contact.createdAt).toLocaleString()}</div>
                              </div>
                              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); markNotificationRead('contact', contact.id); }}>
                                Mark Read
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={() => window.open('tel:+1234567890', '_self')}
                variant="outline"
                className="border-[#376f6b] text-[#376f6b] hover:bg-[#376f6b] hover:text-white transition-all duration-300"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Us
              </Button>
              <span className="text-sm text-gray-500">Welcome, Admin</span>
              <Button 
                onClick={confirmLogout}
                variant="outline"
                className="border-[#376f6b] text-[#376f6b] hover:bg-[#376f6b] hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(tabItem => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === tabItem.id
                    ? 'bg-[#376f6b] text-white shadow-md'
                    : 'bg-white text-[#376f6b] border border-[#57bbb6] hover:bg-[#57bbb6] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tabItem.label}
              </button>
            );
          })}
        </div>

                {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {tab === 'dashboard' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#376f6b] mb-6">Dashboard Overview</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-[#376f6b]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#376f6b]">{products.length}</div>
                    <p className="text-xs text-muted-foreground">Available in store</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-[#376f6b]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#376f6b]">{orders.length}</div>
                    <p className="text-xs text-muted-foreground">All time orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-[#376f6b]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#376f6b]">{users.length}</div>
                    <p className="text-xs text-muted-foreground">Registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    <Star className="h-4 w-4 text-[#376f6b]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#376f6b]">{reviews.length}</div>
                    <p className="text-xs text-muted-foreground">Customer reviews</p>
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
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.name}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                            {review.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#376f6b]">Product Management</h2>
                <Button onClick={() => setEditing(null)} className="bg-[#376f6b] hover:bg-[#2e8f88]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Add/Edit Product Form */}
              {!editing && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Product Name *</label>
                          <Input
                            placeholder="Product Name"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">SKU *</label>
                          <Input
                            placeholder="SKU Code"
                            value={form.sku}
                            onChange={e => setForm({...form, sku: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Price *</label>
                          <Input
                            type="number"
                            placeholder="Price"
                            value={form.price}
                            onChange={e => setForm({...form, price: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <select
                            value={form.categoryId || ''}
                            onChange={e => setForm({...form, categoryId: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Stock Quantity</label>
                          <Input
                            type="number"
                            placeholder="Stock"
                            value={form.stock}
                            onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={form.available}
                            onChange={e => setForm({...form, available: e.target.checked})}
                            className="rounded"
                          />
                          <label className="text-sm font-medium">Available for Purchase</label>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description *</label>
                        <Textarea
                          placeholder="Product Description"
                          value={form.description}
                          onChange={e => setForm({...form, description: e.target.value})}
                          rows={3}
                          required
                        />
                      </div>
                      {/* Product Images */}
                      <div>
                        <label className="text-sm font-medium">Product Images</label>
                        <Input
                          type="file"
                          onChange={handleProductImage}
                          accept="image/*"
                          multiple
                        />
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {/* Existing images */}
                          {editing && products.find(p => p.id === editing)?.images?.map(img => (
                            <div key={img.id} className="relative group">
                              <img src={img.url} alt="Product" className="h-20 w-20 object-cover rounded border" />
                              <button
                                type="button"
                                onClick={() => handleDeleteProductImage(img.id, editing)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-80 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          {/* New images preview */}
                          {newImages.map((file, idx) => (
                            <div key={idx} className="relative">
                              <img src={URL.createObjectURL(file)} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                            </div>
                          ))}
                        </div>
                        {uploadingImages && <div className="text-xs text-gray-500 mt-1">Uploading images...</div>}
                      </div>
                      <Button type="submit" className="bg-[#376f6b] hover:bg-[#2e8f88]">
                        {editing ? 'Update Product' : 'Add Product'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Image</th>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">SKU</th>
                          <th className="text-left p-3 font-medium">Category</th>
                          <th className="text-left p-3 font-medium">Price</th>
                          <th className="text-left p-3 font-medium">Stock</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(p => (
                          <tr key={p.id} className={`border-b hover:bg-gray-50 ${highlightedOrder === p.id ? 'bg-yellow-100' : ''}`}>
                            <td className="p-3">
                              {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 object-cover rounded border" />}
                            </td>
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 text-sm text-gray-500">{p.sku || 'N/A'}</td>
                            <td className="p-3">
                              <Badge variant="outline">{p.category || 'Uncategorized'}</Badge>
                            </td>
                            <td className="p-3 font-medium">${p.price}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {p.stock || 0}
                              </span>
                            </td>
                            <td className="p-3">
                              <Badge variant={p.available ? 'default' : 'secondary'}>
                                {p.available ? 'Available' : 'Out of Stock'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(p)}
                                  className="text-[#376f6b] border-[#376f6b] hover:bg-[#376f6b] hover:text-white"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        {tab === 'categories' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#376f6b] mb-6">Category Management</h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{categoryEditing ? 'Edit Category' : 'Add New Category'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCategorySubmit} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Category Name *</label>
                    <Input
                      placeholder="Category Name"
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({ name: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-[#376f6b] hover:bg-[#2e8f88]">
                    {categoryEditing ? 'Update' : 'Add'}
                  </Button>
                  {categoryEditing && (
                    <Button type="button" variant="outline" onClick={() => { setCategoryEditing(null); setCategoryForm({ name: '' }); }}>
                      Cancel
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : categoriesError ? (
                  <div className="text-center py-8 text-red-500">{categoriesError}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(c => (
                          <tr key={c.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{c.name}</td>
                            <td className="p-3">
                              <Button size="sm" variant="outline" onClick={() => handleEditCategory(c)} className="text-[#376f6b] border-[#376f6b] hover:bg-[#376f6b] hover:text-white mr-2">
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(c.id)} className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {tab === 'blogs' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#376f6b]">Blog Management</h2>
              <Button onClick={() => setBlogEditing(null)} className="bg-[#376f6b] hover:bg-[#2e8f88]">
                <Plus className="h-4 w-4 mr-2" />
                Add New Blog
              </Button>
            </div>

            {/* Add/Edit Blog Form */}
            {!blogEditing && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Blog Title *</label>
                      <Input
                        placeholder="Blog Title"
                        value={blogForm.title}
                        onChange={e => setBlogForm({...blogForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Content *</label>
                      <Textarea
                        placeholder="Blog Content"
                        value={blogForm.content}
                        onChange={e => setBlogForm({...blogForm, content: e.target.value})}
                        rows={6}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Featured Image</label>
                      <Input
                        type="file"
                        onChange={handleBlogImage}
                        accept="image/*"
                      />
                      {blogImagePreview && (
                        <img src={blogImagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={blogForm.published || false}
                        onChange={e => setBlogForm({...blogForm, published: e.target.checked})}
                        className="rounded"
                      />
                      <label className="text-sm font-medium">Publish immediately</label>
                    </div>
                    <Button type="submit" className="bg-[#376f6b] hover:bg-[#2e8f88]">
                      {blogEditing ? 'Update Blog' : 'Add Blog'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Blogs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Image</th>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">Content</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(b => (
                        <tr key={b.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {b.image && <img src={b.image} alt={b.title} className="h-12 w-12 object-cover rounded border" />}
                          </td>
                          <td className="p-3 font-medium">{b.title}</td>
                          <td className="p-3 max-w-xs">
                            <p className="text-sm text-gray-600 truncate">{b.content.slice(0, 100)}...</p>
                          </td>
                          <td className="p-3">
                            <Badge variant={b.published ? 'default' : 'secondary'}>
                              {b.published ? 'Published' : 'Draft'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBlog(b)}
                                className="text-[#376f6b] border-[#376f6b] hover:bg-[#376f6b] hover:text-white"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBlog(b.id)}
                                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {tab === 'orders' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#376f6b] mb-6">Order Management</h2>
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{ordersError}</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium">Order ID</th>
                            <th className="text-left p-3 font-medium">Customer</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Items</th>
                            <th className="text-left p-3 font-medium">Total</th>
                            <th className="text-left p-3 font-medium">Date</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr key={o.id} className={`border-b hover:bg-gray-50 ${highlightedOrder === o.id ? 'bg-yellow-100' : ''}`}>
                              <td className="p-3 font-medium">#{o.id}</td>
                              <td className="p-3 font-medium">{o.user?.name || 'Customer'}</td>
                              <td className="p-3 text-sm">{o.user?.email || 'No email'}</td>
                              <td className="p-3 text-sm">
                                {o.items.map(item => `${item.quantity}x ${item.product?.name || 'Product'}`).join(', ')}
                              </td>
                              <td className="p-3 font-medium">${o.total}</td>
                              <td className="p-3 text-sm text-gray-500">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant={
                                    o.status === 'completed' ? 'default' : 
                                    o.status === 'processing' ? 'secondary' : 'outline'
                                  }
                                >
                                  {o.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <select
                                    value={o.status}
                                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                    className="text-xs p-1 border rounded"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteOrder(o.id)}
                                    className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {tab === 'delivery' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#376f6b] mb-6">Delivery Map</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {orders.map(o => (
                        <div
                          key={o.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedOrder && selectedOrder.id === o.id
                              ? 'bg-[#376f6b] text-white'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedOrder(o)}
                        >
                          <div className="font-medium">{o.name}</div>
                          <div className="text-sm opacity-75">{o.address}</div>
                          <div className="text-xs opacity-60 mt-1">{o.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-[500px] flex items-center justify-center">
                      {selectedOrder ? (
                        <iframe
                          title="Delivery Address Map"
                          src={getMapSrc(selectedOrder.address)}
                          width="100%"
                          height="500"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">Select an order to view address on map</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        {tab === 'users' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#376f6b] mb-6">User Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Mobile</th>
                        <th className="text-left p-3 font-medium">Role</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Join Date</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{user.name}</td>
                          <td className="p-3 text-sm">{user.email}</td>
                          <td className="p-3 text-sm">{user.mobile}</td>
                          <td className="p-3">
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-500">{user.joinDate}</td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserUpdate(user.id, { status: 'active' })}
                              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserUpdate(user.id, { status: 'inactive' })}
                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactivate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Management Tab */}
        {tab === 'reviews' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#376f6b] mb-6">Review Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Customer</th>
                        <th className="text-left p-3 font-medium">Rating</th>
                        <th className="text-left p-3 font-medium">Review</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(review => (
                        <tr key={review.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{review.name}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="p-3 max-w-xs">
                            <p className="text-sm text-gray-600 truncate">{review.text}</p>
                          </td>
                          <td className="p-3 text-sm text-gray-500">{review.date}</td>
                          <td className="p-3">
                            <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                              {review.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {review.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => approveReview(review.id)}
                                  className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectReview(review.id)}
                                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#376f6b] mb-6">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input id="adminName" name="adminName" placeholder="Admin Name" value={"Admin User"} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input id="adminEmail" name="adminEmail" placeholder="admin@mymeds.com" value={"admin@mymeds.com"} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input id="contactPhone" name="contactPhone" placeholder="Phone Number" value={settings.contactPhone} onChange={e => setSettings(s => ({ ...s, contactPhone: e.target.value }))} />
                  </div>
                  <Button className="bg-[#376f6b] hover:bg-[#2e8f88]" disabled>
                    Update Profile (coming soon)
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pharmacy Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSettingsSave} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Pharmacy Name</label>
                      <Input id="siteName" name="siteName" placeholder="Pharmacy Name" value={settings.siteName} onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input id="contactEmail" name="contactEmail" placeholder="Contact Email" value={settings.contactEmail} onChange={e => setSettings(s => ({ ...s, contactEmail: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <Textarea id="pharmacyAddress" name="pharmacyAddress" placeholder="Pharmacy Address" value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} rows={3} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Business Hours</label>
                      <Input id="businessHours" name="businessHours" placeholder="9:00 AM - 6:00 PM" value={settings.businessHours} onChange={e => setSettings(s => ({ ...s, businessHours: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Facebook</label>
                      <Input id="facebookUrl" name="facebookUrl" placeholder="Facebook URL" value={settings.facebook || ''} onChange={e => setSettings(s => ({ ...s, facebook: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Instagram</label>
                      <Input id="instagramUrl" name="instagramUrl" placeholder="Instagram URL" value={settings.instagram || ''} onChange={e => setSettings(s => ({ ...s, instagram: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Twitter</label>
                      <Input id="twitterUrl" name="twitterUrl" placeholder="Twitter URL" value={settings.twitter || ''} onChange={e => setSettings(s => ({ ...s, twitter: e.target.value }))} />
                    </div>
                    <Button type="submit" className="bg-[#376f6b] hover:bg-[#2e8f88]">
                      Save Settings
                    </Button>
                    {settingsLoading && <div className="text-xs text-gray-500">Loading settings...</div>}
                    {settingsError && <div className="text-xs text-red-500">{settingsError}</div>}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout? Any unsaved changes will be lost.</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 