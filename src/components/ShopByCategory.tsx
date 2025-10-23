import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: {
    id: number;
    src: string;
    name: string;
    alt: string;
  };
}

interface ShopByCategoryProps {
  onCategorySelect: (categorySlug: string) => void;
  selectedCategory: string;
}

// Get category icon from WooCommerce or fallback to first letter
const getCategoryIcon = (category: ProductCategory): string => {
  // If the category has an image from WooCommerce, use it
  if (category.image && category.image.src) {
    return category.image.src;
  }
  
  // Fallback to empty string to show first letter
  return '';
};

const ShopByCategory: React.FC<ShopByCategoryProps> = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories from WooCommerce
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/woocommerce/categories');
        
        if (response.data.success) {
          // Sort categories by count (highest first) but show all categories
          const sortedCategories = response.data.categories
            .sort((a: ProductCategory, b: ProductCategory) => b.count - a.count);
          
          setCategories(sortedCategories);
        } else {
          throw new Error(response.data.error || 'Failed to load categories');
        }
      } catch (err: any) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
        // Fallback to sample categories for demo
        setCategories([
          { id: 1, name: 'Vitamins & Supplements', slug: 'vitamins-supplements', count: 15 },
          { id: 2, name: 'Personal Care', slug: 'personal-care', count: 12 },
          { id: 3, name: 'Beauty', slug: 'beauty', count: 8 },
          { id: 4, name: 'Household Essentials', slug: 'household', count: 10 },
          { id: 5, name: 'Medicines', slug: 'medicines', count: 20 },
          { id: 6, name: 'First Aid', slug: 'first-aid', count: 6 },
          { id: 7, name: 'Nutrition', slug: 'nutrition', count: 9 },
          { id: 8, name: 'OTC Medicines', slug: 'otc-medicines', count: 18 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categorySlug: string) => {
    onCategorySelect(categorySlug);
  };

  const handleShowAllToggle = () => {
    setShowAll(!showAll);
  };

  // Show first 10 categories by default, all if showAll is true
  const displayedCategories = showAll ? categories : categories.slice(0, 10);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Shop by Category</h2>
        <div className="text-center text-gray-500">
          <p>Unable to load categories. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
        {displayedCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
              selectedCategory === category.slug ? 'bg-[#57BBB6]/10 ring-2 ring-[#57BBB6]' : ''
            }`}
            aria-label={`Browse ${category.name} products`}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                {category.image && category.image.src ? (
                  <img
                    src={category.image.src}
                    alt={category.image.alt || category.name}
                    className="w-12 h-12 object-cover rounded-full"
                    onError={(e) => {
                      // Fallback to letter if image fails
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center">
                          <span class="text-white font-bold text-lg">${category.name.charAt(0)}</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{category.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              {/* Product count badge */}
              {category.count > 0 && (
                <div className="absolute -top-1 -right-1 bg-[#57BBB6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {category.count}
                </div>
              )}
            </div>
            
            <span className="text-xs text-gray-700 text-center leading-tight font-medium">
              {category.name}
            </span>
          </button>
        ))}
      </div>

      {/* Show More/Less Button */}
      {categories.length > 10 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleShowAllToggle}
            className="flex items-center gap-2 text-[#57BBB6] hover:text-[#376F6B] font-medium transition-colors"
          >
            {showAll ? (
              <>
                <span>See less</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>See more</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopByCategory;
