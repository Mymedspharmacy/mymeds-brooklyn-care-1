import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import ShopByCategory from '@/components/ShopByCategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  ShoppingCart, 
  Star, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Plus,
  Minus,
  X,
  ArrowRight,
  Trash2
} from 'lucide-react';
import api from '@/lib/api';

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  categories: ProductCategory[];
  images: ProductImage[];
  stock_quantity: number;
  stock_status: string;
  manage_stock: boolean;
  average_rating: string;
  rating_count: number;
  tags: { id: number; name: string; slug: string }[];
  attributes: unknown[];
  variations: unknown[];
  weight: string;
  dimensions: { length: string; width: string; height: string };
  permalink: string;
  status: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ApiResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

interface CategoriesResponse {
  success: boolean;
  categories: ProductCategory[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface LocationState {
  clearCart?: boolean;
  orderSuccess?: boolean;
}

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('title-asc'); // 'title-asc', 'title-desc', 'price-asc', 'price-desc'
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    // Check if we need to clear cart after successful order
    const state = location.state as LocationState;
    if (state?.clearCart) {
      setCart([]);
      localStorage.removeItem('cart');
      // Show success message
      if (state?.orderSuccess) {
        toast({
          title: 'Order Placed Successfully!',
          description: 'Your cart has been cleared. Thank you for your order!',
        });
      }
      // Clear the navigation state
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      // Load cart from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
    }
  }, [location.state, navigate, toast]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '12',
        search: searchQuery,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        sort: sortOrder
      });

      const response = await api.get(`/woocommerce/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
      } else {
        throw new Error(response.data.error || 'Failed to load products');
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.error || 'Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, sortOrder]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get('/woocommerce/categories');
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Format price
  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    // Don't change page if it's the same page
    if (page === currentPage) return;
    
    setCurrentPage(page);
    // Scroll to top of products section when page changes
    setTimeout(() => {
      const productsSection = document.querySelector('#products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Update quantity
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Remove from cart
  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.sale_price || item.price || '0');
      return total + (price * item.quantity);
    }, 0);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadProducts();
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortOrder('title-asc');
    setCurrentPage(1);
  };

  // Get product image
  const getProductImage = (product: Product) => {
    return product.images?.[0]?.src || '/placeholder-product.jpg';
  };

  // Check if product is on sale
  const isOnSale = (product: Product) => {
    return product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price);
  };

  // Get discount percentage
  const getDiscountPercentage = (product: Product) => {
    if (!isOnSale(product)) return 0;
    const regularPrice = parseFloat(product.regular_price);
    const salePrice = parseFloat(product.sale_price || '0');
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  return (
    <>
      <SEOHead 
        title="Shop - My Meds Pharmacy | Health Products & Medications"
        description="Browse our complete selection of health products, medications, and wellness items. Fast delivery and secure checkout."
        keywords="online pharmacy, health products, medications, wellness, vitamins, supplements"
      />
      
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        />

        {/* Hero Section */}
        <section 
          className="text-white py-16 relative overflow-hidden"
          style={{
            backgroundImage: `url('/src/assets/top-view-assortment-pills-with-copy-space.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Online Shop</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover a wide range of health products, over-the-counter medications, vitamins, and wellness essentials.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shop by Category Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <ShopByCategory 
              onCategorySelect={handleCategoryChange}
              selectedCategory={selectedCategory}
            />
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="bg-white py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title-asc">Name A-Z</SelectItem>
                    <SelectItem value="title-desc">Name Z-A</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* Cart Button */}
                <Button
                  onClick={() => setIsCartOpen(true)}
                  className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden sm:inline">Cart</span>
                  {cart.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products-section" className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#57BBB6]" />
                <span className="ml-4 text-lg text-gray-600">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Products</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => loadProducts()} className="bg-red-600 hover:bg-red-700">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={handleClearFilters} className="bg-[#57BBB6] hover:bg-[#376F6B] text-white">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="relative">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg';
                          }}
                        />
                        
                        {/* Sale Badge */}
                        {isOnSale(product) && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                            -{getDiscountPercentage(product)}%
                          </Badge>
                        )}

                        {/* Stock Status */}
                        {product.stock_status === 'outofstock' && (
                          <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                          {product.name}
                        </CardTitle>
                        
                        <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.short_description?.replace(/<[^>]*>/g, '') || product.description?.replace(/<[^>]*>/g, '')}
                        </CardDescription>

                        {/* Rating */}
                        {product.average_rating && parseFloat(product.average_rating) > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(parseFloat(product.average_rating))
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({product.rating_count})
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          {isOnSale(product) ? (
                            <>
                              <span className="text-lg font-bold text-red-600">
                                {formatPrice(product.sale_price || '0')}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.regular_price || '0')}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-[#376F6B]">
                              {formatPrice(product.price || '0')}
                            </span>
                          )}
                        </div>

                        {/* Categories */}
                        {product.categories && product.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {product.categories.slice(0, 2).map(category => (
                              <Badge key={category.id} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock_status === 'outofstock'}
                          className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_status === 'outofstock' ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="w-full mt-2 border-[#57BBB6] text-[#57BBB6] hover:bg-[#E8F4F3] hover:text-[#376F6B]"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>
            
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="bg-white text-[#376F6B] hover:bg-[#E8F4F3] disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => handlePageChange(i + 1)}
                        disabled={currentPage === i + 1 || loading}
                        className={currentPage === i + 1 
                          ? "bg-[#57BBB6] hover:bg-[#376F6B] text-white cursor-default" 
                          : "bg-white text-[#376F6B] hover:bg-[#E8F4F3] disabled:opacity-50"
                        }
                      >
                        {loading && currentPage === i + 1 ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          i + 1
                        )}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="bg-white text-[#376F6B] hover:bg-[#E8F4F3] disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Shopping Cart Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
            ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#376F6B]">Your Cart</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-8">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-[#376F6B] text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                      <div className="flex items-center mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2 text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-[#376F6B]">
                  {formatPrice(getCartTotal().toString())}
                </span>
              </div>
              <Button 
                onClick={() => navigate('/checkout', { state: { cart } })}
                className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>

        {/* Overlay for sidebar */}
        {isCartOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCartOpen(false)}
          ></div>
        )}

        <Footer />
      </div>
    </>
  );
}