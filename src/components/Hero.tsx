import { Button } from "@/components/ui/button";
import { Phone, Truck, Clock, ArrowRight, Shield, Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  onRefillClick: () => void;
}

export const Hero = ({ onRefillClick }: HeroProps) => {
  const navigate = useNavigate();

  const handleCallClick = () => {
    const phoneNumber = '3473126458';
    const telLink = `tel:${phoneNumber}`;
    
    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
      window.location.href = telLink;
    } else {
      if (confirm(`Call ${phoneNumber}?`)) {
        window.open(telLink);
      }
    }
  };

  return (
    <section className="relative min-h-[85vh] bg-[#E8F4F3]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[75vh]">
          
          {/* Left Column - Text Content */}
          <div className="text-left space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#376F6B] text-white px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>Trusted by Our Community</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#376F6B] leading-tight">
                Your Way to
                <span className="block text-[#57BBB6]">
                  Better Health
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                Your Neighbourhood Pharmacy, making your access to trusted care easier and more reliable. Providing exceptional pharmaceutical care and personalised services to our community.
              </p>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onRefillClick}
                size="lg" 
                className="bg-[#376F6B] hover:bg-[#2A5A56] text-white text-lg px-8 py-6 rounded-xl shadow-lg"
              >
                <Heart className="mr-3 h-6 w-6" />
                Refill Prescription
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/shop')}
                className="text-lg px-8 py-6 rounded-xl border-2 border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white"
              >
                <ShoppingCart className="mr-3 h-6 w-6" />
                Shop Products
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
                <span className="text-sm font-medium">Licensed Pharmacists</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
                <span className="text-sm font-medium">Same Day Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
                <span className="text-sm font-medium">Insurance Accepted</span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="pt-2">
              <Button 
                onClick={handleCallClick}
                variant="ghost"
                className="text-[#376F6B] hover:bg-[#376F6B]/10 text-lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                (347) 312-6458
              </Button>
            </div>
          </div>

          {/* Right Column - Image Container */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl">
              <div className="bg-white border-4 border-white rounded-2xl shadow-sm overflow-hidden">
                <div className="aspect-[4/3] w-full">
                  <img
                    src="/images/new/pharmacy-hero.jpg"
                    alt="Professional pharmacy care and service"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};