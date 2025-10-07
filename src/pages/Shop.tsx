import { useEffect, useState } from "react";
import { redirectToShopSameTab, getShopUrl } from "@/utils/shopRedirect";
import { SEOHead } from "@/components/SEOHead";
import { ShoppingCart, ArrowRight, Loader2, ExternalLink } from "lucide-react";

export default function Shop() {
  const [shopUrl, setShopUrl] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Get the shop URL for display
    setShopUrl(getShopUrl());
    
    // Add a small delay to prevent fast reloading and show the redirect message
    const timer = setTimeout(() => {
      try {
        redirectToShopSameTab();
      } catch (error) {
        console.error('Redirect failed:', error);
        // Fallback: try to open in new tab instead
        window.open(getShopUrl(), '_blank');
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEOHead 
        title="Shop - My Meds Pharmacy | Online Store"
        description="Redirecting to My Meds Pharmacy's online store for a wide range of health products and medications."
        keywords="online pharmacy, shop medications, health products, buy medicine online"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D5C6BC] via-[#F1EEE9] to-[#E8F4F3]">
        <div className="text-center p-8 max-w-2xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShoppingCart className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          
          {/* Main Message */}
          <h1 className="text-4xl sm:text-5xl font-bold text-[#376F6B] mb-6">
            Redirecting to Our Store
              </h1>
              
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            You're being redirected to our full WooCommerce store where you can browse and purchase our complete selection of health products, medications, and wellness items.
          </p>
          
          {/* Warning Message for Development */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Development Note:</strong> The WordPress server needs to be set up. If the redirect doesn't work, please install WordPress and WooCommerce on your server first.
                </p>
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#57BBB6]" />
            <span className="text-[#376F6B] font-semibold text-lg">Opening store...</span>
          </div>

          {/* URL Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
            <p className="text-sm text-gray-600 mb-3">Redirecting to:</p>
            <p className="text-sm font-mono text-[#376F6B] break-all flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              {shopUrl || 'Loading...'}
                  </p>
                </div>

          {/* Manual Redirect Button */}
          <button
            onClick={() => {
              try {
                redirectToShopSameTab();
              } catch (error) {
                console.error('Manual redirect failed:', error);
                // Fallback: open in new tab
                window.open(shopUrl, '_blank');
              }
            }}
            className="inline-flex items-center bg-[#57BBB6] hover:bg-[#376F6B] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            Visit Our Store Now
            <ArrowRight className="h-5 w-5 ml-3" />
          </button>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="w-10 h-10 bg-[#57BBB6]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="h-5 w-5 text-[#57BBB6]" />
                          </div>
              <h3 className="font-semibold text-[#376F6B] mb-2 text-sm">Full Catalog</h3>
              <p className="text-xs text-gray-600">Complete product selection</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="w-10 h-10 bg-[#57BBB6]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="h-5 w-5 text-[#57BBB6]" />
              </div>
              <h3 className="font-semibold text-[#376F6B] mb-2 text-sm">Easy Checkout</h3>
              <p className="text-xs text-gray-600">Secure payment processing</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="w-10 h-10 bg-[#57BBB6]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="h-5 w-5 text-[#57BBB6]" />
              </div>
              <h3 className="font-semibold text-[#376F6B] mb-2 text-sm">Fast Delivery</h3>
              <p className="text-xs text-gray-600">Quick order processing</p>
            </div>
          </div>
        </div>
        </div>
      </>
    );
} 