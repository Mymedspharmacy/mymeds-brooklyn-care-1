import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { ArrowLeft, Star, Heart, Truck, Shield, Users, Stethoscope, MessageCircle, Pill, Clock, Award, CheckCircle, Zap, Thermometer, Bandage, ShoppingCart, Phone, Mail, MapPin, Calendar, DollarSign, Clock as ClockIcon, TrendingUp, Shield as ShieldIcon, Users as UsersIcon, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
      accent: "from-brand-light to-brand",
      bgGradient: "from-brand-light/10 to-brand/10",
      image: "/images/services/prescription-refill.jpg",
      price: "$$",
      duration: "Same day",
      availability: "24/7",
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
      accent: "from-brand-accent to-brand",
      bgGradient: "from-brand-accent/10 to-brand/10",
      image: "/images/services/delivery-service.jpg",
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
      longDescription: "Our medication management service provides personalized care to ensure your medications work safely and effectively together. We review all your medications, check for interactions, and optimize your treatment plan.",
      features: [
        "Personalized medication reviews",
        "Drug interaction checking",
        "Side effect monitoring and management",
        "Dosage optimization",
        "Medication reconciliation",
        "Chronic disease management support"
      ],
      benefits: [
        "Improved medication safety",
        "Better treatment outcomes",
        "Reduced side effects",
        "Cost savings through optimization"
      ],
      process: [
        "Schedule a comprehensive medication review",
        "Bring all your medications and supplements",
        "Our pharmacist reviews everything",
        "Receive personalized recommendations"
      ],
      accent: "from-brand to-brand-dark",
      bgGradient: "from-brand/10 to-brand-dark/10",
      image: "/images/services/medication-review.jpg",
      price: "Free consultation",
      duration: "30-60 minutes",
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
      longDescription: "Meet privately with our licensed pharmacists for personalized health advice, screenings, and chronic disease management. We provide comprehensive health consultations in our private consultation rooms.",
      features: [
        "Private consultation rooms",
        "Health screenings (blood pressure, glucose, cholesterol)",
        "Vaccination services",
        "Chronic disease management",
        "Smoking cessation support",
        "Weight management guidance"
      ],
      benefits: [
        "Personalized health advice",
        "Early detection of health issues",
        "Convenient health screenings",
        "Ongoing support for chronic conditions"
      ],
      process: [
        "Schedule your consultation",
        "Complete health questionnaire",
        "Meet with our pharmacist",
        "Receive personalized recommendations"
      ],
      accent: "from-brand-light to-brand-accent",
      bgGradient: "from-brand-light/10 to-brand-accent/10",
      image: "/images/services/health-consultation.jpg",
      price: "Free",
      duration: "30-45 minutes",
      availability: "By appointment",
      satisfactionRate: 97,
      patientsServed: 1500,
      avgResponseTime: "48 hours",
      actionType: "appointment",
      actionButton: "Book Consultation",
      actionIcon: Calendar
    },
    {
      id: 'immunizations',
      icon: Stethoscope,
      title: "Immunizations",
      description: "Comprehensive vaccination services for all ages and travel requirements",
      longDescription: "Stay protected with our comprehensive immunization services. We offer flu shots, COVID-19 vaccines, travel vaccinations, and pediatric immunizations. Our pharmacists are certified to administer vaccines.",
      features: [
        "Flu shots and COVID-19 vaccines",
        "Travel vaccinations",
        "Pediatric immunizations",
        "Vaccine records management",
        "Shingles and pneumonia vaccines",
        "Hepatitis A & B vaccines"
      ],
      benefits: [
        "Protection against preventable diseases",
        "Travel health protection",
        "Convenient vaccination scheduling",
        "Insurance billing assistance"
      ],
      process: [
        "Schedule your vaccination",
        "Complete health screening",
        "Receive your vaccine",
        "Get your vaccination record"
      ],
      accent: "from-brand-accent to-brand-light",
      bgGradient: "from-brand-accent/10 to-brand-light/10",
      image: "/images/services/immunizations.jpg",
      price: "Varies by vaccine",
      duration: "15-30 minutes",
      availability: "Walk-in & appointments",
      satisfactionRate: 95,
      patientsServed: 4000,
      avgResponseTime: "1 hour",
      actionType: "appointment",
      actionButton: "Book Vaccination",
      actionIcon: Calendar
    }
  ];

  const selectedServiceData = selectedService 
    ? services.find(s => s.id === selectedService) 
    : null;

  // Scroll to top when component mounts or service changes
  useScrollToTop([selectedService]);

  // Debug logging
  console.log('Selected service:', selectedService);
  console.log('Selected service data:', selectedServiceData);

  // Animate stats on component mount
  useEffect(() => {
    if (selectedServiceData) {
      const timer = setTimeout(() => {
        setAnimatedStats({
          cost: selectedServiceData.satisfactionRate,
          duration: selectedServiceData.patientsServed,
          availability: 100
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedServiceData]);

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
  }, [selectedServiceData]);

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
    window.open('mailto:info@mymedspharmacy.com');
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank');
  };

  const handleActionClick = (service) => {
    switch (service.actionType) {
      case 'refill':
        // Navigate to home page and trigger refill form
        navigate('/', { state: { openRefillForm: true } });
        break;
      case 'transfer':
        // Navigate to home page and trigger transfer form
        navigate('/', { state: { openTransferForm: true } });
        break;
      case 'appointment':
        // Navigate to home page and trigger appointment form
        navigate('/', { state: { openAppointmentForm: true } });
        break;
      case 'shop':
        // Navigate to shop page
        navigate('/shop');
        break;
      default:
        // Default to calling
        handleCallClick();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-light/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-brand-light/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-brand hover:text-brand-light transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-normal text-brand">SERVICES</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedServiceData ? (
          // Enhanced Detailed Service View
          <div className="max-w-6xl mx-auto">
            {/* Service Header with Enhanced Visuals */}
            <div className="text-center mb-16 relative">
              {/* Background Decoration */}
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedServiceData.bgGradient} rounded-3xl opacity-20 blur-3xl -z-10`}></div>
              
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-light to-brand text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <selectedServiceData.icon className="h-5 w-5" />
                {selectedServiceData.title}
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8 animate-fade-in">
                {selectedServiceData.title}
              </h2>
              
              <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed mb-12">
                {selectedServiceData.longDescription}
              </p>

              {/* Enhanced Service Stats with Animations */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand mb-2">{selectedServiceData.price}</div>
                  <div className="text-gray-600 font-medium">Cost</div>
                </Card>
                
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ClockIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand mb-2">{selectedServiceData.duration}</div>
                  <div className="text-gray-600 font-medium">Duration</div>
                </Card>
                
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand mb-2">{selectedServiceData.availability}</div>
                  <div className="text-gray-600 font-medium">Availability</div>
                </Card>

                <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand mb-2">{selectedServiceData.satisfactionRate}%</div>
                  <div className="text-gray-600 font-medium">Satisfaction</div>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <Card className="p-6 bg-gradient-to-br from-brand-light/10 to-brand/10 border-0 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{selectedServiceData.patientsServed.toLocaleString()}+</div>
                      <div className="text-gray-600">Patients Served</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-brand-accent/10 to-brand/10 border-0 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{selectedServiceData.avgResponseTime}</div>
                      <div className="text-gray-600">Avg Response Time</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-brand/10 to-brand-dark/10 border-0 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center">
                      <ShieldIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">100%</div>
                      <div className="text-gray-600">Safety Record</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Enhanced Service Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Features with Animation */}
              <Card className="features-section hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedServiceData.features.map((feature, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 transition-all duration-500 ${
                          showFeatures ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-brand-light to-brand rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0 shadow-lg">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits with Animation */}
              <Card className="benefits-section hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedServiceData.benefits.map((benefit, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 transition-all duration-500 ${
                          showBenefits ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-brand-accent to-brand rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0 shadow-lg">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium leading-relaxed">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Process with Interactive Steps */}
            <Card className="process-section mb-16 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                                      <div className="w-10 h-10 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {selectedServiceData.process.map((step, index) => (
                    <div 
                      key={index} 
                      className={`text-center group cursor-pointer transition-all duration-500 ${
                        showProcess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                          {index + 1}
                        </div>
                        {index < selectedServiceData.process.length - 1 && (
                          <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-brand-light to-transparent transform translate-x-4"></div>
                        )}
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                        <p className="text-gray-700 font-medium leading-relaxed mb-4">{step}</p>
                        
                        {/* Action button for each step */}
                        {index === 0 && (
                          <Button 
                            onClick={() => handleActionClick(selectedServiceData)}
                            className={`bg-gradient-to-r ${selectedServiceData.accent} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm px-4 py-2`}
                          >
                            <selectedServiceData.actionIcon className="w-4 h-4 mr-2" />
                            Get Started
                          </Button>
                        )}
                        {index === 1 && (
                          <Button 
                            onClick={handleCallClick}
                            variant="outline"
                            className="border-brand-light text-brand-light hover:bg-brand-light hover:text-white transition-all duration-300 transform hover:scale-105 text-sm px-4 py-2"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Us
                          </Button>
                        )}
                        {index === 2 && (
                          <Button 
                            onClick={handleEmailClick}
                            variant="outline"
                            className="border-brand-light text-brand-light hover:bg-brand-light hover:text-white transition-all duration-300 transform hover:scale-105 text-sm px-4 py-2"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Learn More
                          </Button>
                        )}
                        {index === 3 && (
                          <Button 
                            onClick={() => handleActionClick(selectedServiceData)}
                            className={`bg-gradient-to-r ${selectedServiceData.accent} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm px-4 py-2`}
                          >
                            <selectedServiceData.actionIcon className="w-4 h-4 mr-2" />
                            Complete Service
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced CTA with Interactive Elements */}
            <Card className="bg-gradient-to-r from-brand to-brand-light text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
              <CardContent className="p-12 text-center relative z-10">
                <h3 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h3>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Contact us today to schedule your {selectedServiceData.title.toLowerCase()} service and experience the difference professional care makes.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button 
                    onClick={() => handleActionClick(selectedServiceData)}
                    className="bg-white text-brand hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <selectedServiceData.actionIcon className="w-5 h-5 mr-3" />
                    {selectedServiceData.actionButton}
                  </Button>
                  <Button 
                    onClick={handleCallClick}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-brand font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    Call Now
                  </Button>
                  <Button 
                    onClick={handleEmailClick}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-brand font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Email Us
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="font-semibold mb-1">Response Time</div>
                      <div className="opacity-80">{selectedServiceData.avgResponseTime}</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Success Rate</div>
                      <div className="opacity-80">{selectedServiceData.satisfactionRate}%</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Experience</div>
                      <div className="opacity-80">10+ Years</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // All Services Overview (unchanged)
          <>
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-light to-brand text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Star className="h-4 w-4" />
                Professional Care
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Our 
                <span className="block bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
                  Comprehensive Services
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-semibold">
                From prescription management to health consultations, we provide complete pharmaceutical care 
                tailored to your individual needs with the highest standards of professionalism and compassion.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16">
              {services.map((service, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm hover:bg-white/95 cursor-pointer"
                  onClick={() => navigate(`/services?service=${service.id}`)}
                >
                  <CardContent className="relative p-6 sm:p-8">
                    {/* Enhanced Icon */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${service.accent} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3`}>
                      <service.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Service Title & Description */}
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-brand transition-colors duration-300 mb-4 text-center">
                      {service.title}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 mb-6 text-base leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-300 text-center">
                      {service.description}
                    </CardDescription>

                    {/* Service Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-sm font-bold text-brand">{service.price}</div>
                        <div className="text-xs text-gray-500">Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-brand">{service.duration}</div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-brand">{service.availability}</div>
                        <div className="text-xs text-gray-500">Available</div>
                      </div>
                    </div>

                    {/* Enhanced Features List */}
                    <div className="space-y-2">
                      {service.features.slice(0, 3).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start group/feature">
                          <div className={`w-2 h-2 bg-gradient-to-r ${service.accent} rounded-full mr-3 mt-2 flex-shrink-0 group-hover/feature:scale-125 transition-transform duration-300`}></div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-700 font-medium leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More Button */}
                    <div className="mt-6 text-center">
                      <Badge className="bg-gradient-to-r from-brand-light to-brand text-white hover:scale-105 transition-transform duration-300">
                        Learn More
                      </Badge>
                    </div>

                    {/* Healing Border Effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-brand to-brand-light rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Ready to Experience Better Care?
                </h3>
                <p className="text-lg sm:text-xl mb-8 opacity-90">
                  Contact us today to learn more about our services
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCallClick}
                    className="bg-white text-brand hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call (347) 312-6458
                  </Button>
                  
                  <Button 
                    onClick={handleEmailClick}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-brand font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Email Us
                  </Button>
                  
                  <Button 
                    onClick={handleMapClick}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-brand font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button for Quick Contact */}
      {selectedServiceData && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCallClick}
              className="w-14 h-14 bg-brand-light hover:bg-brand rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Call Now"
            >
              <Phone className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleEmailClick}
              className="w-14 h-14 bg-brand-accent hover:bg-brand rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Email Us"
            >
              <Mail className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleMapClick}
              className="w-14 h-14 bg-brand hover:bg-brand-dark rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Get Directions"
            >
              <MapPin className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
      }} />
    </div>
  );
} 