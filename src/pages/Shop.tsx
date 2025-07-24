import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Search, Filter, X, Plus, Minus } from 'lucide-react';
import api from '../lib/api';
import { PaymentForm } from '@/components/PaymentForm';

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
    <div className="min-h-screen bg-[#f5fefd]">
      {/* Free Delivery Banner */}
      <div className="bg-[#376f6b] text-white py-3">
        <div className="container-fluid text-center">
          <p className="mb-0 fw-medium">
            🚚 Free delivery over $50 in Brooklyn and Manhattan
          </p>
        </div>
      </div>
      
      {/* Header with Bootstrap */}
      <div className="bg-white shadow-sm border-bottom border-[#57bbb6]" style={{ borderBottomColor: '#57bbb6', borderBottomWidth: '1px' }}>
        <div className="container-fluid py-3 py-sm-4">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="display-6 display-sm-5 display-lg-4 fw-normal text-[#376f6b] mb-0">SHOP</h1>
            </div>
            <div className="col-auto">
              <button 
                onClick={() => setShowCart(true)}
                className="btn btn-primary bg-[#376f6b] border-[#376f6b] position-relative"
                style={{ width: '3rem', height: '3rem' }}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-[#57bbb6] text-[#231f20]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4 py-lg-5">
        {/* Search Bar with Bootstrap */}
        <div className="row mb-4">
          <div className="col-12 col-sm-6 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-[#57bbb6]">
                <Search size={20} className="text-[#376f6b]" />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control border-[#57bbb6] focus:border-[#376f6b]"
              />
            </div>
          </div>
        </div>

        {/* Mobile Categories Dropdown with Bootstrap */}
        <div className="row d-lg-none mb-4">
          <div className="col-12">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select border-[#57bbb6] text-[#376f6b] fw-medium"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content with Bootstrap Grid */}
        <div className="row g-4">
          {/* Desktop Sidebar with Bootstrap */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '2rem' }}>
              <div className="card-header bg-white border-0">
                <h5 className="card-title text-[#376f6b] mb-0">Categories</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`list-group-item list-group-item-action border-0 rounded mb-1 ${
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
          </div>

          {/* Products Grid with Bootstrap */}
          <div className="col-12 col-lg-9">
            <div className="row g-3 g-md-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col-12 col-sm-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-lg hover-shadow-xl transition-all duration-300">
                    <div className="position-relative">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="card-img-top cursor-pointer"
                        style={{ height: '200px', objectFit: 'cover' }}
                        onClick={() => setShowProductDetail(product)}
                      />
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle ${
                          wishlist.includes(product.id)
                            ? 'btn-danger'
                            : 'btn-light text-[#376f6b]'
                        }`}
                        style={{ width: '2.5rem', height: '2.5rem' }}
                      >
                        <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      </button>
                      {product.originalPrice > product.price && (
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-danger fw-bold">SALE</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-[#57bbb6] text-[#231f20] fw-semibold">
                          {product.category}
                        </span>
                        <div className="d-flex align-items-center gap-1">
                          <Star size={14} className="text-warning fill-current" />
                          <small className="fw-semibold text-[#376f6b]">{product.rating}</small>
                          <small className="text-muted">({product.reviews})</small>
                        </div>
                      </div>
                      
                      <h6 className="card-title text-[#231f20] mb-2 cursor-pointer hover:text-[#376f6b] line-clamp-2"
                          onClick={() => setShowProductDetail(product)}>
                        {product.name}
                      </h6>
                      
                      <p className="card-text text-[#376f6b] small mb-3 line-clamp-2 flex-grow-1">{product.description}</p>
                      
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="h5 fw-normal text-[#57bbb6] mb-0">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-muted text-decoration-line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.available}
                        className="btn btn-primary bg-[#376f6b] border-[#376f6b] w-100 fw-semibold"
                      >
                        {product.available ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="offcanvas offcanvas-end show" style={{ visibility: 'visible' }} tabIndex={-1}>
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title text-[#376f6b]">Shopping Cart</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowCart(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body d-flex flex-column">
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <ShoppingCart size={48} className="text-muted mb-3" />
                <p className="text-muted">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-grow-1">
                  {cart.map((item) => (
                    <div key={item.id} className="card mb-3 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-4">
                            <img src={item.image} alt={item.name} className="img-fluid rounded" />
                          </div>
                          <div className="col-8">
                            <h6 className="card-title small mb-1">{item.name}</h6>
                            <p className="card-text small text-muted mb-2">${item.price}</p>
                            <div className="input-group input-group-sm">
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus size={14} />
                              </button>
                              <input 
                                type="text" 
                                className="form-control text-center" 
                                value={item.quantity} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>Total: ${cartTotal.toFixed(2)}</strong>
                  </div>
                  <button 
                    className="btn btn-primary bg-[#376f6b] border-[#376f6b] w-100 fw-semibold"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-normal text-[#376f6b]">{showProductDetail.name}</h2>
                <button onClick={() => setShowProductDetail(null)} className="text-[#376f6b] hover:text-[#57bbb6]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img src={showProductDetail.image} alt={showProductDetail.name} className="w-full rounded-lg" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#57bbb6] text-[#231f20] px-3 py-1 rounded-full font-semibold">
                      {showProductDetail.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={20} className="text-yellow-400 fill-current" />
                      <span className="font-semibold text-[#376f6b]">{showProductDetail.rating}</span>
                      <span className="text-gray-500">({showProductDetail.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <p className="text-[#376f6b] text-lg mb-4">{showProductDetail.description}</p>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-[#57bbb6]">${showProductDetail.price}</span>
                    {showProductDetail.originalPrice > showProductDetail.price && (
                      <span className="text-xl text-gray-500 line-through">${showProductDetail.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#231f20] mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {showProductDetail.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-[#376f6b]">
                          <div className="w-2 h-2 bg-[#57bbb6] rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      addToCart(showProductDetail);
                      setShowProductDetail(null);
                    }}
                    disabled={!showProductDetail.available}
                    className="w-full bg-[#376f6b] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#57bbb6] transition-colors disabled:opacity-50"
                  >
                    {showProductDetail.available ? 'Add to Cart' : 'Out of Stock'}
                  </button>
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
                    className="w-full bg-[#376f6b] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#57bbb6] transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#376f6b] mb-2">Order Placed Successfully!</h3>
            <p className="text-[#231f20] mb-6">Thank you for your purchase. We'll contact you soon to confirm your order and arrange delivery.</p>
            <button
              onClick={() => setOrderPlaced(false)}
              className="bg-[#376f6b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#57bbb6] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 