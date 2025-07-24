import { Button } from "@/components/ui/button";
import { Phone, Truck, Clock } from "lucide-react";
import heroImage from "@/assets/pharmacy-hero.jpg";

interface HeroProps {
  onRefillClick: () => void;
}

export const Hero = ({ onRefillClick }: HeroProps) => {
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
    <section id="home" className="py-10 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-black leading-tight">
                Your Trusted
                <span className="text-brand block">Neighborhood Pharmacy</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-brand-dark mt-4 lg:mt-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Providing exceptional pharmaceutical care and personalized service to the Brooklyn community since day one. Your health is our priority.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={onRefillClick}
                size="lg" 
                className="bg-brand hover:bg-brand-dark text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                Refill Prescription
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-brand text-brand hover:bg-brand-light hover:text-brand-dark w-full sm:w-auto"
                onClick={handleCallClick}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-6 lg:pt-8">
              <div className="text-center p-3 lg:p-4 bg-background rounded-lg shadow-sm border border-gray-100">
                <Truck className="h-6 w-6 lg:h-8 lg:w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-sm lg:text-base">Free Delivery over $50</h3>
                <p className="text-xs lg:text-sm text-pharmacy-gray">Local prescription delivery</p>
              </div>
              <div className="text-center p-3 lg:p-4 bg-background rounded-lg shadow-sm border border-gray-100">
                <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-sm lg:text-base">Extended Hours</h3>
                <p className="text-xs lg:text-sm text-pharmacy-gray">Open 6 days a week</p>
              </div>
              <div className="text-center p-3 lg:p-4 bg-background rounded-lg shadow-sm border border-gray-100">
                <Phone className="h-6 w-6 lg:h-8 lg:w-8 text-pharmacy-purple mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-sm lg:text-base">Expert Care</h3>
                <p className="text-xs lg:text-sm text-pharmacy-gray">Professional consultation</p>
              </div>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="bg-background rounded-2xl shadow-2xl p-1 lg:p-2">
              <img 
                src={heroImage}
                alt="Modern pharmacy interior" 
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
              />
              <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 bg-[#376f6b] text-white rounded-full w-16 h-16 lg:w-24 lg:h-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold">3+</div>
                  <div className="text-xs">Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};