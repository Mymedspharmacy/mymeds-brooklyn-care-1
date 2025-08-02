import { Button } from "@/components/ui/button";
import { Phone, Truck, Clock, ArrowRight, Shield, Heart, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

interface HeroProps {
  onRefillClick: () => void;
  onAppointmentClick: () => void;
  onTransferClick: () => void;
}

// Hero slider images - High-quality professional pharmacy images
const heroImages = [
  {
    src: "/images/hero/pharmacy-modern.jpg", // Modern pharmacy interior
    alt: "Modern pharmacy with professional staff and clean environment",
    title: "Professional Care",
    subtitle: "Expert pharmacists ready to serve you with personalized attention"
  },
  {
    src: "/images/hero/pharmacy-consultation.jpg", // Consultation area
    alt: "Pharmacist providing one-on-one consultation",
    title: "Personal Consultation",
    subtitle: "Comprehensive medication reviews and expert health advice"
  },
  {
    src: "/images/hero/pharmacy-prescription.jpg", // Prescription counter
    alt: "Prescription counter with medications and professional service",
    title: "Fast Prescription Service",
    subtitle: "Quick refills and transfers with the highest standards of care"
  },
  {
    src: "/images/hero/pharmacy-wellness.jpg", // Health products
    alt: "Health and wellness products display",
    title: "Complete Health Solutions",
    subtitle: "From prescriptions to wellness products for your entire family"
  },
  {
    src: "/images/hero/pharmacy-delivery.jpg", // Delivery service
    alt: "Pharmacy delivery service",
    title: "Convenient Delivery",
    subtitle: "Same-day local delivery for your prescriptions and health products"
  }
];

export const Hero = ({ onRefillClick, onAppointmentClick, onTransferClick }: HeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    // If image fails to load, use the first image as fallback
    if (index > 0) {
      const imgElement = document.querySelector(`[data-slide="${index}"]`) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = heroImages[0].src;
      }
    }
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image.src}
              alt={image.alt}
              data-slide={index}
              className="w-full h-full object-cover"
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#376f6b]/90 via-[#376f6b]/80 to-[#376f6b]/70"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Navigation Arrows - Hidden on mobile */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            
            {/* Left Column - Main Content */}
            <div className="text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/30">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Trusted by Brooklyn Community </span>
                <span className="sm:hidden">Trusted </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Your Health,
                  <span className="block text-[#57bbb6]">Our Priority</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
                  Professional pharmaceutical care with personalized service. 
                  Fast prescription refills, free delivery, and expert consultation 
                  for the Brooklyn community.
                </p>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center lg:justify-start">
                <Button 
                  onClick={onRefillClick}
                  size="lg" 
                  className="bg-[#57bbb6] hover:bg-[#4a9a94] text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-[#57bbb6] group"
                >
                  <Heart className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Refill Prescription</span>
                  <span className="sm:hidden">Refill Rx</span>
                  <ArrowRight className="ml-2 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={onAppointmentClick}
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl border-2 border-white/50 text-white hover:bg-white hover:text-[#376f6b] transition-all duration-300 transform hover:scale-105 backdrop-blur-sm group"
                >
                  <Clock className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Book Appointment</span>
                  <span className="sm:hidden">Appointment</span>
                  <ArrowRight className="ml-2 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Secondary Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={onTransferClick}
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-white/30 text-white hover:bg-white hover:text-[#376f6b] transition-all duration-300 transform hover:scale-105 backdrop-blur-sm group"
                >
                  <ArrowRight className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Transfer Prescription</span>
                  <span className="sm:hidden">Transfer Rx</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => window.location.href = '/shop'}
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-white/30 text-white hover:bg-white hover:text-[#376f6b] transition-all duration-300 transform hover:scale-105 backdrop-blur-sm group"
                >
                  <ShoppingCart className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Shop Products</span>
                  <span className="sm:hidden">Shop</span>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#57bbb6] rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium">Licensed Pharmacists</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#57bbb6] rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium">Same Day Service</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#57bbb6] rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium">Insurance Accepted</span>
                </div>
              </div>

              {/* Special Offers Banner */}
              <div className="bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-2">
                      Special Offers
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Free Prescription Refills</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Free Shipping on Orders $50+</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={onRefillClick}
                    size="sm"
                    className="bg-[#57bbb6] hover:bg-[#4a9a94] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Free Delivery Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[#57bbb6] p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg">Free Delivery</h3>
                      <p className="text-white/80 text-xs sm:text-sm">Local prescription delivery within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Extended Hours Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[#57bbb6] p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg">Extended Hours</h3>
                      <p className="text-white/80 text-xs sm:text-sm">Open 6 days a week for your convenience</p>
                    </div>
                  </div>
                </div>

                {/* Expert Care Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[#57bbb6] p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg">Expert Care</h3>
                      <p className="text-white/80 text-xs sm:text-sm">Professional consultation and medication review</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Service Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[#57bbb6] p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg">Easy Transfer</h3>
                      <p className="text-white/80 text-xs sm:text-sm">Transfer prescriptions from any pharmacy</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Number Display */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 text-center hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group" onClick={handleCallClick}>
                <p className="text-white/80 text-xs sm:text-sm mb-2">Need immediate assistance?</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#57bbb6] group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold group-hover:text-[#57bbb6] transition-colors duration-300">(347) 312-6458</p>
                </div>
                <p className="text-white/60 text-xs sm:text-sm group-hover:text-white/80 transition-colors duration-300">Click to call • Available 6 days a week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center text-white/60 animate-bounce">
          <span className="text-xs sm:text-sm mb-2">Scroll to explore</span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-white/60 rounded-full mt-1 sm:mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};