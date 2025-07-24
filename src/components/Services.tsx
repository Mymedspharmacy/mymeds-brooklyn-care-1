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
      <div className="container-fluid px-4">
        <div className="row justify-content-center text-center mb-5">
          <div className="col-12 col-lg-8">
            <h2 className="display-5 fw-bold text-foreground mb-3">Our Services</h2>
            <p className="lead text-muted-foreground">
              Comprehensive pharmaceutical care designed to meet all your health and wellness needs
            </p>
          </div>
        </div>

        <div className="row g-4 g-lg-5">
          {services.map((service, index) => (
            <div key={index} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100 border-0 shadow-lg hover-shadow-xl transition-all duration-300">
                <div className="card-header bg-transparent border-0 text-center pb-3">
                  <div className="d-inline-flex align-items-center justify-content-center bg-secondary rounded-circle mx-auto mb-3" 
                       style={{ width: '4rem', height: '4rem' }}>
                    <service.icon className="text-primary" size={28} />
                  </div>
                  <h5 className="card-title fw-bold text-foreground mb-0">{service.title}</h5>
                </div>
                
                <div className="card-body d-flex flex-column pt-0">
                  <p className="card-text text-muted-foreground mb-3 lh-base">
                    {service.description}
                  </p>
                  
                  <ul className="list-unstyled flex-grow-1 mb-4">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="d-flex align-items-start mb-2">
                        <span className="bg-primary rounded-circle me-3 mt-1 flex-shrink-0" 
                              style={{ width: '0.5rem', height: '0.5rem' }}></span>
                        <small className="text-muted-foreground">{feature}</small>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    {service.hasBooking && (
                      <button 
                        onClick={onAppointmentClick}
                        className="btn btn-primary w-100 fw-semibold"
                      >
                        Book Appointment
                      </button>
                    )}
                    {service.hasShop && (
                      <button 
                        onClick={onShopClick}
                        className="btn w-100 fw-semibold text-white"
                        style={{ backgroundColor: '#376f6b', borderColor: '#376f6b' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#57bbb6';
                          e.currentTarget.style.borderColor = '#57bbb6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#376f6b';
                          e.currentTarget.style.borderColor = '#376f6b';
                        }}
                      >
                        Shop Equipment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};