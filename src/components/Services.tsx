import { ArrowRight, Star, Heart, Truck, Shield, Users, Stethoscope, MessageCircle, Pill, Clock, Award, CheckCircle, Zap, Thermometer, Bandage, ShoppingCart, Gift, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { HowItWorks } from "@/components/HowItWorks";

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
    <section id="services" className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#D5C6BC]/30 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-[#57BBB6]/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 border border-[#376F6B]/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
        
        {/* Medical Cross Patterns */}
        <div className="absolute top-1/4 left-1/4 text-[#D5C6BC]/20 animate-pulse">
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-1 h-8 bg-current rounded-full"></div>
            <div className="w-8 h-1 bg-current rounded-full absolute"></div>
          </div>
        </div>
        
        {/* DNA Helix Pattern */}
        <div className="absolute top-1/3 right-1/4 text-[#57BBB6]/15 animate-spin" style={{ animationDuration: '12s' }}>
          <div className="flex flex-col space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></div>
            ))}
          </div>
        </div>
        
        {/* Molecular Structure */}
        <div className="absolute bottom-1/4 right-1/3 text-[#376F6B]/20 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="flex items-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-current rounded-full animate-ping" style={{ animationDelay: `${i * 0.5}s` }}></div>
            ))}
          </div>
        </div>
        
        {/* Pulse Waves */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 border border-[#57BBB6]/10 rounded-full animate-ping"></div>
          <div className="w-32 h-32 border border-[#57BBB6]/10 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '1s' }}></div>
          <div className="w-32 h-32 border border-[#57BBB6]/10 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Original Blur Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 sm:mb-20 relative">
          {/* Floating Medical Icons Around Header */}
          <div className="absolute -top-8 left-1/4 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '0s' }}>
            <Pill className="w-6 h-6" />
          </div>
          <div className="absolute -top-4 right-1/4 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Heart className="w-6 h-6" />
          </div>
          <div className="absolute top-0 left-1/3 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Shield className="w-6 h-6" />
          </div>
          
          {/* Additional Floating Elements */}
          <div className="absolute -top-6 right-1/3 text-[#376F6B]/15 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-[#D5C6BC]/20 animate-bounce" style={{ animationDelay: '2s' }}>
            <Users className="w-5 h-5" />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl">
            <Star className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
            Professional Care
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] leading-tight mb-6">
            Our 
            <span className="block text-[#57BBB6] bg-gradient-to-r from-[#57BBB6] to-[#376F6B] bg-clip-text text-transparent">
              Comprehensive Services
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold leading-relaxed">
            From prescription management to health consultations, we provide complete pharmaceutical care 
            tailored to your individual needs with the highest standards of professionalism and compassion.
          </p>
          
          {/* Decorative Underline */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] mx-auto mt-6 rounded-full animate-pulse"></div>
        </div>

        {/* Enhanced Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16 sm:mb-20">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95 cursor-pointer"
              onClick={() => navigate(`/services?service=${service.id}`)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <div className="absolute top-2 right-2 w-16 h-16 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-lg rotate-45 animate-pulse"></div>
              </div>
              
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
              
              {/* Enhanced Floating Elements */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white/80 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Corner Decoration */}
              <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300"></div>

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
        <div className="mb-16 sm:mb-20 relative">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-[#57BBB6]/5 to-[#376F6B]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-tl from-[#D5C6BC]/10 to-[#57BBB6]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="text-center mb-12 relative z-10">
            {/* Floating Offer Icons */}
            <div className="flex justify-center items-center space-x-6 mb-6">
              <div className="text-[#57BBB6]/40 animate-bounce" style={{ animationDelay: '0s' }}>
                <Gift className="w-8 h-8" />
              </div>
              <div className="text-[#57BBB6]/40 animate-bounce" style={{ animationDelay: '0.3s' }}>
                <Tag className="w-8 h-8" />
              </div>
              <div className="text-[#57BBB6]/40 animate-bounce" style={{ animationDelay: '0.6s' }}>
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
              <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Free Refills Offer */}
            <Card 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95 cursor-pointer"
              onClick={() => navigate('/special-offers')}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
                <div className="absolute top-4 right-4 w-12 h-12 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-lg rotate-45 animate-pulse"></div>
              </div>
              
              {/* Floating Sparkles */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-white/80 rounded-full animate-ping absolute top-1 left-1" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Pill className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <Badge className="bg-white text-[#57BBB6] border-0 group-hover:scale-105 transition-transform duration-300 animate-pulse">
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
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
                <div className="absolute top-4 left-4 w-10 h-10 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border border-white/20 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Floating Particles */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-400">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-white/60 rounded-full animate-ping absolute top-0.5 left-0.5" style={{ animationDelay: '0.7s' }}></div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                    <Truck className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <Badge className="bg-white text-[#57BBB6] border-0 group-hover:scale-105 transition-transform duration-300 animate-pulse" style={{ animationDelay: '0.5s' }}>
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

        {/* Interactive How It Works Section - Full Viewport Width */}
        <div className="relative w-screen left-1/2 -translate-x-1/2">
          <HowItWorks />
        </div>

        {/* Enhanced CTA Section - Completely Full Width */}
        <div className="relative w-screen left-1/2 -translate-x-1/2">
          <div className="bg-[#57BBB6] p-8 sm:p-12 text-center text-white relative overflow-hidden">
            {/* Professional Border Pattern */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            </div>
            
            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-white/30"></div>
            <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-white/30"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-white/30"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-white/30"></div>
            {/* Animated Pharmacy Background Elements */}
            <div className="absolute inset-0">
              {/* Floating Pills */}
              <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-20 left-20 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-16 left-32 w-5 h-5 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              
              {/* Floating Cross Symbol */}
              <div className="absolute top-8 right-20 w-6 h-6 text-white/30 animate-pulse">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1 h-6 bg-white/40 rounded-full"></div>
                  <div className="w-6 h-1 bg-white/40 rounded-full absolute"></div>
                </div>
              </div>
              
              {/* Floating Heartbeat */}
              <div className="absolute bottom-16 left-16 text-white/25 animate-pulse">
                <Heart className="w-8 h-8" />
              </div>
              
              {/* Floating Stethoscope */}
              <div className="absolute top-24 right-12 text-white/20 animate-bounce" style={{ animationDelay: '1.5s' }}>
                <Stethoscope className="w-6 h-6" />
              </div>
              
              {/* Floating Shield */}
              <div className="absolute bottom-20 right-16 text-white/30 animate-pulse" style={{ animationDelay: '2s' }}>
                <Shield className="w-7 h-7" />
              </div>
              
              {/* DNA Helix Animation */}
              <div className="absolute top-1/2 left-8 transform -translate-y-1/2 text-white/15 animate-spin" style={{ animationDuration: '8s' }}>
                <div className="flex flex-col space-y-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
              
              {/* Microscope Animation */}
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-white/20 animate-bounce" style={{ animationDelay: '2.5s' }}>
                <div className="w-8 h-8 border-2 border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>
            
            <div className="relative z-10">
              {/* Animated Pharmacy Icons Around Title */}
              <div className="flex justify-center items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-white/60 animate-bounce" style={{ animationDelay: '0s' }}>
                    <Pill className="w-8 h-8" />
                  </div>
                  <div className="text-white/60 animate-bounce" style={{ animationDelay: '0.3s' }}>
                    <Heart className="w-8 h-8" />
                  </div>
                  <div className="text-white/60 animate-bounce" style={{ animationDelay: '0.6s' }}>
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
            <div className="pt-6 border-t border-white/20 relative">
              {/* Animated Arrow Indicators */}
              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-white/40 animate-pulse">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </div>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-white/40 animate-pulse" style={{ animationDelay: '1s' }}>
                <ArrowRight className="w-4 h-4" />
              </div>
              
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
      </div>
    </section>
  );
};