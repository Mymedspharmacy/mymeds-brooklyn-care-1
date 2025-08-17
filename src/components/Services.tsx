import { ArrowRight, Star, Heart, Truck, Shield, Users, Stethoscope, MessageCircle, Pill, Clock, Award, CheckCircle, Zap, Thermometer, Bandage, ShoppingCart, Gift, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { HowItWorks } from "@/components/HowItWorks";
import { SEOHead } from "@/components/SEOHead";

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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    },
    {
      id: '24-7-support',
      icon: MessageCircle,
      title: "Support Services",
      description: "Round-the-clock pharmacy support and emergency medication assistance",
      features: [
        "pharmacist consultation",
        "Emergency medication access",
        "After-hours pickup",
        "Telepharmacy services"
      ]
    }
  ];

  return (
    <>
      <SEOHead 
        title="Pharmacy Services - My Meds Pharmacy | Comprehensive Healthcare Solutions"
        description="Discover our complete range of pharmacy services including prescription refills, medication management, immunizations, health consultations, and free delivery in Brooklyn."
        keywords="pharmacy services, prescription refills, medication management, immunizations, health consultations, free delivery, Brooklyn pharmacy services, pharmaceutical care"
      />
      <section id="services" className="py-16 sm:py-20 md:py-24 relative bg-[#F1EEE9]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16 sm:mb-20 relative">
            <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Star className="h-4 w-4" />
              Professional Care
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] leading-tight mb-6">
              Our 
              <span className="block text-[#376F6B]">
                Comprehensive Services
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold leading-relaxed">
              From prescription management to health consultations, we provide complete pharmaceutical care 
              tailored to your individual needs with the highest standards of professionalism and compassion.
            </p>
            
            {/* Decorative Underline */}
            <div className="w-24 h-1 bg-[#57BBB6] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Enhanced Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16 sm:mb-20">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 shadow-lg cursor-pointer"
                onClick={() => navigate(`/services?service=${service.id}`)}
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <CardContent className="relative p-6 sm:p-8 bg-[#E8F4F3] hover:bg-[#D1E9E6] transition-colors duration-200">
                  {/* Enhanced Icon */}
                  <div className="w-20 h-20 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <service.icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Service Title & Description */}
                  <CardTitle className="text-2xl font-bold text-[#376F6B] mb-4 text-center">
                    {service.title}
                  </CardTitle>
                  
                  <CardDescription className="text-[#376F6B] mb-6 text-base leading-relaxed font-medium text-center">
                    {service.description}
                  </CardDescription>

                  {/* Enhanced Features List */}
                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-[#57BBB6] rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-[#376F6B] font-medium leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services Showcase Section */}
          <div className="mb-16 sm:mb-20 relative">
            <div className="text-center mb-12 relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#57BBB6] mb-4">
                Our Service Environment
              </h3>
              <p className="text-lg text-[#376F6B] max-w-2xl mx-auto font-medium">
                Experience our modern pharmacy facilities and professional service areas
              </p>
            </div>
            
            {/* Service Environment Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
              <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src="/images/new/servicess.jpg" 
                  alt="Pharmacy Services Environment"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-lg font-bold">Professional Service Area</h4>
                  <p className="text-sm opacity-90">Modern consultation rooms</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src="/images/new/services.jpg" 
                  alt="Pharmacy Support Services"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-lg font-bold">Support Services</h4>
                  <p className="text-sm opacity-90">Assistance available</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src="/images/new/servicespage.jpg" 
                  alt="Pharmacy Operations"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-lg font-bold">Operations Center</h4>
                  <p className="text-sm opacity-90">Efficient prescription processing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Offers Section */}
          <div className="mb-16 sm:mb-20 relative">
            <div className="text-center mb-12 relative z-10">
              <div className="flex justify-center items-center space-x-6 mb-6">
                <div className="text-[#57BBB6]/40">
                  <Gift className="w-8 h-8" />
                </div>
                <div className="text-[#57BBB6]/40">
                  <Tag className="w-8 h-8" />
                </div>
                <div className="text-[#57BBB6]/40">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#57BBB6] mb-4">
                Special Offers
              </h3>
              <p className="text-lg text-[#376F6B] max-w-2xl mx-auto font-medium">
                Take advantage of our exclusive offers designed to make your healthcare journey more affordable and convenient
              </p>
              
              {/* Decorative Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Free Refills Offer */}
              <Card 
                className="group relative overflow-hidden border-0 shadow-lg cursor-pointer"
                onClick={() => navigate('/special-offers')}
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <CardContent className="p-8 bg-[#E8F4F3] hover:bg-[#D1E9E6] transition-colors duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center shadow-lg">
                      <Pill className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-white text-[#57BBB6] border-0">
                      Most Popular
                    </Badge>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-[#376F6B] mb-3">
                    Prescription Refills
                  </h4>
                  <p className="text-[#376F6B] mb-6 leading-relaxed">
                    Fast & Easy Refills, Right When You Need Them. Save up to $50 per refill with our exclusive program.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-[#376F6B]">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-[#57BBB6] text-white rounded-full" />
                      <span>All prescription medications included</span>
                    </div>
                    <div className="flex items-center text-sm text-[#376F6B]">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-[#57BBB6] text-white rounded-full" />
                      <span>Automatic refill reminders</span>
                    </div>
                    <div className="flex items-center text-sm text-[#376F6B]">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-[#57BBB6] text-white rounded-full" />
                      <span>Priority processing</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-[#376F6B]/70">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Ongoing</span>
                    </div>
                    <Button 
                      className="bg-[#57BBB6] text-white hover:bg-[#376F6B] hover:shadow-lg"
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
                className="group relative overflow-hidden border-0 shadow-lg cursor-pointer"
                onClick={() => navigate('/special-offers')}
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <CardContent className="p-8 bg-[#E8F4F3] hover:bg-[#D1E9E6] transition-colors duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center shadow-lg">
                      <Truck className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-white text-[#57BBB6] border-0">
                      New Customers
                    </Badge>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-[#376F6B] mb-3">
                    Transfer Prescriptions
                  </h4>
                  <p className="text-[#376F6B] mb-6 leading-relaxed">
                    Transfer your prescriptions to us and enjoy exclusive benefits. We'll handle everything for you.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-[#376F6B]">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-[#57BBB6] text-white rounded-full" />
                      <span>Free transfer service</span>
                    </div>
                    <div className="flex items-center text-sm text-[#376F6B]">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-[#57BBB6] text-white rounded-full" />
                      <span>Insurance coordination</span>
                    </div>
                    <div className="flex items-center text-sm text-[#376F6B]">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 bg-[#57BBB6] text-white rounded-full" />
                      <span>Welcome bonus</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-[#376F6B]/70">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Limited Time</span>
                    </div>
                    <Button 
                      className="bg-[#57BBB6] text-white hover:bg-[#376F6B] hover:shadow-lg"
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

          {/* Interactive How It Works Section - Full Viewport Width */}
          <div className="relative w-screen left-1/2 -translate-x-1/2">
            <HowItWorks />
          </div>

          {/* Enhanced CTA Section - Card Format */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#57BBB6] p-8 sm:p-12 text-center text-white relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/20">
              {/* Card Border Pattern */}
              <div className="absolute inset-0 rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-b-2xl"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-l-2xl"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-r-2xl"></div>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-white/30 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-white/30 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-white/30 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-white/30 rounded-br-lg"></div>
              
              <div className="relative z-10">
                {/* Pharmacy Icons Around Title */}
                <div className="flex justify-center items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-white/60">
                      <Pill className="w-8 h-8" />
                    </div>
                    <div className="text-white/60">
                      <Heart className="w-8 h-8" />
                    </div>
                    <div className="text-white/60">
                      <Shield className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Ready to Experience Better Care?
                </h3>
                <p className="text-lg sm:text-xl mb-8 text-white/90">
                  Join thousands of satisfied customers who trust us with their health
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button 
                    onClick={onRefillClick}
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg shadow-lg"
                  >
                    <Pill className="w-5 h-5 mr-2" />
                    Refill Prescription
                  </Button>
                  
                  <Button 
                    onClick={onTransferClick}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Transfer Prescription
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/shop'}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Shop Products
                  </Button>
                </div>

                {/* View All Services Button */}
                <div className="pt-6 border-t border-white/20 relative">
                  <Button 
                    onClick={() => navigate('/services')}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    View All Services & Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};