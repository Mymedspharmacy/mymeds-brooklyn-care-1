import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Truck, Shield, Clock, ArrowLeft, Share2, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { wooCommerceAPI } from '@/lib/woocommerce';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

interface WooCommerceProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{ src: string; alt: string }>;
  short_description: string;
  description: string;
  categories: Array<{ name: string; slug: string }>;
  tags: Array<{ name: string; slug: string }>;
  stock_status: string;
  average_rating: string;
  rating_count: number;
  on_sale: boolean;
  featured: boolean;
  total_sales: number;
  permalink: string;
  attributes?: Array<{ name: string; options: string[] }>;
  variations?: Array<{ id: number; price: string; attributes: Array<{ name: string; option: string }> }>;
}

interface ProductViewProps {
  product?: WooCommerceProduct;
  relatedProducts?: WooCommerceProduct[];
}

export default function ProductView({ product: propProduct, relatedProducts: propRelatedProducts }: ProductViewProps) {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<WooCommerceProduct | null>(propProduct || null);
  const [relatedProducts, setRelatedProducts] = useState<WooCommerceProduct[]>(propRelatedProducts || []);
  const [loading, setLoading] = useState(!propProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!propProduct && productId) {
      fetchProduct();
    }
  }, [productId, propProduct]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await wooCommerceAPI.getProduct(parseInt(productId!));
      
      if (productData) {
        setProduct(productData);
        setSelectedImage(0);
        
        // Fetch related products based on category
        if (productData.categories && productData.categories.length > 0) {
          await fetchRelatedProducts(productData.categories[0].id);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: number) => {
    try {
      const products = await wooCommerceAPI.getProductsByCategory(categoryId, {
        per_page: 4,
        exclude: [productId],
        status: 'publish'
      });
      
      if (products && Array.isArray(products)) {
        setRelatedProducts(products);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    try {
      // Here you would typically call your cart API
      console.log('Adding to cart:', {
        productId: product.id,
        quantity,
        variation: selectedVariation
      });
      
      // Show success message or redirect to cart
      alert('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderRating = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars 
                ? 'text-yellow-400 fill-current' 
                : i === fullStars && hasHalfStar 
                  ? 'text-yellow-400 fill-current opacity-50' 
                  : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
        <div className="pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#376F6B] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading product...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
        <div className="pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
              <Button onClick={() => navigate('/shop')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={product ? `${product.name} - My Meds Pharmacy | Health Store` : "Product Details - My Meds Pharmacy"}
        description={product ? `${product.short_description} - Shop ${product.name} at My Meds Pharmacy. Quality health products with fast delivery.` : "Browse our selection of health products and medications at My Meds Pharmacy."}
        keywords={product ? `${product.name}, ${product.categories.map(cat => cat.name).join(', ')}, health products, pharmacy, online pharmacy, health store` : "health products, pharmacy, online store, medications, health supplies"}
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/shop')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
            <span>/</span>
            <span>{product.categories[0]?.name || 'Products'}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={product.images[selectedImage]?.src || "/images/placeholder.svg"} 
                  alt={product.images[selectedImage]?.alt || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-20 bg-white rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-[#376F6B] shadow-lg' 
                          : 'border-gray-200 hover:border-[#376F6B]/50'
                      }`}
                    >
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {product.on_sale && (
                    <Badge className="bg-red-500 text-white border-0">
                      On Sale
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-[#376F6B] text-white border-0">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-[#376F6B] text-[#376F6B]">
                    {product.categories[0]?.name}
                  </Badge>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4">
                  {renderRating(product.average_rating)}
                  <span className="text-sm text-gray-500">
                    {product.rating_count} reviews
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.total_sales} sold
                  </span>
                </div>
                
                <p className="text-lg text-gray-600">
                  {product.short_description}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {product.on_sale ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[#376F6B]">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.regular_price)}
                    </span>
                    <Badge className="bg-red-500 text-white border-0">
                      Save ${(parseFloat(product.regular_price) - parseFloat(product.sale_price)).toFixed(2)}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-[#376F6B]">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Product Options */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="space-y-4">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {attr.name}
                      </label>
                      <div className="flex gap-2">
                        {attr.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 ${
                              selectedVariation?.attributes?.find(a => a.name === attr.name)?.option === option
                                ? 'border-[#376F6B] bg-[#376F6B] text-white'
                                : 'border-gray-200 text-gray-700 hover:border-[#376F6B]/50'
                            }`}
                            onClick={() => {
                              // Handle variation selection
                              console.log('Selected variation:', attr.name, option);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-1"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-0 focus:ring-0"
                      min="1"
                      max="99"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 99}
                      className="px-3 py-1"
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    size="lg"
                    className="flex-1 bg-[#376F6B] hover:bg-[#2A5A56] text-white"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Product Features */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Product Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free Shipping $50+</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </TabsContent>
              
              <TabsContent value="ingredients" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Active Ingredients</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">
                      Please refer to the product description above for detailed ingredient information.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
                    <Button variant="outline" className="border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white" onClick={() => setShowReviewForm(true)}>
                      Write a Review
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-600">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#376F6B] mb-4">
                  Related Products
                </h2>
                <p className="text-gray-600">
                  You might also be interested in these products
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card 
                    key={relatedProduct.id} 
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <img 
                          src={relatedProduct.images[0]?.src || "/images/placeholder.svg"} 
                          alt={relatedProduct.images[0]?.alt || relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#376F6B] transition-colors duration-300 line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {renderRating(relatedProduct.average_rating)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {relatedProduct.on_sale ? (
                          <>
                            <span className="font-bold text-[#376F6B]">
                              {formatPrice(relatedProduct.sale_price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(relatedProduct.regular_price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-[#376F6B]">
                            {formatPrice(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
        </div>
      </>
    );
}
