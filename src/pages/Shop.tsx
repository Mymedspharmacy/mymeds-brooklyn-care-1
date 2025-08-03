import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Search, Filter, X, Plus, Minus, ExternalLink } from 'lucide-react';
import { PaymentForm } from '@/components/PaymentForm';
import wooCommerceAPI from '../lib/woocommerce';
import { useScrollToTop } from '@/hooks/useScrollToTop';

// WooCommerce integration
export default function Shop() {
  useScrollToTop();
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#57bbb6]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-[#376f6b] hover:text-[#57bbb6] transition-colors duration-300 p-2 rounded-lg hover:bg-[#57bbb6]/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-4xl font-normal text-[#376f6b]">SHOP</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-[#57bbb6]/20">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#376f6b] to-[#57bbb6] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ShoppingCart className="w-12 h-12 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-[#376f6b] mb-6">
            Coming Soon
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#57bbb6] mb-8 font-medium">
            Our Online Pharmacy Shop
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're working hard to bring you a comprehensive online pharmacy experience. 
            Soon you'll be able to browse our full range of health products, prescription medications, 
            and wellness supplies with convenient online ordering and delivery.
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#376f6b] mb-2">Wide Selection</h3>
              <p className="text-sm text-gray-600">Prescription medications, OTC products, and health supplies</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#376f6b] mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Same-day delivery in Brooklyn and Manhattan</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#376f6b] mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">Licensed pharmacists available for consultation</p>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="bg-gradient-to-r from-[#376f6b] to-[#57bbb6] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Something Now?</h3>
            <p className="text-lg mb-6 opacity-90">
              Visit our physical location or call us for immediate assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:3473126458"
                className="bg-white text-[#376f6b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call (347) 312-6458
              </a>
              <a 
                href="https://maps.app.goo.gl/gXSVqF25sAB7r6m76"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center gap-2 border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visit Us
              </a>
            </div>
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