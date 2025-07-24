import { Truck, Pill, Shield, Users, Stethoscope, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServicesProps {
  onAppointmentClick: () => void;
  onShopClick?: () => void;
}

export const Services = ({ onAppointmentClick, onShopClick }: ServicesProps) => {
  const services = [
    {
      icon: Truck,
      title: "Free Prescription Delivery",
      description: "Convenient, reliable delivery service to your doorstep. Perfect for patients with mobility issues or busy schedules.",
      features: ["Free delivery over $50", "Brooklyn & Manhattan areas", "Same-day delivery available", "Contactless delivery options", "Prescription tracking"],
      hasBooking: false
    },
    {
      icon: Pill,
      title: "Medication Synchronization",
      description: "Align all your prescription refill dates to one convenient pickup day each month.",
      features: ["Single monthly pickup", "Automated refill reminders", "Reduced pharmacy visits"],
      hasBooking: false
    },
    {
      icon: Shield,
      title: "Immunizations",
      description: "Stay protected with our comprehensive vaccination services administered by certified pharmacists.",
      features: ["Flu shots", "COVID-19 vaccines", "Travel immunizations", "Insurance accepted"],
      hasBooking: true
    },
    {
      icon: Users,
      title: "Medication Therapy Management",
      description: "Personalized medication reviews to optimize your therapy and prevent drug interactions.",
      features: ["One-on-one consultations", "Drug interaction checks", "Cost-saving opportunities"],
      hasBooking: true
    },
    {
      icon: Stethoscope,
      title: "Durable Medical Equipment",
      description: "Quality medical equipment and supplies to support your health and mobility needs.",
      features: ["Wheelchairs & walkers", "Blood pressure monitors", "Diabetic supplies"],
      hasBooking: false,
      hasShop: true
    },
    {
      icon: MessageCircle,
      title: "Private Consultation",
      description: "Confidential discussions about your medications, health concerns, and wellness goals.",
      features: ["Medication counseling", "Health screenings", "Wellness advice"],
      hasBooking: true
    }
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive pharmaceutical care designed to meet all your health and wellness needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md h-full flex flex-col">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
                  {service.description}
                </CardDescription>
                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-xs sm:text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                {service.hasBooking && (
                  <Button 
                    onClick={onAppointmentClick}
                    className="w-full text-sm sm:text-base"
                  >
                    Book Appointment
                  </Button>
                )}
                {service.hasShop && (
                  <Button 
                    onClick={onShopClick}
                    variant="secondary"
                    className="w-full text-sm sm:text-base"
                  >
                    Shop Equipment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};