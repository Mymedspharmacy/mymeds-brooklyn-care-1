import { useState } from 'react';
import { CheckCircle, ArrowRight, Truck, Package, Phone, ShoppingCart, Clock, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HowItWorksProps {
  className?: string;
  showTitle?: boolean;
}

export const HowItWorks = ({ className = '', showTitle = true }: HowItWorksProps) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      icon: ShoppingCart,
      title: "Place your order",
      description: "Order online, by phone, or in-store",
      details: "Choose from our easy ordering options. Our user-friendly website, dedicated phone line, or visit us in person for personalized service."
    },
    {
      id: 2,
      icon: Package,
      title: "We prepare & package",
      description: "Our team carefully prepares your order",
      details: "Licensed pharmacists review and prepare your medications with the highest standards of safety and accuracy."
    },
    {
      id: 3,
      icon: CheckCircle,
      title: "Get tracking info",
      description: "Receive real-time updates",
      details: "Stay informed with SMS notifications, email updates, and real-time tracking through our secure patient portal."
    },
    {
      id: 4,
      icon: Truck,
      title: "Same-day delivery",
      description: "Fast delivery to your doorstep",
      details: "Enjoy same-day delivery within Brooklyn, with secure handling and professional delivery personnel."
    }
  ];

  return (
    <section className={`py-8 sm:py-12 md:py-16 relative bg-[#E8F4F3] ${showTitle ? '' : 'pt-0'}`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-100 pointer-events-none"
        style={{
          backgroundImage: `url('/images/new/WhatsApp Image 2025-08-18 at 3.04.02 AM.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Overlay with #e6d4ab color */}
      <div className="absolute inset-0 bg-[#e6d4ab] opacity-60 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showTitle && (
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto font-medium">
              Simple, transparent, and efficient - your healthcare journey made easy
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              className="group cursor-pointer"
            >
              <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 relative overflow-hidden">
                <CardContent className="p-6 sm:p-8 text-center relative z-10">
                  {/* Step Number Circle */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl font-bold text-white">{step.id}</span>
                    </div>
                    
                    {/* Arrow */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 text-[#57BBB6]">
                        <ArrowRight className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-[#57BBB6]/20 rounded-xl flex items-center justify-center mx-auto">
                      <step.icon className="h-6 w-6 text-[#57BBB6]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[#57BBB6] group-hover:text-[#376F6B] transition-colors duration-200">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#57BBB6] font-medium leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Expandable Details */}
                    <div className="overflow-hidden">
                      <p className={`text-xs sm:text-sm text-[#57BBB6]/80 leading-relaxed pt-2 transition-all duration-200 ${
                        hoveredStep === step.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
                      }`}>
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#57BBB6] h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(step.id / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-16 h-16 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trusted Service</h3>
            <p className="text-white/90 text-sm">Licensed pharmacists ensuring your safety and satisfaction</p>
          </div>
          
          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-16 h-16 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Support</h3>
            <p className="text-white/90 text-sm">Assistance for all your healthcare needs</p>
          </div>
          
          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-16 h-16 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-white/90 text-sm">HIPAA compliant with complete privacy protection</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#57BBB6] rounded-full"></div>
              <span className="text-sm font-medium">FDA Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#57BBB6] rounded-full"></div>
              <span className="text-sm font-medium">Licensed Pharmacy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#57BBB6] rounded-full"></div>
              <span className="text-sm font-medium">Insurance Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#57BBB6] rounded-full"></div>
              <span className="text-sm font-medium">Free Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
