import { ArrowRight, Star, Heart, Truck, Shield, Users, Stethoscope, MessageCircle, Pill, Clock, Award, CheckCircle, Zap, Thermometer, Bandage, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ServicesProps {
  onRefillClick: () => void;
  onTransferClick: () => void;
  onAppointmentClick: () => void;
}

export const Services = ({ onRefillClick, onTransferClick, onAppointmentClick }: ServicesProps) => {
  const navigate = useNavigate();
  
  const services = [
    {
      id: 'prescription-refills',
      icon: Pill,
      title: "Prescription Refills",
      description: "Quick and convenient prescription refills with automatic reminders and notifications",
      features: [
        "Same-day refills for most medications",
        "Automatic refill reminders",
        "Multiple pickup options",
        "Insurance coordination"
      ],
      image: "/images/services/prescription-refill.jpg"
    },
    {
      id: 'same-day-delivery',
      icon: Truck,
      title: "Free Delivery",
      description: "Same-day local delivery service for prescriptions and health products",
      features: [
        "Same-day delivery within Brooklyn",
        "Free delivery on orders over $25",
        "Real-time tracking",
        "Secure prescription handling"
      ],
      image: "/images/services/delivery-service.jpg"
    },
    {
      id: 'medication-management',
      icon: Shield,
      title: "Medication Reviews",
      description: "Comprehensive medication therapy management and safety reviews",
      features: [
        "Personalized medication reviews",
        "Drug interaction checking",
        "Side effect monitoring",
        "Dosage optimization"
      ],
      image: "/images/services/medication-review.jpg"
    },
    {
      id: 'health-consultations',
      icon: Users,
      title: "Health Consultations",
      description: "One-on-one consultations with licensed pharmacists for health advice",
      features: [
        "Private consultation rooms",
        "Health screenings available",
        "Vaccination services",
        "Chronic disease management"
      ],
      image: "/images/services/health-consultation.jpg"
    },
    {
      id: 'immunizations',
      icon: Stethoscope,
      title: "Immunizations",
      description: "Comprehensive vaccination services for all ages and travel requirements",
      features: [
        "Flu shots and COVID-19 vaccines",
        "Travel vaccinations",
        "Pediatric immunizations",
        "Vaccine records management"
      ],
      image: "/images/services/immunizations.jpg"
    },
    {
      id: '24-7-support',
      icon: MessageCircle,
      title: "24/7 Support",
      description: "Round-the-clock pharmacy support and emergency medication assistance",
      features: [
        "24/7 pharmacist consultation",
        "Emergency medication access",
        "After-hours pickup",
        "Telepharmacy services"
      ],
      image: "/images/services/24-7-support.jpg"
    }
  ];

  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 bg-[#D5C6BC] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Star className="h-4 w-4" />
            Professional Care
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] leading-tight mb-6">
            Our 
            <span className="block text-[#57BBB6]">
              Comprehensive Services
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold">
            From prescription management to health consultations, we provide complete pharmaceutical care 
            tailored to your individual needs with the highest standards of professionalism and compassion.
          </p>
        </div>

        {/* Enhanced Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16 sm:mb-20">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95 cursor-pointer"
              onClick={() => navigate(`/services?service=${service.id}`)}
            >
              {/* Service Image Background */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>

              <CardContent className="relative p-6 sm:p-8">
                {/* Enhanced Icon */}
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3">
                  <service.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Service Title & Description */}
                <CardTitle className="text-2xl font-bold text-white group-hover:text-white transition-colors duration-300 mb-4 text-center">
                  {service.title}
                </CardTitle>
                
                <CardDescription className="text-white/90 mb-6 text-base leading-relaxed font-medium group-hover:text-white transition-colors duration-300 text-center">
                  {service.description}
                </CardDescription>

                {/* Enhanced Features List */}
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start group/feature">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 mt-2 flex-shrink-0 group-hover/feature:scale-125 transition-transform duration-300"></div>
                      <span className="text-sm text-white/90 group-hover:text-white font-medium leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Healing Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Offers Section */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#57BBB6] mb-4">
              Special Offers
            </h3>
            <p className="text-lg text-[#376F6B] max-w-2xl mx-auto">
              Take advantage of our exclusive offers designed to make your healthcare journey more affordable and convenient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Free Refills Offer */}
            <Card 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95 cursor-pointer"
              onClick={() => navigate('/special-offers')}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                    <Pill className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-white text-[#57BBB6] border-0">
                    Most Popular
                  </Badge>
                </div>
                
                <h4 className="text-2xl font-bold text-white mb-3">
                  Prescription Refills
                </h4>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Fast & Easy Refills, Right When You Need Them. Save up to $50 per refill with our exclusive program.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-white text-[#57BBB6] rounded-full" />
                    <span>All prescription medications included</span>
                  </div>
                  <div className="flex items-center text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-white text-[#57BBB6] rounded-full" />
                    <span>Automatic refill reminders</span>
                  </div>
                  <div className="flex items-center text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-white text-[#57BBB6] rounded-full" />
                    <span>Priority processing</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-white/70">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Ongoing</span>
                  </div>
                  <Button 
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/special-offers');
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Offer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Prescriptions Offer */}
            <Card 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95 cursor-pointer"
              onClick={() => navigate('/special-offers')}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-white text-[#57BBB6] border-0">
                    New Customers
                  </Badge>
                </div>
                
                <h4 className="text-2xl font-bold text-white mb-3">
                  Transfer Prescriptions
                </h4>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Transfer your prescriptions to us and enjoy exclusive benefits. We'll handle everything for you.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-white text-[#57BBB6] rounded-full" />
                    <span>Free transfer service</span>
                  </div>
                  <div className="flex items-center text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-white text-[#57BBB6] rounded-full" />
                    <span>Insurance coordination</span>
                  </div>
                  <div className="flex items-center text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-white text-[#57BBB6] rounded-full" />
                    <span>Welcome bonus</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-white/70">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Limited Time</span>
                  </div>
                  <Button 
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/special-offers');
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Offer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
              Ready to Experience Better Care?
            </h3>
            <p className="text-lg sm:text-xl mb-8 text-white/90">
              Join thousands of satisfied customers who trust us with their health
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={onRefillClick}
                className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Pill className="w-5 h-5 mr-2" />
                Refill Prescription
              </Button>
              
              <Button 
                onClick={onTransferClick}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Transfer Prescription
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/shop'}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Products
              </Button>
            </div>

            {/* View All Services Button */}
            <div className="pt-6 border-t border-white/20">
              <Button 
                onClick={() => navigate('/services')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                View All Services & Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};