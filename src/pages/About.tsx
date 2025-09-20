import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { SEOHead } from "@/components/SEOHead";
import { RefillForm } from "@/components/RefillForm";
import { AppointmentForm } from "@/components/AppointmentForm";
import { TransferForm } from "@/components/TransferForm";
import { Map } from "@/components/Map";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Shield, Users, Stethoscope, Heart, Award, Clock, Star, CheckCircle, ArrowRight, Globe, Building2, Zap, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormHandlers } from "@/hooks/useFormHandlers";
import logo from "@/assets/logo.png";
import { getPhoneNumber, getEmail, getTelLink, getMailtoLink } from "@/lib/contact";

export default function About() {
  const navigate = useNavigate();
  const {
    showRefillForm,
    showAppointmentForm,
    showTransferForm,
    onRefillClick,
    onAppointmentClick,
    onTransferClick,
    closeRefillForm,
    closeAppointmentForm,
    closeTransferForm
  } = useFormHandlers();
  const [animatedStats, setAnimatedStats] = useState({ staff: 0, patients: 0, satisfaction: 0, community: 0 });
  const [showValues, setShowValues] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animate stats on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        staff: 8,
        patients: 25,
        satisfaction: 100,
        community: 1
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
            if (entry.target.classList.contains('values-section')) {
              setShowValues(true);
            } else if (entry.target.classList.contains('history-section')) {
              setShowHistory(true);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('.values-section, .history-section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const phoneNumber = getPhoneNumber();

  const handleCallClick = () => {
    const telLink = getTelLink(phoneNumber);
    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
      window.location.href = telLink;
    } else {
      if (confirm(`Call ${phoneNumber}?`)) {
        window.open(telLink);
      }
    }
  };

  const handleEmailClick = () => {
    window.open(getMailtoLink(getEmail()));
  };

  const handleMapClick = () => {
    window.open(import.meta.env.VITE_GOOGLE_MAPS_URL || 'https://maps.google.com', '_blank');
  };

  const coreValues = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Every decision we make is guided by what's best for our patients. We treat each person as an individual with unique needs and circumstances.",
      color: "bg-[#57BBB6]"
    },
    {
      icon: Shield,
      title: "Safety & Quality",
      description: "We maintain the highest standards of pharmaceutical care, ensuring every medication and service meets rigorous safety and quality requirements.",
      color: "bg-[#57BBB6]"
    },
    {
      icon: Globe,
      title: "Community Focus",
      description: "We're proud to serve the Brooklyn community and are committed to improving the health and well-being of our neighbors.",
      color: "bg-[#57BBB6]"
    },
    {
      icon: Star,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from customer service to pharmaceutical expertise and community involvement.",
      color: "bg-[#57BBB6]"
    }
  ];

  const milestones = [
    {
      year: "2025",
      title: "New Beginnings",
      description: "My Meds Pharmacy opens its doors in Brooklyn, NY, ready to serve our community.",
      icon: Building2
    },
    {
      year: "2025",
      title: "Fresh Start",
      description: "Starting our journey with a commitment to quality care and community service.",
      icon: Heart
    },
    {
      year: "2025",
      title: "Building Trust",
      description: "Establishing relationships with our neighbors and building trust in our community.",
      icon: Shield
    },
    {
      year: "2025",
      title: "Modern Approach",
      description: "Offering contemporary pharmacy services with a focus on convenience and care.",
      icon: Zap
    },
    {
      year: "2025",
      title: "Community Focus",
      description: "Dedicated to becoming a trusted healthcare partner in Brooklyn.",
      icon: Users
    },
    {
      year: "2025",
      title: "Growing Together",
      description: "Looking forward to growing with our community and serving more families.",
      icon: Target
    }
  ];

  const certifications = [
    "New York State Board of Pharmacy Licensed",
    "DEA Licensed for Controlled Substances",
    "Immunization Certified Pharmacists",
    "Medicare & Medicaid Certified",
    "HIPAA Compliant",
    "Board Certified in Medication Therapy Management"
  ];

  return (
    <>
      <SEOHead 
        title="About Us - My Meds Pharmacy | Brooklyn's Trusted Healthcare Partner"
        description="Learn about My Meds Pharmacy's 15+ years serving Brooklyn. Discover our patient-centered care, community values, and commitment to excellence in pharmaceutical services."
        keywords="Brooklyn pharmacy, about us, pharmacy history, patient care, community pharmacy, pharmaceutical services, Brooklyn healthcare, trusted pharmacy"
      />
      <div className="min-h-screen bg-[#E8F4F3]">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
      
      <div className="pt-20">
        {/* Hero Section */}
                  <div className="text-white py-16 sm:py-20 md:py-24 relative overflow-hidden">
          {/* Background Image Placeholder - Replace with actual pharmacy team/building image */}
                       <div
               className="absolute inset-0 opacity-100 pointer-events-none"
               style={{
                 backgroundImage: `url('/images/new/aboutus.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             ></div>
             
             {/* Minimal Overlay for Text Readability */}
             <div className="absolute inset-0 bg-black/20 pointer-events-none z-10"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating Medical Icons */}
            <div className="absolute top-20 left-10 text-white/15 animate-bounce" style={{ animationDelay: '0s' }}>
              <Heart className="w-8 h-8" />
            </div>
            <div className="absolute top-32 right-20 text-white/12 animate-bounce" style={{ animationDelay: '1s' }}>
              <Shield className="w-6 h-6" />
            </div>
            <div className="absolute bottom-32 left-1/4 text-white/18 animate-bounce" style={{ animationDelay: '2s' }}>
              <Star className="w-7 h-7" />
            </div>
            <div className="absolute bottom-20 right-1/3 text-white/14 animate-bounce" style={{ animationDelay: '3s' }}>
              <Building2 className="w-8 h-8" />
            </div>
            
            {/* Animated Particles */}
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            
            {/* Pulse Waves */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-48 h-48 border border-white/15 rounded-full animate-ping"></div>
              <div className="w-48 h-48 border border-white/15 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '1s' }}></div>
              <div className="w-48 h-48 border border-white/15 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-[#E8F4F3]">
                About My Meds Pharmacy
              </h1>
              <p className="text-xl sm:text-2xl text-[#E8F4F3] leading-relaxed max-w-3xl mx-auto">
                Your trusted healthcare partner in Brooklyn, delivering exceptional pharmaceutical care with compassion, expertise, and community focus.
              </p>
              
              {/* Decorative Underline */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-8 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.staff}
                </div>
                <div className="text-[#57BBB6] font-semibold">Professional Staff</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.patients.toLocaleString()}+
                </div>
                <div className="text-[#57BBB6] font-semibold">New Patients</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.satisfaction}%
                </div>
                <div className="text-[#57BBB6] font-semibold">Quality Promise</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.community}
                </div>
                <div className="text-[#57BBB6] font-semibold">Community First</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="py-16 sm:py-20 bg-[#E8F4F3]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Our Core Values
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                The principles that guide everything we do and shape the way we serve our community.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((value, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#376F6B] mb-3">{value.title}</h3>
                    <p className="text-[#57BBB6] leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive How It Works Section */}
        <HowItWorks />

        {/* CTA Section */}
        <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden mx-4 sm:mx-6 lg:mx-8 mb-16">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Experience Better Care?
            </h3>
            <p className="text-lg sm:text-xl mb-8 text-white/90">
              Visit us today or contact us to learn more about our services
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCallClick}
                className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call (347) 312-6458
              </Button>
              
              <Button 
                onClick={handleEmailClick}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </Button>
              
              <Button 
                onClick={handleMapClick}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Get Directions
              </Button>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <section className="py-16 sm:py-20 bg-[#F1EEE9] relative overflow-hidden">
          {/* Background Images for Map Section */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `url('/images/new/contactus.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url('/images/new/service.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
          </div>
          
          {/* Enhanced Overlay for Text Readability */}
          <div className="absolute inset-0 bg-white/80 z-10"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center lg:text-left mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
                Visit Our Location
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl lg:max-w-2xl lg:mx-0 mx-auto">
                Come visit us at our convenient Brooklyn location for personalized care and expert consultation.
              </p>
            </div>
            <Map />
          </div>
        </section>
      </div>

      <Footer />
      
      {/* Forms */}
      <RefillForm isOpen={showRefillForm} onClose={closeRefillForm} />
      <AppointmentForm isOpen={showAppointmentForm} onClose={closeAppointmentForm} />
      <TransferForm isOpen={showTransferForm} onClose={closeTransferForm} />
        </div>
      </>
    );
}


