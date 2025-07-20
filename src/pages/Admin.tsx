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
  Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '../lib/api';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'delivery', label: 'Delivery Map', icon: MapPin },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DEMO_PRODUCTS = [
  { id: 1, name: 'Wheelchair', price: 120, description: 'Lightweight, foldable wheelchair', available: true, image: '', category: 'Mobility', stock: 15, sku: 'WC-001' },
  { id: 2, name: 'BP Machine', price: 60, description: 'Automatic blood pressure monitor', available: true, image: '', category: 'Monitoring', stock: 25, sku: 'BP-001' },
  { id: 3, name: 'Walker', price: 80, description: 'Adjustable medical walker', available: false, image: '', category: 'Mobility', stock: 0, sku: 'WK-001' },
];
const DEMO_BLOGS = [
  { id: 1, title: '5 Tips for Managing Your Medications', content: 'Take your medications at the same time every day. Use a pill organizer. ...', image: '', published: true, tags: ['Medication', 'Health Tips'] },
  { id: 2, title: 'Understanding Blood Pressure', content: 'Blood pressure is the force of your blood pushing against the walls of your arteries. ...', image: '', published: false, tags: ['Cardiovascular', 'Health'] },
];
const DEMO_ORDERS = [
  { id: 1, name: 'John Doe', address: '123 Main St, Brooklyn, NY', mobile: '555-1234', notes: 'Leave at door', status: 'pending', products: [{ name: 'Wheelchair', qty: 1, price: 120 }], date: '2024-07-01', total: 120 },
  { id: 2, name: 'Jane Smith', address: '456 Park Ave, Brooklyn, NY', mobile: '555-5678', notes: '', status: 'delivered', products: [{ name: 'BP Machine', qty: 2, price: 60 }], date: '2024-07-02', total: 120 },
  { id: 3, name: 'Mike Johnson', address: '789 Oak St, Brooklyn, NY', mobile: '555-9012', notes: 'Call before delivery', status: 'shipped', products: [{ name: 'Walker', qty: 1, price: 80 }], date: '2024-07-03', total: 80 },
];
const DEMO_USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', mobile: '555-1234', role: 'user', status: 'active', joinDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', mobile: '555-5678', role: 'user', status: 'active', joinDate: '2024-01-20' },
  { id: 3, name: 'Admin User', email: 'admin@mymeds.com', mobile: '555-0000', role: 'admin', status: 'active', joinDate: '2024-01-01' },
];

const DEMO_REVIEWS = [
  { id: 1, name: 'Maria Rodriguez', rating: 5, text: 'Excellent service and knowledgeable staff!', status: 'approved', date: '2024-01-15' },
  { id: 2, name: 'James Thompson', rating: 4, text: 'Good experience, but delivery was a bit slow.', status: 'pending', date: '2024-01-16' },
  { id: 3, name: 'Sarah Chen', rating: 5, text: 'Amazing pharmacy with caring staff!', status: 'approved', date: '2024-01-17' },
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'success' });
  useEffect(() => {
    if (localStorage.getItem('admin-auth') !== 'true') {
      navigate('/admin-signin');
    }
  }, [navigate]);
  function logout() {
    localStorage.removeItem('admin-auth');
    navigate('/admin-signin');
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
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    available: true, 
    image: '', 
    category: 'Mobility',
    stock: 0,
    sku: ''
  });
  const [imagePreview, setImagePreview] = useState('');

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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = typeof ev.target.result === 'string' ? ev.target.result : '';
        setForm(f => ({ ...f, image: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.description || !form.sku) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }
    try {
      if (editing) {
        const res = await api.put(`/products/${editing}`, { ...form, price: Number(form.price), stock: Number(form.stock) });
        setProducts(products.map(p => p.id === editing ? res.data : p));
        setEditing(null);
        showToastMessage('Product updated successfully');
      } else {
        const res = await api.post('/products', { ...form, price: Number(form.price), stock: Number(form.stock) });
        setProducts([...products, res.data]);
        showToastMessage('Product added successfully');
      }
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to save product', 'error');
    }
    setForm({ name: '', price: '', description: '', available: true, image: '', category: 'Mobility', stock: 0, sku: '' });
    setImagePreview('');
  }
  function handleEditProduct(p) {
    setEditing(p.id);
    setForm({ name: p.name, price: String(p.price), description: p.description, available: p.available, image: p.image, category: p.category, stock: p.stock, sku: p.sku });
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
  const [reviews, setReviews] = useState(DEMO_REVIEWS);
  function approveReview(id) {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    showToastMessage('Review approved successfully');
  }
  function rejectReview(id) {
    if (window.confirm('Are you sure you want to reject this review?')) {
      setReviews(reviews.filter(r => r.id !== id));
      showToastMessage('Review rejected successfully');
    }
  }

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

  async function handleOrderStatusUpdate(id, status) {
    try {
      const res = await api.put(`/orders/${id}`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status: res.data.status } : o));
      showToastMessage('Order status updated');
    } catch (err: any) {
      showToastMessage(err.response?.data?.error || 'Failed to update order', 'error');
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
                            value={form.category}
                            onChange={e => setForm({...form, category: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="Mobility">Mobility</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="First Aid">First Aid</option>
                            <option value="Personal Care">Personal Care</option>
                            <option value="Supplements">Supplements</option>
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
                      <div>
                        <label className="text-sm font-medium">Product Image</label>
                        <Input
                          type="file"
                          onChange={handleProductImage}
                          accept="image/*"
                        />
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                        )}
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
                          <tr key={p.id} className="border-b hover:bg-gray-50">
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
                            <tr key={o.id} className="border-b hover:bg-gray-50">
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
                      {users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{u.name}</td>
                          <td className="p-3 text-sm">{u.email}</td>
                          <td className="p-3 text-sm">{u.mobile}</td>
                          <td className="p-3">
                            <Badge variant={u.role === 'admin' ? 'default' : 'outline'}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-500">{u.joinDate}</td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserUpdate(u.id, { status: 'active' })}
                              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserUpdate(u.id, { status: 'inactive' })}
                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactivate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(u.id)}
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
                    <Input placeholder="Admin Name" defaultValue="Admin User" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="admin@mymeds.com" defaultValue="admin@mymeds.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input placeholder="Phone Number" defaultValue="555-0000" />
                  </div>
                  <Button className="bg-[#376f6b] hover:bg-[#2e8f88]">
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pharmacy Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Pharmacy Name</label>
                    <Input placeholder="My Meds Brooklyn Care" defaultValue="My Meds Brooklyn Care" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Textarea placeholder="Pharmacy Address" defaultValue="123 Main St, Brooklyn, NY" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Business Hours</label>
                    <Input placeholder="9:00 AM - 6:00 PM" defaultValue="9:00 AM - 6:00 PM" />
                  </div>
                  <Button className="bg-[#376f6b] hover:bg-[#2e8f88]">
                    Update Information
                  </Button>
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