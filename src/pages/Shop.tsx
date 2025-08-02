import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Search, Filter, X, Plus, Minus, ExternalLink } from 'lucide-react';
import { PaymentForm } from '@/components/PaymentForm';
import wooCommerceAPI from '../lib/woocommerce';

// WooCommerce integration
export default function Shop() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    city: '', 
    zip: '', 
    notes: '' 
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadProducts(),
          loadCategories()
        ]);
      } catch (error) {
        console.error('Failed to initialize shop data:', error);
        setError('Failed to load shop data. Please refresh the page.');
      }
    };

    initializeData();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Check if WooCommerce is configured
      if (!import.meta.env.VITE_WOOCOMMERCE_URL || 
          !import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || 
          !import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET) {
        console.warn('WooCommerce not configured, using sample products');
        setError('WooCommerce not configured. Please set up VITE_WOOCOMMERCE_URL, VITE_WOOCOMMERCE_CONSUMER_KEY, and VITE_WOOCOMMERCE_CONSUMER_SECRET in your .env file.');
        setProducts([
          {
            id: 1,
            name: 'Sample Product 1',
            description: 'This is a sample product for testing purposes.',
            price: '19.99',
            regular_price: '24.99',
            sale_price: '19.99',
            images: [{ src: '/placeholder.svg' }],
            categories: [{ name: 'Health & Wellness' }]
          },
          {
            id: 2,
            name: 'Sample Product 2',
            description: 'Another sample product for testing.',
            price: '29.99',
            regular_price: '29.99',
            sale_price: null,
            images: [{ src: '/placeholder.svg' }],
            categories: [{ name: 'Supplements' }]
          }
        ]);
        return;
      }
      
      const productsData = await wooCommerceAPI.getProducts({
        per_page: 50,
        status: 'publish',
      });
      // Ensure productsData is an array
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        console.error('Products data is not an array:', productsData);
        setProducts([]);
        setError('Invalid products data received');
      }
    } catch (err) {
      setError('Failed to load products from WooCommerce');
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Check if WooCommerce is configured
      if (!import.meta.env.VITE_WOOCOMMERCE_URL || 
          !import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || 
          !import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET) {
        console.warn('WooCommerce not configured, using sample categories');
        setCategories([
          { id: 1, name: 'Health & Wellness' },
          { id: 2, name: 'Supplements' },
          { id: 3, name: 'Personal Care' },
          { id: 4, name: 'Medical Supplies' }
        ]);
        return;
      }
      
      const categoriesData = await wooCommerceAPI.getCategories();
      // Ensure categoriesData is an array
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.error('Categories data is not an array:', categoriesData);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };

  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || 
      product.categories?.some(cat => cat.name === selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) : [];

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1,
        price: product.price || product.regular_price || '0'
      }];
    });
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }

  function toggleWishlist(productId) {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (!order.name || !order.email || !order.phone || !order.address) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Move to payment step
    setShowCheckout(false);
    setShowPayment(true);
  }

  async function handlePaymentSuccess(paymentIntentId: string) {
    try {
      // For WooCommerce integration, you might want to redirect to WooCommerce checkout
      // or handle the order through WooCommerce API
      console.log('Payment successful:', paymentIntentId);
      
      // Show success message
      setOrderPlaced(true);
      setCart([]);
      setShowPayment(false);
      
      // Reset order form
      setOrder({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Failed to process order:', error);
      alert('Failed to process order. Please try again or contact us directly.');
    }
  }

  function handlePaymentError(error: string) {
    alert(`Payment failed: ${error}`);
    setShowPayment(false);
    setShowCheckout(true);
  }

  // Get category names for display
  const categoryNames = ['All', ...categories.map(cat => cat.name)];

  // Get featured image URL
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].src;
    }
    // Return a default pharmacy image or data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik01MCA1MEgxNTBWMTUwSDUwVjUwWiIgZmlsbD0iIzU3QkJCNiIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGhhcm1hY3k8L3RleHQ+Cjwvc3ZnPgo=';
  };

  // Get product price
  const getProductPrice = (product) => {
    if (product.sale_price) {
      return product.sale_price;
    }
    return product.price || product.regular_price || '0';
  };

  // Get original price for sale items
  const getOriginalPrice = (product) => {
    if (product.sale_price && product.regular_price) {
      return product.regular_price;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f5fefd]">
      {/* Free Delivery Banner */}
      <div className="bg-[#376f6b] text-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-medium">
            🚚 Free Shipping over $50 in Brooklyn and Manhattan
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#57bbb6]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-4xl font-normal text-[#376f6b]">SHOP</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCart(true)}
                className="relative bg-[#376f6b] text-white p-3 rounded-full hover:bg-[#57bbb6] transition-colors"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#57bbb6] text-[#231f20] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#376f6b]" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
            />
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar - Categories */}
          <div className="md:w-64 w-full flex-shrink-0 mb-4 md:mb-0">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 sticky top-24 md:static">
              <h3 className="text-lg font-medium text-[#376f6b] mb-3 md:mb-4">Categories</h3>
              <div className="flex md:block flex-wrap gap-2 md:space-y-2">
                {categoryNames.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full md:w-auto text-left px-3 py-2 rounded-md transition-colors text-sm md:text-base ${
                      selectedCategory === category
                        ? 'bg-[#376f6b] text-white'
                        : 'text-[#376f6b] hover:bg-[#57bbb6] hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#376f6b] mx-auto"></div>
                <p className="text-[#376f6b] mt-4">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                {error.includes('WooCommerce not configured') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">To set up WooCommerce:</h4>
                    <ol className="text-blue-700 text-sm space-y-1">
                      <li>1. Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root</li>
                      <li>2. Add your WooCommerce credentials:</li>
                      <li className="ml-4">VITE_WOOCOMMERCE_URL="https://your-wordpress-site.com"</li>
                      <li className="ml-4">VITE_WOOCOMMERCE_CONSUMER_KEY="your-consumer-key"</li>
                      <li className="ml-4">VITE_WOOCOMMERCE_CONSUMER_SECRET="your-consumer-secret"</li>
                      <li>3. Restart your development server</li>
                    </ol>
                  </div>
                )}
                <button 
                  onClick={loadProducts}
                  className="bg-[#376f6b] text-white px-6 py-3 rounded-lg hover:bg-[#57bbb6] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-[#57bbb6]/20">
                    <div className="relative">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name} 
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => setShowProductDetail(product)}
                      />
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                          wishlist.includes(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-[#376f6b] hover:bg-[#57bbb6] hover:text-white'
                        }`}
                      >
                        <Heart size={20} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      </button>
                      {getOriginalPrice(product) && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                          SALE
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {product.categories && product.categories.length > 0 && (
                          <span className="text-xs bg-[#57bbb6] text-[#231f20] px-2 py-1 rounded-full font-semibold">
                            {product.categories[0].name}
                          </span>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-[#376f6b]">
                            {product.average_rating || '4.5'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({product.review_count || '0'})
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-normal text-[#231f20] mb-2 cursor-pointer hover:text-[#376f6b]"
                          onClick={() => setShowProductDetail(product)}>
                        {product.name}
                      </h3>
                      
                      <p className="text-[#376f6b] text-sm mb-3 line-clamp-2" 
                         dangerouslySetInnerHTML={{ __html: product.short_description || product.description }} />
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-normal text-[#57bbb6]">${getProductPrice(product)}</span>
                        {getOriginalPrice(product) && (
                          <span className="text-lg text-gray-500 line-through">${getOriginalPrice(product)}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.stock_status || product.stock_status === 'outofstock'}
                        className="w-full bg-[#376f6b] text-white py-3 rounded-lg font-semibold hover:bg-[#2e8f88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.stock_status === 'outofstock' ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-[#57bbb6] mb-4" />
                <p className="text-[#231f20] text-lg">No products found</p>
                <p className="text-[#376f6b]">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-full sm:max-w-md h-full overflow-y-auto">
            <div className="p-6 border-b border-[#57bbb6]/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-normal text-[#376f6b]">Shopping Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-[#376f6b] hover:text-[#57bbb6]">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-[#57bbb6] mb-4" />
                  <p className="text-[#231f20] text-lg">Your cart is empty</p>
                  <p className="text-[#376f6b]">Add some products to get started!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-[#57bbb6]/20 rounded-lg">
                        <img src={getProductImage(item)} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#231f20]">{item.name}</h4>
                          <p className="text-[#57bbb6] font-bold">${item.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-[#57bbb6] flex items-center justify-center hover:bg-[#57bbb6] hover:text-white"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-[#57bbb6] flex items-center justify-center hover:bg-[#57bbb6] hover:text-white"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-[#57bbb6]/20 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold text-[#231f20]">
                      <span>Total:</span>
                      <span className="text-[#57bbb6]">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="w-full bg-[#376f6b] text-white py-3 rounded-lg font-semibold hover:bg-[#2e8f88] transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-full sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-normal text-[#376f6b]">{showProductDetail.name}</h2>
                <button onClick={() => setShowProductDetail(null)} className="text-[#376f6b] hover:text-[#57bbb6]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img src={getProductImage(showProductDetail)} alt={showProductDetail.name} className="w-full rounded-lg" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {showProductDetail.categories && showProductDetail.categories.length > 0 && (
                      <span className="bg-[#57bbb6] text-[#231f20] px-3 py-1 rounded-full font-semibold">
                        {showProductDetail.categories[0].name}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Star size={20} className="text-yellow-400 fill-current" />
                      <span className="font-semibold text-[#376f6b]">
                        {showProductDetail.average_rating || '4.5'}
                      </span>
                      <span className="text-gray-500">
                        ({showProductDetail.review_count || '0'} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-[#376f6b] text-lg mb-4" 
                       dangerouslySetInnerHTML={{ __html: showProductDetail.description }} />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-[#57bbb6]">${getProductPrice(showProductDetail)}</span>
                    {getOriginalPrice(showProductDetail) && (
                      <span className="text-xl text-gray-500 line-through">${getOriginalPrice(showProductDetail)}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      addToCart(showProductDetail);
                      setShowProductDetail(null);
                    }}
                    disabled={!showProductDetail.stock_status || showProductDetail.stock_status === 'outofstock'}
                    className="w-full bg-[#376f6b] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#2e8f88] transition-colors disabled:opacity-50"
                  >
                    {showProductDetail.stock_status === 'outofstock' ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-normal text-[#376f6b]">Checkout</h2>
                <button onClick={() => setShowCheckout(false)} className="text-[#376f6b] hover:text-[#57bbb6]">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={order.name}
                    onChange={(e) => setOrder({ ...order, name: e.target.value })}
                    className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={order.email}
                    onChange={(e) => setOrder({ ...order, email: e.target.value })}
                    className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
                    required
                  />
                </div>
                
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={order.phone}
                  onChange={(e) => setOrder({ ...order, phone: e.target.value })}
                  className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={order.address}
                  onChange={(e) => setOrder({ ...order, address: e.target.value })}
                  className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City *"
                    value={order.city}
                    onChange={(e) => setOrder({ ...order, city: e.target.value })}
                    className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code *"
                    value={order.zip}
                    onChange={(e) => setOrder({ ...order, zip: e.target.value })}
                    className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
                    required
                  />
                </div>
                
                <textarea
                  placeholder="Additional Notes (optional)"
                  value={order.notes}
                  onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                  className="w-full p-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b] h-24 resize-none"
                />
                
                <div className="border-t border-[#57bbb6]/20 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold text-[#231f20] mb-4">
                    <span>Order Total:</span>
                    <span className="text-[#57bbb6]">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-[#376f6b] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#2e8f88] transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-normal text-[#376f6b]">Payment</h2>
                <button onClick={() => setShowPayment(false)} className="text-[#376f6b] hover:text-[#57bbb6]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#231f20] mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-[#57bbb6]">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <PaymentForm
                amount={cartTotal}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-full sm:max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#376f6b] mb-2">Order Placed Successfully!</h3>
            <p className="text-[#231f20] mb-6">Thank you for your purchase. We'll contact you soon to confirm your order and arrange delivery.</p>
            <button
              onClick={() => setOrderPlaced(false)}
              className="bg-[#376f6b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2e8f88] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 