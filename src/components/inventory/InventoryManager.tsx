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
  Package, AlertTriangle, TrendingUp, TrendingDown, 
  Plus, Edit, Trash2, Eye, Search, Filter,
  BarChart3, ShoppingCart, Truck, DollarSign,
  Calendar, Users, FileText, Download
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  location: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastUpdated: string;
  image?: string;
  description?: string;
  barcode?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: 'active' | 'inactive';
  products: number;
}

interface InventoryManagerProps {
  products: Product[];
  suppliers: Supplier[];
  onUpdateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onAddProduct: (data: Omit<Product, 'id'>) => Promise<void>;
  onUpdateSupplier: (id: number, data: Partial<Supplier>) => Promise<void>;
  onDeleteSupplier: (id: number) => Promise<void>;
  onAddSupplier: (data: Omit<Supplier, 'id'>) => Promise<void>;
}

export function InventoryManager({
  products,
  suppliers,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddSupplier
}: InventoryManagerProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers' | 'analytics'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});

  // Calculate inventory metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;

  const filteredProducts = products.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && product.status !== statusFilter) return false;
    return true;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.minStock) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' };
    if (product.stock >= product.maxStock) return { status: 'overstocked', color: 'bg-blue-100 text-blue-800' };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800' };
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.sku && newProduct.price) {
      await onAddProduct(newProduct as Omit<Product, 'id'>);
      setNewProduct({});
      setShowAddProduct(false);
    }
  };

  const handleAddSupplier = async () => {
    if (newSupplier.name && newSupplier.email) {
      await onAddSupplier(newSupplier as Omit<Supplier, 'id'>);
      setNewSupplier({});
      setShowAddSupplier(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage products, suppliers, and stock levels</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAddProduct(true)}
            className="text-brand hover:text-brand-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAddSupplier(true)}
            className="text-brand hover:text-brand-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Zero inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              At cost price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Available suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'products', label: 'Products', icon: Package },
            { id: 'suppliers', label: 'Suppliers', icon: Truck },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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

      {/* Products Tab */}
      {activeTab === 'products' && (
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
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="medications">Medications</SelectItem>
                      <SelectItem value="supplements">Supplements</SelectItem>
                      <SelectItem value="personal-care">Personal Care</SelectItem>
                      <SelectItem value="medical-devices">Medical Devices</SelectItem>
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
                      <SelectItem value="discontinued">Discontinued</SelectItem>
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

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{product.stock}</span>
                            <Badge className={stockStatus.color}>
                              {stockStatus.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {product.minStock} | Max: {product.maxStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${product.price}</div>
                            <div className="text-sm text-gray-500">Cost: ${product.cost}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.supplier}</TableCell>
                        <TableCell>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < supplier.rating ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.products}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSupplier(supplier)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSupplier(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteSupplier(supplier.id)}
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
                <CardTitle>Stock Level Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low Stock Items</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {lowStockProducts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Out of Stock</span>
                    <Badge variant="outline" className="text-red-600">
                      {outOfStockProducts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="text-sm font-medium">${totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Suppliers</span>
                    <Badge variant="outline" className="text-green-600">
                      {activeSuppliers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Rating</span>
                    <span className="text-sm font-medium">4.2/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Products</span>
                    <span className="text-sm font-medium">{totalProducts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={newProduct.sku || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Enter SKU"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medications">Medications</SelectItem>
                    <SelectItem value="supplements">Supplements</SelectItem>
                    <SelectItem value="personal-care">Personal Care</SelectItem>
                    <SelectItem value="medical-devices">Medical Devices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Supplier</label>
                <Input
                  value={newProduct.supplier || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                  placeholder="Enter supplier"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cost</label>
                <Input
                  type="number"
                  value={newProduct.cost || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Initial Stock</label>
                <Input
                  type="number"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Min Stock Level</label>
                <Input
                  type="number"
                  value={newProduct.minStock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Stock Level</label>
                <Input
                  type="number"
                  value={newProduct.maxStock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, maxStock: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="bg-[#376F6B] hover:bg-[#57BBB6]">
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Supplier Name</label>
                <Input
                  value={newSupplier.name || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={newSupplier.contact || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  placeholder="Enter contact person"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newSupplier.email || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newSupplier.phone || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input
                value={newSupplier.address || ''}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddSupplier(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSupplier} className="bg-[#376F6B] hover:bg-[#57BBB6]">
                Add Supplier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 