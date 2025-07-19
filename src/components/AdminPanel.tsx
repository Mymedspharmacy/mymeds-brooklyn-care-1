import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Package, FileText, Mail, Phone, MapPin, Clock, Truck, Store } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  inStock: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ product: Product; quantity: number }>;
  total: number;
  status: string;
  date: string;
  orderType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryArea?: string;
  prescriptionType?: 'refill' | 'new';
  prescriptionDetails?: {
    medicationName?: string;
    prescriptionNumber?: string;
    physicianName?: string;
  };
  specialInstructions?: string;
}

export const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Digital Thermometer",
      price: 15.99,
      category: "Medical Devices",
      description: "Accurate digital thermometer with fever alarm",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80",
      inStock: true
    },
    {
      id: 2,
      name: "Blood Pressure Monitor",
      price: 45.99,
      category: "Medical Devices",
      description: "Automatic blood pressure monitor with large display",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=400&q=80",
      inStock: true
    }
  ]);

  const [blogs, setBlogs] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Managing Diabetes: Essential Tips",
      excerpt: "Learn effective strategies for managing diabetes through medication adherence and lifestyle changes.",
      content: "Diabetes management requires consistent medication timing, blood sugar monitoring, and healthy lifestyle choices...",
      author: "Dr. Sarah Johnson, PharmD",
      category: "Chronic Care",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1001,
      customerName: "John Smith",
      customerEmail: "john.smith@email.com",
      customerPhone: "(718) 555-0123",
      items: [],
      total: 0,
      status: "Processing",
      date: "2024-01-15",
      orderType: "delivery",
      deliveryAddress: "123 Main St, Apt 4B, Brooklyn, NY 11201",
      deliveryArea: "Brooklyn Heights",
      prescriptionType: "refill",
      prescriptionDetails: {
        medicationName: "Lisinopril 10mg",
        prescriptionNumber: "RX123456",
        physicianName: "Dr. Wilson"
      },
      specialInstructions: "Please call before delivery"
    },
    {
      id: 1002,
      customerName: "Maria Garcia",
      customerEmail: "maria.g@email.com",
      customerPhone: "(347) 555-0456",
      items: [],
      total: 0,
      status: "Ready",
      date: "2024-01-15",
      orderType: "pickup",
      prescriptionType: "new",
      prescriptionDetails: {
        medicationName: "Metformin 500mg",
        physicianName: "Dr. Rodriguez"
      }
    }
  ]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    category: "",
    description: "",
    image: "",
    inStock: true
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    image: ""
  });

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      ...productForm
    };
    setProducts([...products, newProduct]);
    setProductForm({ name: "", price: 0, category: "", description: "", image: "", inStock: true });
    setShowProductForm(false);
  };

  const handleAddBlog = () => {
    const newBlog: BlogPost = {
      id: Date.now(),
      ...blogForm
    };
    setBlogs([...blogs, newBlog]);
    setBlogForm({ title: "", excerpt: "", content: "", author: "", category: "", image: "" });
    setShowBlogForm(false);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleDeleteBlog = (id: number) => {
    setBlogs(blogs.filter(b => b.id !== id));
  };

  const handleSendOrderConfirmation = (order: Order) => {
    const orderDetails = `
      Order #${order.id} Confirmation
      ================================
      Customer: ${order.customerName}
      Phone: ${order.customerPhone}
      Email: ${order.customerEmail}
      
      Service Type: ${order.prescriptionType === 'refill' ? 'Prescription Refill' : 'New Prescription'}
      Medication: ${order.prescriptionDetails?.medicationName || 'N/A'}
      ${order.prescriptionDetails?.prescriptionNumber ? `Rx Number: ${order.prescriptionDetails.prescriptionNumber}` : ''}
      Physician: ${order.prescriptionDetails?.physicianName || 'N/A'}
      
      ${order.orderType === 'delivery' ? 
        `DELIVERY ORDER
        Address: ${order.deliveryAddress}
        Area: ${order.deliveryArea}
        ${order.specialInstructions ? `Instructions: ${order.specialInstructions}` : ''}` 
        : 
        'PICKUP ORDER - Ready for collection at pharmacy'
      }
      
      Status: ${order.status}
      Date: ${order.date}
      
      My Meds Pharmacy
      2242 65th St., Brooklyn, NY 11204
      (347) 312-6458
    `;

    console.log('Order confirmation:', orderDetails);
    console.log(`Sending SMS to ${order.customerPhone}`);
    console.log(`Sending email to ${order.customerEmail}`);
    
    alert(`Order confirmation sent to ${order.customerName}!\n\nSMS: ${order.customerPhone}\nEmail: ${order.customerEmail}`);
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const pickupOrders = orders.filter(order => order.orderType === 'pickup');
  const deliveryOrders = orders.filter(order => order.orderType === 'delivery');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pharmacy-secondary/10 to-pharmacy-primary/10 p-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pharmacy-dark mb-4">My Meds Admin Dashboard</h1>
          <p className="text-xl text-pharmacy-dark/70">
            Complete pharmacy management system
          </p>
          <div className="flex justify-center mt-4">
            <img 
              src="https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=200&q=80" 
              alt="Pharmacy management" 
              className="h-20 w-auto rounded-lg shadow-md"
            />
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-pharmacy-white border border-pharmacy-secondary/30">
            <TabsTrigger value="orders" className="data-[state=active]:bg-pharmacy-primary data-[state=active]:text-pharmacy-white text-pharmacy-dark">
              <Package className="h-4 w-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-pharmacy-primary data-[state=active]:text-pharmacy-white text-pharmacy-dark">
              <Store className="h-4 w-4 mr-2" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="blogs" className="data-[state=active]:bg-pharmacy-primary data-[state=active]:text-pharmacy-white text-pharmacy-dark">
              <FileText className="h-4 w-4 mr-2" />
              Health Blogs ({blogs.length})
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-pharmacy-primary data-[state=active]:text-pharmacy-white text-pharmacy-dark">
              <Truck className="h-4 w-4 mr-2" />
              Delivery Areas
            </TabsTrigger>
          </TabsList>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pickup Orders */}
              <div>
                <h2 className="text-2xl font-bold text-pharmacy-dark mb-4 flex items-center">
                  <Store className="h-6 w-6 mr-2 text-pharmacy-primary" />
                  Pickup Orders ({pickupOrders.length})
                </h2>
                <div className="space-y-4">
                  {pickupOrders.map(order => (
                    <Card key={order.id} className="border-pharmacy-secondary/30 bg-pharmacy-white">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-pharmacy-dark text-lg">Order #{order.id}</CardTitle>
                            <CardDescription className="text-pharmacy-dark/70">
                              {order.customerName} • {order.date}
                            </CardDescription>
                          </div>
                          <Badge className={`${
                            order.status === 'Ready' ? 'bg-pharmacy-accent text-pharmacy-white' :
                            order.status === 'Processing' ? 'bg-pharmacy-secondary text-pharmacy-dark' :
                            'bg-pharmacy-primary text-pharmacy-white'
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                          <p className="text-pharmacy-dark"><Phone className="inline h-3 w-3 mr-1 text-pharmacy-primary" />{order.customerPhone}</p>
                          <p className="text-pharmacy-dark"><Mail className="inline h-3 w-3 mr-1 text-pharmacy-primary" />{order.customerEmail}</p>
                          {order.prescriptionDetails && (
                            <div className="bg-pharmacy-secondary/10 p-2 rounded text-xs">
                              <p className="text-pharmacy-dark"><strong>Medication:</strong> {order.prescriptionDetails.medicationName}</p>
                              {order.prescriptionDetails.prescriptionNumber && (
                                <p className="text-pharmacy-dark"><strong>Rx#:</strong> {order.prescriptionDetails.prescriptionNumber}</p>
                              )}
                              <p className="text-pharmacy-dark"><strong>Physician:</strong> {order.prescriptionDetails.physicianName}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="flex-1 text-sm px-2 py-1 border border-pharmacy-secondary/30 rounded text-pharmacy-dark focus:border-pharmacy-primary"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Ready">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <Button 
                            size="sm"
                            onClick={() => handleSendOrderConfirmation(order)}
                            className="bg-pharmacy-accent hover:bg-pharmacy-primary text-pharmacy-white text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Notify
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Delivery Orders */}
              <div>
                <h2 className="text-2xl font-bold text-pharmacy-dark mb-4 flex items-center">
                  <Truck className="h-6 w-6 mr-2 text-pharmacy-primary" />
                  Delivery Orders ({deliveryOrders.length})
                </h2>
                <div className="space-y-4">
                  {deliveryOrders.map(order => (
                    <Card key={order.id} className="border-pharmacy-secondary/30 bg-pharmacy-white">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-pharmacy-dark text-lg">Order #{order.id}</CardTitle>
                            <CardDescription className="text-pharmacy-dark/70">
                              {order.customerName} • {order.date}
                            </CardDescription>
                          </div>
                          <Badge className={`${
                            order.status === 'Delivered' ? 'bg-pharmacy-accent text-pharmacy-white' :
                            order.status === 'Out for Delivery' ? 'bg-pharmacy-light text-pharmacy-white' :
                            order.status === 'Ready' ? 'bg-pharmacy-secondary text-pharmacy-dark' :
                            'bg-pharmacy-primary text-pharmacy-white'
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                          <p className="text-pharmacy-dark"><Phone className="inline h-3 w-3 mr-1 text-pharmacy-primary" />{order.customerPhone}</p>
                          <p className="text-pharmacy-dark"><Mail className="inline h-3 w-3 mr-1 text-pharmacy-primary" />{order.customerEmail}</p>
                          <p className="text-pharmacy-dark"><MapPin className="inline h-3 w-3 mr-1 text-pharmacy-primary" />{order.deliveryArea}</p>
                          <div className="bg-pharmacy-secondary/10 p-2 rounded text-xs">
                            <p className="text-pharmacy-dark"><strong>Address:</strong> {order.deliveryAddress}</p>
                            {order.prescriptionDetails && (
                              <>
                                <p className="text-pharmacy-dark"><strong>Medication:</strong> {order.prescriptionDetails.medicationName}</p>
                                {order.prescriptionDetails.prescriptionNumber && (
                                  <p className="text-pharmacy-dark"><strong>Rx#:</strong> {order.prescriptionDetails.prescriptionNumber}</p>
                                )}
                              </>
                            )}
                            {order.specialInstructions && (
                              <p className="text-pharmacy-dark"><strong>Instructions:</strong> {order.specialInstructions}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="flex-1 text-sm px-2 py-1 border border-pharmacy-secondary/30 rounded text-pharmacy-dark focus:border-pharmacy-primary"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Ready">Ready for Delivery</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <Button 
                            size="sm"
                            onClick={() => handleSendOrderConfirmation(order)}
                            className="bg-pharmacy-accent hover:bg-pharmacy-primary text-pharmacy-white text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Notify
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pharmacy-dark">Product Management</h2>
              <Button 
                onClick={() => setShowProductForm(true)}
                className="bg-pharmacy-primary hover:bg-pharmacy-accent text-pharmacy-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showProductForm && (
              <Card className="border-pharmacy-secondary/30 bg-pharmacy-white">
                <CardHeader>
                  <CardTitle className="text-pharmacy-dark">Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={productForm.image}
                      onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full p-2 border border-pharmacy-secondary/30 rounded-lg h-24 text-pharmacy-dark focus:border-pharmacy-primary"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddProduct}
                      className="bg-pharmacy-primary hover:bg-pharmacy-accent text-pharmacy-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Product
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowProductForm(false)}
                      className="border-pharmacy-primary text-pharmacy-primary hover:bg-pharmacy-primary hover:text-pharmacy-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="border-pharmacy-secondary/30 bg-pharmacy-white">
                  <CardHeader>
                    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg" />
                    <CardTitle className="text-pharmacy-dark">{product.name}</CardTitle>
                    <CardDescription className="text-pharmacy-dark/70">${product.price}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="mb-2 bg-pharmacy-secondary/20 text-pharmacy-primary">
                      {product.category}
                    </Badge>
                    <p className="text-sm text-pharmacy-dark/70 mb-4">{product.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-pharmacy-primary text-pharmacy-primary hover:bg-pharmacy-primary hover:text-pharmacy-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pharmacy-dark">Health Blog Management</h2>
              <Button 
                onClick={() => setShowBlogForm(true)}
                className="bg-pharmacy-primary hover:bg-pharmacy-accent text-pharmacy-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Blog Post
              </Button>
            </div>

            {showBlogForm && (
              <Card className="border-pharmacy-secondary/30 bg-pharmacy-white">
                <CardHeader>
                  <CardTitle className="text-pharmacy-dark">Add New Blog Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Blog Title"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                    <input
                      type="text"
                      placeholder="Author"
                      value={blogForm.author}
                      onChange={(e) => setBlogForm({...blogForm, author: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={blogForm.image}
                      onChange={(e) => setBlogForm({...blogForm, image: e.target.value})}
                      className="p-2 border border-pharmacy-secondary/30 rounded-lg text-pharmacy-dark focus:border-pharmacy-primary"
                    />
                  </div>
                  <textarea
                    placeholder="Excerpt"
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
                    className="w-full p-2 border border-pharmacy-secondary/30 rounded-lg h-24 text-pharmacy-dark focus:border-pharmacy-primary"
                  />
                  <textarea
                    placeholder="Full Content"
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                    className="w-full p-2 border border-pharmacy-secondary/30 rounded-lg h-32 text-pharmacy-dark focus:border-pharmacy-primary"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddBlog}
                      className="bg-pharmacy-primary hover:bg-pharmacy-accent text-pharmacy-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Publish Blog
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBlogForm(false)}
                      className="border-pharmacy-primary text-pharmacy-primary hover:bg-pharmacy-primary hover:text-pharmacy-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {blogs.map(blog => (
                <Card key={blog.id} className="border-pharmacy-secondary/30 bg-pharmacy-white">
                  <CardHeader>
                    <img src={blog.image} alt={blog.title} className="w-full h-32 object-cover rounded-lg" />
                    <CardTitle className="text-pharmacy-dark">{blog.title}</CardTitle>
                    <CardDescription className="text-pharmacy-dark/70">By {blog.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="mb-2 bg-pharmacy-secondary/20 text-pharmacy-primary">
                      {blog.category}
                    </Badge>
                    <p className="text-sm text-pharmacy-dark/70 mb-4">{blog.excerpt}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-pharmacy-primary text-pharmacy-primary hover:bg-pharmacy-primary hover:text-pharmacy-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteBlog(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Delivery Areas Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-pharmacy-dark mb-4">Delivery Coverage Area</h2>
              <div className="bg-pharmacy-white p-6 rounded-lg shadow-lg border border-pharmacy-secondary/30">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-pharmacy-primary mb-3">Brooklyn Areas</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-pharmacy-dark">
                      <div>• Brooklyn Heights</div>
                      <div>• DUMBO</div>
                      <div>• Downtown Brooklyn</div>
                      <div>• Fort Greene</div>
                      <div>• Park Slope</div>
                      <div>• Carroll Gardens</div>
                      <div>• Williamsburg</div>
                      <div>• Greenpoint</div>
                      <div>• Crown Heights</div>
                      <div>• Prospect Heights</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pharmacy-primary mb-3">Manhattan Areas</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm text-pharmacy-dark">
                      <div>• Lower East Side</div>
                      <div>• East Village & West Village</div>
                      <div>• SoHo & Tribeca</div>
                      <div>• Financial District</div>
                      <div>• Chinatown & Little Italy</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-pharmacy-secondary/10 rounded-lg">
                  <p className="text-sm text-pharmacy-dark">
                    <Clock className="inline h-4 w-4 mr-1 text-pharmacy-primary" />
                    <strong>Delivery Hours:</strong> Monday - Friday 10AM - 5PM | Saturday 10AM - 3PM
                  </p>
                  <p className="text-sm text-pharmacy-dark mt-1">
                    <Truck className="inline h-4 w-4 mr-1 text-pharmacy-primary" />
                    <strong>Delivery Fee:</strong> FREE for all prescription orders
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};