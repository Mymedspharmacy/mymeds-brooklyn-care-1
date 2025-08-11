import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart, Truck, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { wooCommerceAPI } from '@/lib/woocommerce';

interface WooCommerceProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{ src: string; alt: string }>;
  short_description: string;
  categories: Array<{ name: string; slug: string }>;
  tags: Array<{ name: string; slug: string }>;
  stock_status: string;
  average_rating: string;
  rating_count: number;
  on_sale: boolean;
  featured: boolean;
  total_sales: number;
  permalink: string;
}

export const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured products from WooCommerce
      const products = await wooCommerceAPI.getProducts({
        featured: true,
        per_page: 8,
        status: 'publish',
        orderby: 'total_sales',
        order: 'desc'
      });

      if (products && Array.isArray(products)) {
        setProducts(products);
      } else {
        setError('No featured products found');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Failed to load featured products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: WooCommerceProduct) => {
    navigate(`/product/${product.id}`, { 
      state: { 
        product,
        relatedProducts: products.filter(p => p.id !== product.id).slice(0, 4)
      }
    });
  };

  const handleShopClick = () => {
    navigate('/shop');
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
            className={`h-3 w-3 ${
              i < fullStars 
                ? 'text-yellow-400 fill-current' 
                : i === fullStars && hasHalfStar 
                  ? 'text-yellow-400 fill-current opacity-50' 
                  : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#376F6B] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <Button 
                onClick={fetchFeaturedProducts}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-600 text-sm mb-4">No featured products available at the moment.</p>
              <Button 
                onClick={handleShopClick}
                className="bg-[#376F6B] hover:bg-[#2A5A56] text-white"
              >
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#376F6B] text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
            <Star className="h-5 w-5" />
            Featured Products
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
            Shop Our
            <span className="block text-[#2A5A56]">Featured Products</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of premium health products, carefully curated for quality and effectiveness.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="relative mb-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img 
                      src={product.images[0]?.src || "/images/placeholder.svg"} 
                      alt={product.images[0]?.alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Sale Badge */}
                  {product.on_sale && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0">
                      Sale
                    </Badge>
                  )}
                  
                  {/* Featured Badge */}
                  {product.featured && (
                    <Badge className="absolute top-2 right-2 bg-[#376F6B] text-white border-0">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  {/* Category */}
                  {product.categories[0] && (
                    <p className="text-xs text-[#376F6B] font-medium uppercase tracking-wide">
                      {product.categories[0].name}
                    </p>
                  )}
                  
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#376F6B] transition-colors duration-300 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  {product.average_rating && (
                    <div className="flex items-center justify-between">
                      {renderRating(product.average_rating)}
                      <span className="text-xs text-gray-500">
                        {product.rating_count} reviews
                      </span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    {product.on_sale ? (
                      <>
                        <span className="text-lg font-bold text-[#376F6B]">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.regular_price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-[#376F6B]">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Short Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.short_description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm"
                    className="flex-1 bg-[#376F6B] hover:bg-[#2A5A56] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic would go here
                      console.log('Adding to cart:', product.id);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#376F6B] to-[#2A5A56] rounded-2xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Explore More?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Browse our complete collection of health products, supplements, and wellness solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-white text-[#376F6B] hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                onClick={handleShopClick}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop All Products
              </Button>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Free Shipping $50+</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
