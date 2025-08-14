import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShoppingCart, Heart, Star, Eye, Package, Truck, Shield, Clock, CheckCircle, ArrowRight, Minus, Plus, Home, Baby, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsTicker } from "@/components/NewsTicker";
import { SEOHead } from "@/components/SEOHead";
import { wooCommerceAPI } from "@/lib/woocommerce";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  categories: Array<{ id: number; name: string }>;
  images: Array<{ src: string; alt: string }>;
  stock_quantity: number;
  average_rating: string;
  rating_count: number;
  tags: Array<{ id: number; name: string }>;
  attributes: Array<{ name: string; options: string[] }>;
}

interface CartItem {
  product: WooCommerceProduct;
  quantity: number;
}

// Stripe Checkout Component
const CheckoutForm = ({ cart, total, onSuccess, onCancel }: { 
  cart: CartItem[], 
  total: number, 
  onSuccess: () => void, 
  onCancel: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'usd' })
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'Customer Name', // You can add a form for this
          },
        }
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!stripe || loading} 
          className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Pay ${total.toFixed(2)}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from WooCommerce
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          wooCommerceAPI.getProducts({ per_page: 100 }),
          wooCommerceAPI.getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: cat.count
        })));
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: WooCommerceProduct) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || 
                           product.categories.some(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleCheckoutSuccess = () => {
    alert('Payment successful! Your order has been placed.');
    setCart([]);
    setShowCheckout(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => window.location.href = '/'}
          onAppointmentClick={() => window.location.href = '/'}
          onTransferClick={() => window.location.href = '/'}
        />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#57BBB6] mx-auto mb-4" />
            <p className="text-lg text-[#376F6B]">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Shop Health Products - My Meds Pharmacy | Brooklyn's Health & Wellness Store"
        description="Shop our comprehensive selection of health products, vitamins, supplements, and over-the-counter medications. Free delivery on orders over $25 in Brooklyn."
        keywords="health products, vitamins, supplements, over the counter medications, Brooklyn pharmacy shop, health store, wellness products, pharmaceutical supplies"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => window.location.href = '/'}
          onAppointmentClick={() => window.location.href = '/'}
          onTransferClick={() => window.location.href = '/'}
        />
      <NewsTicker />
      
      <div className="pt-20">
        {/* Hero Section */}
                  <section className="py-16 sm:py-20 md:py-24 text-white relative overflow-hidden">
          {/* Background Image Placeholder - Replace with actual pharmacy products/shopping image */}
                       <div
               className="absolute inset-0 opacity-60 pointer-events-none"
               style={{
                 backgroundImage: `url('/images/new/shop1.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             ></div>
             
             {/* Balanced Overlay for Text Readability */}
             <div className="absolute inset-0 bg-black/30 z-10"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating Medical Icons */}
            <div className="absolute top-20 left-10 text-white/15 animate-bounce" style={{ animationDelay: '0s' }}>
              <Package className="w-8 h-8" />
            </div>
            <div className="absolute top-32 right-20 text-white/12 animate-bounce" style={{ animationDelay: '1s' }}>
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="absolute bottom-32 left-1/4 text-white/18 animate-bounce" style={{ animationDelay: '2s' }}>
              <Shield className="w-7 h-7" />
            </div>
            <div className="absolute bottom-20 right-1/3 text-white/14 animate-bounce" style={{ animationDelay: '3s' }}>
              <Heart className="w-8 h-8" />
            </div>
            
            {/* Animated Particles */}
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            
            {/* Pulse Waves */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-48 h-48 border border-white/15 rounded-full animate-ping"></div>
              <div className="w-48 h-48 border border-white/15 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '1s' }}></div>
              <div className="w-48 h-48 border border-white/15 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white text-[#57BBB6] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg hover:scale-105 transition-transform duration-300">
                <Package className="h-5 w-5 animate-pulse" />
                Health & Wellness
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                Shop Our 
                <span className="block text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent animate-pulse">
                  Premium Products
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto font-medium leading-relaxed">
                Discover our carefully curated selection of health products, supplements, and wellness essentials 
                to support your journey to better health.
              </p>
              
              {/* Decorative Underline */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-8 rounded-full animate-pulse"></div>
            </div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  />
                </div>
                <Button className="bg-white text-[#57BBB6] hover:bg-gray-100 px-6 py-3" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className={`${
                    selectedCategory === "all"
                      ? "bg-white text-[#57BBB6] hover:bg-gray-100"
                      : "border-white text-white hover:bg-white hover:text-[#57BBB6]"
                  } px-4 py-2 rounded-full transition-all duration-300`}
                >
                  <Package className="h-4 w-4 mr-2" />
                  All Products
                  <Badge variant="secondary" className="ml-2 bg-[#57BBB6] text-white">
                    {products.length}
                  </Badge>
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name.toLowerCase() ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.name.toLowerCase())}
                    className={`${
                      selectedCategory === category.name.toLowerCase()
                        ? "bg-white text-[#57BBB6] hover:bg-gray-100"
                        : "border-white text-white hover:bg-white hover:text-[#57BBB6]"
                    } px-4 py-2 rounded-full transition-all duration-300`}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    {category.name}
                    <Badge variant="secondary" className="ml-2 bg-[#57BBB6] text-white">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-6">
                    {/* Product Image */}
                    <div className="w-full h-48 bg-[#D5C6BC] rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].src} 
                          alt={product.images[0].alt || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-[#57BBB6]" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.categories[0]?.name || 'General'}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium">{product.average_rating}</span>
                          <span className="text-sm text-gray-500 ml-1">({product.rating_count})</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-[#376F6B] mb-2 group-hover:text-[#57BBB6] transition-colors duration-300">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description.replace(/<[^>]*>/g, '')}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-[#57BBB6]">
                          ${product.price}
                        </span>
                        {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price) && (
                          <span className="text-lg text-gray-400 line-through">
                            ${product.regular_price}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        <Badge 
                          variant={product.stock_quantity > 0 ? "default" : "destructive"}
                          className={product.stock_quantity > 0 ? "bg-green-500" : "bg-red-500"}
                        >
                          {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => addToCart(product)}
                        disabled={product.stock_quantity <= 0}
                        className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B] text-white disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="icon" className="border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Shopping Cart */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-50">
            <Card className="bg-[#57BBB6] text-white border-0 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ShoppingCart className="h-6 w-6" />
                    <div>
                      <p className="text-white font-semibold">
                        {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                      </p>
                      <p className="text-white/80 text-sm">
                        Total: ${cartTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowCheckout(true)}
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 px-4 py-2 rounded-xl"
                  >
                    Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-[#376F6B] mb-4">Checkout</h3>
              
              {/* Cart Summary */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  cart={cart}
                  total={cartTotal}
                  onSuccess={handleCheckoutSuccess}
                  onCancel={() => setShowCheckout(false)}
                />
              </Elements>
            </div>
          </div>
        )}

        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-[#D5C6BC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="bg-[#57BBB6] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Fast Delivery
                  </h3>
                  <p className="text-white/90">
                    Free shipping on orders over $50. Same-day delivery available in Brooklyn.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#57BBB6] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Quality Guaranteed
                  </h3>
                  <p className="text-white/90">
                    All products are authentic and backed by our 100% satisfaction guarantee.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#57BBB6] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    24/7 Support
                  </h3>
                  <p className="text-white/90">
                    Our pharmacy team is always available to answer your questions and provide guidance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Need Help Choosing?
                </h3>
                <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                  Our pharmacists are here to help you find the right products for your health needs
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Get Personalized Recommendations
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Contact Our Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
        </div>
      </>
    );
} 