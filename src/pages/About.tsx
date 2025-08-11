import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  const [animatedStats, setAnimatedStats] = useState({ experience: 0, patients: 0, satisfaction: 0, community: 0 });
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
        experience: 15,
        patients: 10000,
        satisfaction: 98,
        community: 25
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
      color: "bg-[#376F6B]"
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
      color: "bg-[#376F6B]"
    }
  ];

  const milestones = [
    {
      year: "2009",
      title: "Pharmacy Founded",
      description: "My Meds Pharmacy opens its doors in Brooklyn, NY, with a mission to provide personalized pharmaceutical care.",
      icon: Building2
    },
    {
      year: "2012",
      title: "Expanded Services",
      description: "Added immunization services and medication therapy management to better serve our community.",
      icon: Shield
    },
    {
      year: "2015",
      title: "Community Recognition",
      description: "Received Brooklyn Chamber of Commerce Excellence Award for outstanding community service.",
      icon: Award
    },
    {
      year: "2018",
      title: "Digital Innovation",
      description: "Launched online prescription refills and patient portal for enhanced convenience.",
      icon: Zap
    },
    {
      year: "2021",
      title: "Pandemic Response",
      description: "Provided essential services and COVID-19 vaccinations during the global health crisis.",
      icon: Heart
    },
    {
      year: "2024",
      title: "Future Forward",
      description: "Continuing to innovate and expand services to meet evolving healthcare needs.",
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
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={onRefillClick}
        onAppointmentClick={onAppointmentClick}
        onTransferClick={onTransferClick}
      />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="bg-[#57BBB6] text-white py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                About My Meds Pharmacy
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Your trusted healthcare partner in Brooklyn, delivering exceptional pharmaceutical care with compassion, expertise, and community focus.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.experience}+
                </div>
                <div className="text-[#57BBB6] font-semibold">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.patients.toLocaleString()}+
                </div>
                <div className="text-[#57BBB6] font-semibold">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.satisfaction}%
                </div>
                <div className="text-[#57BBB6] font-semibold">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#57BBB6] mb-2">
                  {animatedStats.community}
                </div>
                <div className="text-[#57BBB6] font-semibold">Community Awards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="py-16 sm:py-20 bg-[#D5C6BC]">
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
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
                Visit Our Location
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
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
  );
}


