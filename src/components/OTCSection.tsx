import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Star, Package, Thermometer, Shield } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  features?: string[];
}

const otcProducts: Product[] = [
  {
    id: 1,
    name: "Extra Strength Acetaminophen",
    brand: "Tylenol",
    price: 8.99,
    originalPrice: 10.99,
    category: "Pain Relief",
    description: "Fast-acting pain relief for headaches, muscle aches, and fever reduction.",
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    image: "/api/placeholder/300/200",
    features: ["500mg caplets", "100 count", "Fast absorption", "Gentle on stomach"]
  },
  {
    id: 2,
    name: "Children's Cough Syrup",
    brand: "Delsym",
    price: 12.49,
    category: "Cold & Flu",
    description: "12-hour cough relief for children ages 4 and up. Grape flavor.",
    rating: 4.6,
    reviews: 856,
    inStock: true,
    image: "/api/placeholder/300/200",
    features: ["12-hour relief", "Grape flavor", "Ages 4+", "Alcohol-free"]
  },
  {
    id: 3,
    name: "Vitamin D3 1000 IU",
    brand: "Nature Made",
    price: 15.99,
    originalPrice: 18.99,
    category: "Vitamins",
    description: "Supports bone health, immune function, and muscle health.",
    rating: 4.7,
    reviews: 2103,
    inStock: true,
    image: "/api/placeholder/300/200",
    features: ["1000 IU per tablet", "180 count", "USP Verified", "No artificial colors"]
  },
  {
    id: 4,
    name: "Allergy Relief Tablets",
    brand: "Claritin",
    price: 24.99,
    category: "Allergy",
    description: "24-hour non-drowsy allergy relief from pollen, dust, and pet dander.",
    rating: 4.5,
    reviews: 1634,
    inStock: false,
    image: "/api/placeholder/300/200",
    features: ["24-hour relief", "Non-drowsy", "30 tablets", "Indoor & outdoor allergies"]
  }
];

export const OTCSection = () => {
  const [cart, setCart] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const addToCart = (productId: number) => {
    setCart(prev => [...prev, productId]);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-8 w-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Over-the-Counter Products</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse our selection of trusted OTC medications, vitamins, and health products available for immediate purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {otcProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md h-full flex flex-col">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                
                {/* Sale Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                    SALE
                  </Badge>
                )}
                
                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-3 right-3 rounded-full ${
                    wishlist.includes(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/80 text-brand-dark hover:bg-brand hover:text-brand-white'
                  }`}
                >
                  <Heart 
                    size={16} 
                    fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} 
                  />
                </Button>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-0">
                <CardDescription className="text-muted-foreground mb-4 text-sm leading-relaxed flex-1">
                  {product.description}
                </CardDescription>

                {/* Features */}
                {product.features && (
                  <div className="mb-4">
                    <ul className="space-y-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-center text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-primary">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  {product.inStock ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      In Stock
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => addToCart(product.id)}
                  disabled={!product.inStock}
                  className="w-full"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="bg-muted/50 rounded-2xl p-8 lg:p-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Thermometer className="h-8 w-8 text-primary" />
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Need Help Choosing the Right Product?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our licensed pharmacists are here to help you select the best over-the-counter products for your needs. 
              Get personalized recommendations based on your symptoms and health conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="text-base"
              >
                Consult a Pharmacist
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="text-base"
              >
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};