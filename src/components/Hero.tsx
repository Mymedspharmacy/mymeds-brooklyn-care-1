import { Button } from "@/components/ui/button";
import { Phone, Truck, Clock } from "lucide-react";
import heroImage from "@/assets/pharmacy-hero.jpg";

interface HeroProps {
  onRefillClick: () => void;
}

export const Hero = ({ onRefillClick }: HeroProps) => {
  return (
    <section id="home" className="bg-gradient-to-br from-pharmacy-blue-light to-accent/10 py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Your Trusted
                <span className="text-primary block">Neighborhood Pharmacy</span>
              </h1>
              <p className="text-xl text-pharmacy-gray mt-6 leading-relaxed">
                Providing exceptional pharmaceutical care and personalized service to the Brooklyn community since day one. Your health is our priority.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onRefillClick}
                size="lg" 
                className="bg-primary hover:bg-pharmacy-blue-dark text-lg px-8 py-4"
              >
                Refill Prescription
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => window.open('tel:3473126458')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center p-4 bg-background rounded-lg shadow-sm">
                <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">Free Delivery</h3>
                <p className="text-sm text-pharmacy-gray">Local prescription delivery</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg shadow-sm">
                <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">Extended Hours</h3>
                <p className="text-sm text-pharmacy-gray">Open 6 days a week</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg shadow-sm">
                <Phone className="h-8 w-8 text-pharmacy-purple mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">Expert Care</h3>
                <p className="text-sm text-pharmacy-gray">Professional consultation</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-background rounded-2xl shadow-2xl p-8">
              <img 
                src={heroImage}
                alt="Modern pharmacy interior" 
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full w-24 h-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">25+</div>
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