import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { ArrowLeft, Star, Heart, Truck, Shield, Users, Stethoscope, MessageCircle, Pill, Clock, Award, CheckCircle, Zap, Thermometer, Bandage, ShoppingCart, Phone, Mail, MapPin, Calendar, DollarSign, Clock as ClockIcon, TrendingUp, Shield as ShieldIcon, Users as UsersIcon, Activity, Home, ChevronRight, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";

export default function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const [animatedStats, setAnimatedStats] = useState({ cost: 0, duration: 0, availability: 0 });
  const [showFeatures, setShowFeatures] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showProcess, setShowProcess] = useState(false);

  const services = [
    {
      id: 'prescription-refills',
      icon: Pill,
      title: "Prescription Refill",
      description: "Quick and convenient prescription refills with automatic reminders and notifications",
      longDescription: "Our prescription refill service is designed to make managing your medications as simple and stress-free as possible. We offer same-day refills for most medications, automatic refill reminders, and multiple pickup options to fit your busy lifestyle.",
      features: [
        "Same-day refills for most medications",
        "Automatic refill reminders via text, email, or phone",
        "Multiple pickup options including drive-thru",
        "Insurance coordination and prior authorization assistance",
        "Medication synchronization for multiple prescriptions",
        "90-day supply options for maintenance medications"
      ],
      benefits: [
        "Never run out of essential medications",
        "Save time with automatic refills",
        "Reduce medication costs with insurance optimization",
        "Convenient pickup options"
      ],
      process: [
        "Call, text, or use our online portal to request refills",
        "Our team processes your request and checks insurance",
        "We'll notify you when your prescription is ready",
        "Pick up at your convenience or request delivery"
      ],
      accent: "bg-[#376F6B]",
      bgGradient: "bg-[#376F6B]/10",
      image: "/images/services/prescription-refill.svg",
      price: "$$",
      duration: "Same day",
      availability: "Dawn to Dusk",
      satisfactionRate: 98,
      patientsServed: 5000,
      avgResponseTime: "2 hours",
      actionType: "refill",
      actionButton: "Refill Prescription",
      actionIcon: Pill
    },
    {
      id: 'same-day-delivery',
      icon: Truck,
      title: "Same-Day Delivery",
      description: "Same-day local delivery service for prescriptions and health products",
      longDescription: "Get your prescriptions and health products delivered to your doorstep on the same day. Our delivery service covers Brooklyn and surrounding areas with secure, temperature-controlled packaging and real-time tracking.",
      features: [
        "Same-day delivery within Brooklyn",
        "Free delivery on orders over $25",
        "Real-time tracking and delivery notifications",
        "Secure prescription handling and packaging",
        "Temperature-controlled delivery for sensitive medications",
        "Signature required for controlled substances"
      ],
      benefits: [
        "Convenience - no need to leave your home",
        "Time-saving for busy schedules",
        "Safe and secure delivery",
        "Free delivery on qualifying orders"
      ],
      process: [
        "Place your order online, by phone, or in-store",
        "Our team prepares and packages your order",
        "You receive tracking information",
        "Same-day delivery to your doorstep"
      ],
      accent: "bg-[#376F6B]",
      bgGradient: "bg-[#376F6B]/10",
      image: "/images/services/delivery-service.svg",
      price: "Free over $25",
      duration: "Same day",
      availability: "Mon-Sat 9AM-6PM",
      satisfactionRate: 96,
      patientsServed: 3000,
      avgResponseTime: "4 hours",
      actionType: "shop",
      actionButton: "Shop Products",
      actionIcon: ShoppingCart
    },
    {
      id: 'medication-management',
      icon: Shield,
      title: "Medication Management",
      description: "Comprehensive medication therapy management and safety reviews",
      longDescription: "Our medication management service provides personalized care to ensure your medications work together safely and effectively. We review your entire medication regimen, identify potential interactions, and optimize your treatment plan.",
      features: [
        "Comprehensive medication review and analysis",
        "Drug interaction checking and monitoring",
        "Side effect assessment and management",
        "Dosage optimization and adjustment",
        "Medication reconciliation services",
        "Ongoing monitoring and follow-up"
      ],
      benefits: [
        "Improved medication safety and effectiveness",
        "Reduced risk of drug interactions",
        "Better health outcomes",
        "Personalized treatment plans"
      ],
      process: [
        "Schedule a comprehensive medication review",
        "Our pharmacists analyze your current medications",
        "We identify potential issues and opportunities",
        "Receive personalized recommendations and follow-up plan"
      ],
      accent: "bg-[#376F6B]",
      bgGradient: "bg-[#376F6B]/10",
      image: "/images/services/medication-review.svg",
      price: "$$$",
      duration: "1-2 hours",
      availability: "By appointment",
      satisfactionRate: 99,
      patientsServed: 2000,
      avgResponseTime: "24 hours",
      actionType: "appointment",
      actionButton: "Book Consultation",
      actionIcon: Calendar
    },
    {
      id: 'health-consultations',
      icon: Users,
      title: "Health Consultations",
      description: "One-on-one consultations with licensed pharmacists for health advice",
      longDescription: "Get personalized health advice from our experienced pharmacists. We offer private consultations for medication questions, health screenings, and general wellness guidance in a comfortable, confidential setting.",
      features: [
        "Private consultation rooms for confidentiality",
        "Health screenings and assessments",
        "Medication counseling and education",
        "Wellness and prevention guidance",
        "Chronic disease management support",
        "Vaccination services and education"
      ],
      benefits: [
        "Expert health advice from licensed professionals",
        "Personalized care and attention",
        "Convenient access to healthcare guidance",
        "Comprehensive health assessments"
      ],
      process: [
        "Schedule your consultation appointment",
        "Complete health questionnaire and screening",
        "Meet with our pharmacist for personalized advice",
        "Receive follow-up recommendations and resources"
      ],
      accent: "bg-[#376F6B]",
      bgGradient: "bg-[#376F6B]/10",
      image: "/images/services/health-consultation.svg",
      price: "$$",
      duration: "30-60 min",
      availability: "Mon-Sat 10AM-6PM",
      satisfactionRate: 97,
      patientsServed: 1500,
      avgResponseTime: "Same day",
      actionType: "appointment",
      actionButton: "Book Consultation",
      actionIcon: Calendar
    },
    {
      id: 'immunizations',
      icon: Stethoscope,
      title: "Immunizations",
      description: "Comprehensive vaccination services for all ages and travel requirements",
      longDescription: "Stay protected with our comprehensive immunization services. We offer all recommended vaccines for children and adults, travel vaccinations, and flu shots. Our pharmacists are certified to administer vaccines safely and efficiently.",
      features: [
        "All recommended childhood and adult vaccines",
        "Travel vaccinations and consultation",
        "Flu shots and seasonal vaccinations",
        "Vaccine records management and tracking",
        "Insurance billing and coordination",
        "Walk-in availability for most vaccines"
      ],
      benefits: [
        "Convenient access to essential vaccines",
        "Expert guidance on vaccination schedules",
        "Travel health protection",
        "Comprehensive vaccine records"
      ],
      process: [
        "Check vaccine requirements and schedule",
        "Complete health screening questionnaire",
        "Receive vaccination from certified pharmacist",
        "Get updated vaccine record and follow-up care"
      ],
      accent: "bg-[#57BBB6]",
      bgGradient: "bg-[#57BBB6]/10",
      image: "/images/services/immunizations.svg",
      price: "$$",
      duration: "15-30 min",
      availability: "Walk-in or appointment",
      satisfactionRate: 95,
      patientsServed: 4000,
      avgResponseTime: "Immediate",
      actionType: "appointment",
      actionButton: "Schedule Vaccination",
      actionIcon: Calendar
    },
    {
      id: '24-7-support',
      icon: MessageCircle,
      title: "Support",
      description: "Round-the-clock pharmacy support and emergency medication assistance",
              longDescription: "We understand that health concerns don't always happen during business hours. Our Dawn to Dusk Pharmacy Support and Emergency Medication Assistance service ensures you have access to professional pharmaceutical advice and emergency medication assistance whenever you need it.",
      features: [
        "Pharmacist consultation hotline",
        "Emergency medication access and assistance",
        "After-hours prescription pickup",
        "Telepharmacy services for remote consultations",
        "Emergency medication delivery coordination",
        "Urgent care and hospital coordination"
      ],
      benefits: [
        "Peace of mind with round-the-clock support",
        "Emergency access to medications",
        "Professional guidance when you need it most",
        "Continuity of care outside business hours"
      ],
      process: [
        "Call our hotline for assistance",
        "Speak with a licensed pharmacist",
        "Receive immediate guidance or coordination",
        "Follow up during regular business hours if needed"
      ],
      accent: "bg-[#376F6B]",
      bgGradient: "bg-[#376F6B]/10",
      image: "/images/services/24-7-support.svg",
      price: "$$",
      duration: "Varies",
      availability: "Dawn to Dusk",
      satisfactionRate: 94,
      patientsServed: 2500,
      avgResponseTime: "Immediate",
      actionType: "call",
      actionButton: "Call Now",
      actionIcon: Phone
    },
    {
      id: 'vision-test-dmv',
      icon: Eye,
      title: "Vision Test for DMV",
      description: "Official DMV vision screening and certification for driver's license requirements",
      longDescription: "Get your DMV vision test completed quickly and professionally at our pharmacy. Our certified vision screening meets all New York State DMV requirements for driver's license applications and renewals. We provide accurate testing with immediate results and official documentation.",
      features: [
        "Official DMV-approved vision screening",
        "Immediate test results and certification",
        "Certified vision testing equipment",
        "Professional documentation for DMV submission",
        "Walk-in availability during business hours",
        "Affordable pricing with no hidden fees"
      ],
      benefits: [
        "Convenient location for DMV requirements",
        "Quick service with immediate results",
        "Professional and accurate testing",
        "Official documentation accepted by DMV"
      ],
      process: [
        "Walk in during business hours",
        "Complete vision screening test",
        "Receive immediate results and certification",
        "Submit documentation to DMV"
      ],
      accent: "bg-[#57BBB6]",
      bgGradient: "bg-[#57BBB6]/10",
      image: "/images/services/vision-test.svg",
      price: "$",
      duration: "15-20 min",
      availability: "Mon-Sat 9AM-6PM",
      satisfactionRate: 96,
      patientsServed: 800,
      avgResponseTime: "Immediate",
      actionType: "appointment",
      actionButton: "Schedule Test",
      actionIcon: Calendar
    },
    {
      id: 'notary-public',
      icon: FileText,
      title: "Notary Public",
      description: "Professional notary services for legal documents and certifications",
      longDescription: "Our certified notary public services provide professional document notarization for all your legal needs. We handle a wide variety of documents including affidavits, contracts, power of attorney forms, and more. Our notary services are available during regular business hours with convenient walk-in availability.",
      features: [
        "Certified notary public services",
        "Document notarization and certification",
        "Wide variety of legal documents accepted",
        "Professional and confidential service",
        "Walk-in availability during business hours",
        "Affordable notary fees"
      ],
      benefits: [
        "Convenient location for notary services",
        "Professional and reliable service",
        "Wide range of document types accepted",
        "Immediate service during business hours"
      ],
      process: [
        "Bring your documents and valid ID",
        "Complete notarization process",
        "Receive notarized documents",
        "Pay applicable notary fees"
      ],
      accent: "bg-[#376F6B]",
      bgGradient: "bg-[#376F6B]/10",
      image: "/images/services/notary.svg",
      price: "$",
      duration: "10-15 min",
      availability: "Mon-Sat 9AM-6PM",
      satisfactionRate: 98,
      patientsServed: 1200,
      avgResponseTime: "Immediate",
      actionType: "appointment",
      actionButton: "Book Notary",
      actionIcon: Calendar
    }
  ];

  // Scroll to top when component mounts
  useScrollToTop([]);

  // Animate stats on component mount
  useEffect(() => {
      const timer = setTimeout(() => {
        setAnimatedStats({
        cost: 85,
        duration: 24,
        availability: 99
        });
      }, 500);

      return () => clearTimeout(timer);
  }, []);

  // Animate sections on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('features-section')) {
              setShowFeatures(true);
            } else if (entry.target.classList.contains('benefits-section')) {
              setShowBenefits(true);
            } else if (entry.target.classList.contains('process-section')) {
              setShowProcess(true);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('.features-section, .benefits-section, .process-section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const selectedServiceData = services.find(service => service.id === selectedService);

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

  const handleEmailClick = () => {
    window.open('mailto:mymedspharmacy@outlook.com');
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank');
  };

  const handleActionClick = (service) => {
    switch (service.actionType) {
      case 'refill':
        navigate('/', { state: { openRefillForm: true } });
        break;
      case 'appointment':
        navigate('/', { state: { openAppointmentForm: true } });
        break;
      case 'shop':
        navigate('/shop');
        break;
      case 'call':
        handleCallClick();
        break;
      default:
        navigate('/contact');
    }
  };

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
        onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
      />
      
      <div className="pt-20">
        {!selectedService ? (
          <>
            {/* Hero Section */}
            <section className="py-16 sm:py-20 md:py-24 bg-[#F1EEE9] text-[#376F6B] relative overflow-hidden">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-white text-[#376F6B] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                    <Star className="h-5 w-5" />
                    Our Services
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                    Comprehensive 
                    <span className="block text-[#376F6B]">
                      Pharmaceutical Care
                    </span>
                  </h1>
                  
                  <p className="text-xl sm:text-2xl text-[#376F6B] max-w-4xl mx-auto font-medium leading-relaxed">
                    From prescription management to health consultations, we provide complete pharmaceutical care 
                    tailored to your individual needs with the highest standards of professionalism and compassion.
                  </p>
                </div>

                {/* Services Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {services.map((service, index) => (
                    <Card 
                      key={index} 
                      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white hover:bg-white/95 cursor-pointer h-full flex flex-col"
                      onClick={() => navigate(`/services?service=${service.id}`)}
                    >
                      <CardContent className="relative p-6 sm:p-8 flex flex-col h-full">
                        {/* Service Icon */}
                        <div className="w-20 h-20 bg-[#376F6B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3">
                          <service.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        {/* Service Title & Description */}
                        <CardTitle className="text-2xl font-bold text-[#376F6B] group-hover:text-[#376F6B] transition-colors duration-300 mb-4 text-center">
                          {service.title}
                        </CardTitle>
                        
                        <CardDescription className="text-[#376F6B] mb-6 text-base leading-relaxed font-medium group-hover:text-[#376F6B] transition-colors duration-300 text-center flex-grow">
                          {service.description}
                        </CardDescription>

                        {/* Service Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#376F6B]">{service.price}</div>
                            <div className="text-xs text-gray-600">Cost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#376F6B]">{service.duration}</div>
                            <div className="text-xs text-gray-600">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#376F6B]">{service.availability}</div>
                            <div className="text-xs text-gray-600">Availability</div>
                          </div>
                        </div>

                        {/* Action Button - Pushed to bottom */}
                        <div className="mt-auto">
                          <Button 
                            className="w-full bg-[#376F6B] hover:bg-[#2A5A56] text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(service);
                            }}
                          >
                            <service.actionIcon className="w-4 h-4 mr-2" />
                            {service.actionButton}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 sm:py-20 bg-[#F1EEE9]">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
                    Why Choose Our Services?
                  </h2>
                  <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                    Our commitment to excellence is reflected in our performance metrics and patient satisfaction.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-[#376F6B] mb-2">
                      {animatedStats.cost}%
                    </div>
                    <div className="text-[#376F6B] font-semibold">Cost Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-[#376F6B] mb-2">
                      {animatedStats.duration}hr
                    </div>
                    <div className="text-[#376F6B] font-semibold">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-[#376F6B] mb-2">
                      {animatedStats.availability}%
                    </div>
                    <div className="text-[#376F6B] font-semibold">Availability</div>
                  </div>
                </div>
                      </div>
            </section>
          </>
        ) : (
          <>
            {/* Service Detail Header */}
            <section className="py-16 sm:py-20 md:py-24 bg-[#F1EEE9] text-[#376F6B] relative overflow-hidden">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-8">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/services')}
                    className="border-white text-white hover:bg-white hover:text-[#376F6B] mb-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                  </Button>
                  
                  <div className="text-center">
                                      <div className={`inline-flex items-center gap-2 ${selectedServiceData.accent} text-[#376F6B] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg`}>
                    <selectedServiceData.icon className="h-5 w-5" />
                    {selectedServiceData.title}
                  </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                      {selectedServiceData.title}
                    </h1>
                    
                    <p className="text-xl sm:text-2xl text-[#376F6B] max-w-4xl mx-auto font-medium leading-relaxed">
                      {selectedServiceData.longDescription}
                    </p>
                  </div>
                </div>

                {/* Service Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2 text-[#376F6B]">{selectedServiceData.satisfactionRate}%</div>
                    <div className="text-[#376F6B] text-sm">Satisfaction Rate</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2 text-[#376F6B]">{selectedServiceData.patientsServed.toLocaleString()}+</div>
                    <div className="text-[#376F6B] text-sm">Patients Served</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2 text-[#376F6B]">{selectedServiceData.avgResponseTime}</div>
                    <div className="text-[#376F6B] text-sm">Avg Response</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2 text-[#376F6B]">{selectedServiceData.price}</div>
                    <div className="text-[#376F6B] text-sm">Cost</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Details */}
            <section className="py-16 sm:py-20 bg-[#F1EEE9]">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Features */}
                  <div className="features-section">
                    <h2 className="text-3xl font-bold text-[#376F6B] mb-8">Key Features</h2>
                    <div className="space-y-4">
                      {selectedServiceData.features.map((feature, index) => (
                        <div key={index} className="flex items-start group">
                          <div className="w-2 h-2 bg-[#376F6B] rounded-full mr-4 mt-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                          <span className="text-[#376F6B] leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                    </div>

                  {/* Benefits */}
                  <div className="benefits-section">
                    <h2 className="text-3xl font-bold text-[#376F6B] mb-8">Benefits</h2>
                    <div className="space-y-4">
                      {selectedServiceData.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start group">
                          <div className={`w-2 h-2 ${selectedServiceData.accent} rounded-full mr-4 mt-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-300`}></div>
                          <span className="text-[#57BBB6] leading-relaxed">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                    </div>

                {/* Interactive How It Works Section */}
                <div className="mt-16">
                  <HowItWorks showTitle={false} />
                </div>

            {/* CTA Section */}
                <div className="bg-[#376F6B] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden mt-16">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                      Ready to Get Started?
                </h3>
                    <p className="text-lg sm:text-xl mb-8 text-white/90">
                  Contact us today to learn more about our services
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCallClick}
                        className="bg-white text-[#376F6B] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call (347) 312-6458
                  </Button>
                  
                  <Button 
                    onClick={handleEmailClick}
                    variant="outline"
                        className="border-white text-white hover:bg-white hover:text-[#376F6B] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Email Us
                  </Button>
                  
                  <Button 
                    onClick={handleMapClick}
                    variant="outline"
                        className="border-white text-white hover:bg-white hover:text-[#376F6B] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Floating Action Button for Quick Contact */}
      {selectedServiceData && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCallClick}
              className="w-14 h-14 bg-[#376F6B] hover:bg-[#2A5A56] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Call Now"
            >
              <Phone className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleEmailClick}
              className="w-14 h-14 bg-[#376F6B] hover:bg-[#57BBB6] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Email Us"
            >
              <Mail className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleMapClick}
              className="w-14 h-14 bg-[#376F6B] hover:bg-[#2A5A56] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Get Directions"
            >
              <MapPin className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 