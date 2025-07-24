import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Search, Filter, X, Plus, Minus } from 'lucide-react';
import api from '../lib/api';
import { PaymentForm } from '@/components/PaymentForm';
import { Button } from "@/components/ui/button";

// Comprehensive product catalog
// REMOVE the PRODUCTS array and all demo data

const CATEGORIES = ['All', 'Monitoring', 'Respiratory', 'Mobility', 'Heart Health', 'Cold & Flu', 'First Aid', 'Vitamins & Supplements', 'Digestive Health', 'Personal Care'];

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
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => setError('Failed to load products'));
  }, []);

  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      return [...prev, { ...product, quantity: 1 }];
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
      // Prepare order data for backend
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          productName: item.name
        })),
        total: cartTotal,
        customerInfo: {
          name: order.name,
          email: order.email,
          phone: order.phone,
          address: `${order.address}, ${order.city}, ${order.zip}`,
          notes: order.notes
        },
        paymentIntentId
      };
      
      // Send order to backend
      const response = await api.post('/orders/public', orderData);
      
      console.log('Order submitted successfully:', response.data);
      
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
      console.error('Failed to submit order:', error);
      alert('Failed to submit order. Please try again or contact us directly.');
    }
  }

  function handlePaymentError(error: string) {
    alert(`Payment failed: ${error}`);
    setShowPayment(false);
    setShowCheckout(true);
  }

  return (
    <div className="min-h-screen bg-brand-light/20">
      {/* Free Delivery Banner */}
      <div className="bg-brand-dark text-brand-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-medium">
            🚚 Free delivery over $50 in Brooklyn and Manhattan
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-brand/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-brand-dark">SHOP</h1>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowCart(true)}
                size="icon"
                className="relative p-2 sm:p-3"
              >
                <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-brand text-brand-black text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-dark" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Mobile Categories Dropdown */}
        <div className="lg:hidden mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark text-brand-dark font-medium"
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Desktop Sidebar - Categories */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-medium text-brand-dark mb-4">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                      selectedCategory === category
                        ? 'bg-brand text-brand-white'
                        : 'text-brand-dark hover:bg-brand hover:text-brand-white'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-12">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-brand/20">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-40 sm:h-48 object-cover cursor-pointer"
                      onClick={() => setShowProductDetail(product)}
                    />
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-colors ${
                        wishlist.includes(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-brand-dark hover:bg-brand hover:text-brand-white'
                      }`}
                    >
                      <Heart size={16} className="sm:w-5 sm:h-5" fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                    </button>
                    {product.originalPrice > product.price && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                        SALE
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-brand text-brand-black px-2 py-1 rounded-full font-semibold">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star size={14} className="sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm font-semibold text-brand-dark">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-normal text-brand-black mb-2 cursor-pointer hover:text-brand-dark line-clamp-2"
                        onClick={() => setShowProductDetail(product)}>
                      {product.name}
                    </h3>
                    
                    <p className="text-brand-dark text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg sm:text-2xl font-normal text-brand">${product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm sm:text-lg text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.available}
                      className="w-full text-sm sm:text-base"
                    >
                      {product.available ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6 border-b border-brand/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-normal text-brand-dark">Shopping Cart</h2>
                <Button onClick={() => setShowCart(false)} variant="ghost" size="icon">
                  <X size={24} />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-brand mb-4" />
                  <p className="text-brand-black text-lg">Your cart is empty</p>
                  <p className="text-brand-dark">Add some products to get started!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-brand/20 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-brand-black">{item.name}</h4>
                          <p className="text-brand font-bold">${item.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 rounded-full"
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 rounded-full"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-brand/20 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold text-brand-black">
                      <span>Total:</span>
                      <span className="text-brand">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-normal text-brand-dark">{showProductDetail.name}</h2>
                <Button onClick={() => setShowProductDetail(null)} variant="ghost" size="icon">
                  <X size={24} />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img src={showProductDetail.image} alt={showProductDetail.name} className="w-full rounded-lg" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-brand text-brand-black px-3 py-1 rounded-full font-semibold">
                      {showProductDetail.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={20} className="text-yellow-400 fill-current" />
                      <span className="font-semibold text-brand-dark">{showProductDetail.rating}</span>
                      <span className="text-gray-500">({showProductDetail.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <p className="text-brand-dark text-lg mb-4">{showProductDetail.description}</p>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-brand">${showProductDetail.price}</span>
                    {showProductDetail.originalPrice > showProductDetail.price && (
                      <span className="text-xl text-gray-500 line-through">${showProductDetail.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-brand-black mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {showProductDetail.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-brand-dark">
                          <div className="w-2 h-2 bg-brand rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => {
                      addToCart(showProductDetail);
                      setShowProductDetail(null);
                    }}
                    disabled={!showProductDetail.available}
                    className="w-full text-sm sm:text-base"
                  >
                    {showProductDetail.available ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-normal text-brand-dark">Checkout</h2>
                <Button onClick={() => setShowCheckout(false)} variant="ghost" size="icon">
                  <X size={24} />
                </Button>
              </div>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={order.name}
                    onChange={(e) => setOrder({ ...order, name: e.target.value })}
                    className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={order.email}
                    onChange={(e) => setOrder({ ...order, email: e.target.value })}
                    className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark"
                    required
                  />
                </div>
                
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={order.phone}
                  onChange={(e) => setOrder({ ...order, phone: e.target.value })}
                  className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={order.address}
                  onChange={(e) => setOrder({ ...order, address: e.target.value })}
                  className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark"
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City *"
                    value={order.city}
                    onChange={(e) => setOrder({ ...order, city: e.target.value })}
                    className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code *"
                    value={order.zip}
                    onChange={(e) => setOrder({ ...order, zip: e.target.value })}
                    className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark"
                    required
                  />
                </div>
                
                <textarea
                  placeholder="Additional Notes (optional)"
                  value={order.notes}
                  onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                  className="w-full p-3 border-2 border-brand rounded-lg focus:outline-none focus:border-brand-dark h-24 resize-none"
                />
                
                <div className="border-t border-brand/20 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold text-brand-black mb-4">
                    <span>Order Total:</span>
                    <span className="text-brand">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Place Order
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-normal text-brand-dark">Payment</h2>
                <Button onClick={() => setShowPayment(false)} variant="ghost" size="icon">
                  <X size={24} />
                </Button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-brand-black mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-brand">${cartTotal.toFixed(2)}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-brand-dark mb-2">Order Placed Successfully!</h3>
            <p className="text-brand-black mb-6">Thank you for your purchase. We'll contact you soon to confirm your order and arrange delivery.</p>
            <Button
              onClick={() => setOrderPlaced(false)}
              className="bg-brand text-brand-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 