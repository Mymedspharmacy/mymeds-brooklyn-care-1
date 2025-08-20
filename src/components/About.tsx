import { Target, Globe, Award, Users, Clock, Star, Heart, Shield, Truck, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      icon: Users,
      number: "50+",
      label: "Patients Welcomed",
      color: "from-[#376F6B] to-[#57BBB6]"
    },
    {
      icon: Clock,
      number: "Best Service",
      label: "Fresh Start in Brooklyn",
      color: "from-[#57BBB6] to-[#376F6B]"
    },
    {
      icon: Star,
      number: "New",
      label: "Modern Pharmacy in Brooklyn",
      color: "from-[#57BBB6] to-[#376F6B]"
    },
    {
      icon: Heart,
      number: "100%",
      label: "Quality Commitment",
      color: "from-[#376F6B] to-[#57BBB6]"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Your health and safety are our top priorities. We maintain the highest standards of pharmaceutical care."
    },
    {
      icon: Users,
      title: "Patient-Centered Care",
      description: "Every patient is unique. We provide personalized care tailored to your individual health needs."
    },
    {
      icon: Truck,
      title: "Convenience",
              description: "We make healthcare accessible with same-day delivery, Dawn to Dusk support, and flexible pickup options."
    },
    {
      icon: MessageCircle,
      title: "Expert Guidance",
      description: "Our licensed pharmacists are always available to provide professional advice and answer your questions."
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-[#D5C6BC] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Award className="h-4 w-4" />
            About Us
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] leading-tight mb-6">
            Your Trusted 
            <span className="block text-[#57BBB6]">
              Healthcare Partner
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold">
            We're excited to begin serving the Brooklyn community with exceptional pharmaceutical care, 
            building lasting relationships through trust, expertise, and personalized attention to your health needs.
          </p>
        </div>

        {/* Key Stats */}
        <div className="mb-16 sm:mb-20">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group text-center p-4 sm:p-6 bg-[#57BBB6] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg sm:text-2xl text-white mb-1 sm:mb-2 group-hover:text-white transition-colors duration-300">
                  {stat.number}
                </h3>
                <p className="text-white/90 font-medium text-sm sm:text-base leading-relaxed">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Enhanced Cards - Perfectly Aligned */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#57BBB6] mb-4">
              Our Core Values
            </h3>
            <p className="text-lg text-[#376F6B] max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors duration-300">
                        {value.title}
                      </h4>
                      <p className="text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-[#57BBB6] text-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-white/95 text-lg leading-relaxed">
                To provide exceptional pharmaceutical care while building lasting relationships with
                our patients through trust, expertise, and personalized attention to their health needs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#57BBB6] text-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-white/95 text-lg leading-relaxed">
                To be the leading community pharmacy in Brooklyn, recognized for our commitment to
                patient care, innovation in pharmaceutical services, and dedication to community health.
              </p>
            </CardContent>
          </Card>
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
              Join thousands of satisfied patients who trust us with their health
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Started Today
              </Button>
              
              <Button 
                onClick={() => navigate('/services')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                View Our Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};