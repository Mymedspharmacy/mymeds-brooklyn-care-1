import { Truck, Pill, Shield, Users, Stethoscope, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Services = () => {
  const services = [
    {
      icon: Truck,
      title: "Free Prescription Delivery",
      description: "Convenient, reliable delivery service to your doorstep. Perfect for patients with mobility issues or busy schedules.",
      features: ["Same-day delivery available", "Contactless delivery options", "Prescription tracking"]
    },
    {
      icon: Pill,
      title: "Medication Synchronization",
      description: "Align all your prescription refill dates to one convenient pickup day each month.",
      features: ["Single monthly pickup", "Automated refill reminders", "Reduced pharmacy visits"]
    },
    {
      icon: Shield,
      title: "Immunizations",
      description: "Stay protected with our comprehensive vaccination services administered by certified pharmacists.",
      features: ["Flu shots", "COVID-19 vaccines", "Travel immunizations", "Insurance accepted"]
    },
    {
      icon: Users,
      title: "Medication Therapy Management",
      description: "Personalized medication reviews to optimize your therapy and prevent drug interactions.",
      features: ["One-on-one consultations", "Drug interaction checks", "Cost-saving opportunities"]
    },
    {
      icon: Stethoscope,
      title: "Durable Medical Equipment",
      description: "Quality medical equipment and supplies to support your health and mobility needs.",
      features: ["Wheelchairs & walkers", "Blood pressure monitors", "Diabetic supplies"]
    },
    {
      icon: MessageCircle,
      title: "Private Consultation",
      description: "Confidential discussions about your medications, health concerns, and wellness goals.",
      features: ["Medication counseling", "Health screenings", "Wellness advice"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-xl text-pharmacy-gray max-w-3xl mx-auto">
            Comprehensive pharmaceutical care designed to meet all your health and wellness needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-pharmacy-gray mb-4 text-base leading-relaxed">
                  {service.description}
                </CardDescription>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};