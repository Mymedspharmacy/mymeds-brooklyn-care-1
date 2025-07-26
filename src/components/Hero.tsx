import { Button } from "@/components/ui/button";
import { Phone, Truck, Clock } from "lucide-react";
import heroImage from "@/assets/pharmacy-hero.jpg";

interface HeroProps {
  onRefillClick: () => void;
}

export const Hero = ({ onRefillClick }: HeroProps) => {
  return (
    <section id="home" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-brand-black leading-tight">
                Your Trusted
                <span className="text-brand block">Neighborhood Pharmacy</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-brand-dark mt-4 sm:mt-6 leading-relaxed">
                Providing exceptional pharmaceutical care and personalized service to the Brooklyn community since day one. Your health is our priority.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={onRefillClick}
                size="lg" 
                className="bg-[#376f6b] hover:bg-[#5EABD6] hover:text-white text-white text-lg px-8 py-4 border-2 border-[#376f6b]"
              >
                Refill Prescription
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-2 border-[#376f6b] text-[#376f6b] hover:bg-[#376f6b] hover:text-white transition-colors"
                onClick={() => {
                  // Try to open phone dialer
                  const phoneNumber = '3473126458';
                  const telLink = `tel:${phoneNumber}`;
                  
                  // For mobile devices, this will open the phone app
                  // For desktop, it will show a confirmation dialog
                  if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                    window.location.href = telLink;
                  } else {
                    // For desktop browsers, show a confirmation dialog
                    if (confirm(`Call ${phoneNumber}?`)) {
                      window.open(telLink);
                    }
                  }
                }}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8">
              <div className="text-center p-4 bg-background rounded-lg shadow-sm">
                <Truck className="h-8 w-8 text-[#57bbb6] mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">Free Delivery </h3>
                <p className="text-sm text-pharmacy-gray">Local prescription delivery</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg shadow-sm">
                <Clock className="h-8 w-8 text-[#57bbb6] mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">Extended Hours</h3>
                <p className="text-sm text-pharmacy-gray">Open 6 days a week</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg shadow-sm">
                <Phone className="h-8 w-8 text-[#57bbb6] mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">Expert Care</h3>
                <p className="text-sm text-pharmacy-gray">Professional consultation</p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 md:mt-0">
            <div className="bg-background rounded-2xl shadow-2xl p-1 sm:p-2">
              <img 
                src={heroImage}
                alt="Modern pharmacy interior" 
                className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-xl"
              />
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};