import { Heart, Star, Quote, ArrowLeft, ArrowRight, Users, Award, CheckCircle, Pill, Shield, Stethoscope, MessageCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Long-term Patient",
      rating: 5,
      content: "My Meds Pharmacy has been my trusted healthcare partner for over 5 years. Their pharmacists are incredibly knowledgeable and always take the time to explain my medications. The delivery service is a lifesaver for my busy schedule!",
      avatar: "/images/testimonials/sarah.jpg",
      category: "Medication Management",
      highlight: "5+ Years Trusted Partner"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "New Patient",
      rating: 5,
      content: "As a new patient, I was impressed by the warm welcome and professional service. They helped me understand my new prescription and even found a more affordable alternative. Highly recommend!",
      avatar: "/images/testimonials/michael.jpg",
      category: "Cost Savings",
      highlight: "Affordable Alternatives Found"
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Senior Patient",
      rating: 5,
      content: "The staff at My Meds Pharmacy treats me like family. They're patient with my questions, help me organize my medications, and the 24/7 support gives me peace of mind.",
      avatar: "/images/testimonials/maria.jpg",
      category: "Senior Care",
      highlight: "24/7 Support Available"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Parent",
      rating: 5,
      content: "Finding a pharmacy that understands pediatric medications was crucial for us. My Meds Pharmacy has been amazing with our children's prescriptions and always provides helpful advice.",
      avatar: "/images/testimonials/david.jpg",
      category: "Pediatric Care",
      highlight: "Expert Pediatric Care"
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Chronic Care Patient",
      rating: 5,
      content: "Managing multiple medications can be overwhelming, but the medication therapy management program here has made it so much easier. They truly care about my health outcomes.",
      avatar: "/images/testimonials/lisa.jpg",
      category: "Chronic Care",
      highlight: "Medication Management Program"
    },
    {
      id: 6,
      name: "Robert Williams",
      role: "Local Resident",
      rating: 5,
      content: "Living in Brooklyn, having a reliable local pharmacy is essential. My Meds Pharmacy offers everything I need - from prescriptions to health consultations - all with exceptional service.",
      avatar: "/images/testimonials/robert.jpg",
      category: "Local Service",
      highlight: "Brooklyn's Trusted Pharmacy"
    }
  ];

  const stats = [
    { number: "98%", label: "Patient Satisfaction", icon: Heart, color: "from-pink-400 to-red-400" },
    { number: "4.9★", label: "Average Rating", icon: Star, color: "from-yellow-400 to-orange-400" },
    { number: "10K+", label: "Patients Served", icon: Users, color: "from-blue-400 to-cyan-400" },
    { number: "25+", label: "Years Experience", icon: Award, color: "from-purple-400 to-pink-400" }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
          <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Background Image Placeholder - Replace with actual pharmacy patient care image */}
                   <div
               className="absolute inset-0 opacity-60 pointer-events-none"
               style={{
                 backgroundImage: `url('/images/new/service.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             ></div>
             
             {/* Balanced Overlay for Text Readability */}
             <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Medical Icons */}
        <div className="absolute top-20 left-10 text-[#57BBB6]/15 animate-bounce" style={{ animationDelay: '0s' }}>
          <Pill className="w-8 h-8" />
        </div>
        <div className="absolute top-32 right-20 text-[#376F6B]/12 animate-bounce" style={{ animationDelay: '1s' }}>
          <Shield className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-[#57BBB6]/18 animate-bounce" style={{ animationDelay: '2s' }}>
          <Stethoscope className="w-7 h-7" />
        </div>
        <div className="absolute bottom-20 right-1/3 text-[#376F6B]/14 animate-bounce" style={{ animationDelay: '3s' }}>
          <MessageCircle className="w-8 h-8" />
        </div>
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#57BBB6]/25 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#376F6B]/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-[#57BBB6]/30 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        
        {/* Pulse Waves */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-64 h-64 border border-[#57BBB6]/10 rounded-full animate-ping"></div>
          <div className="w-64 h-64 border border-[#57BBB6]/10 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '1s' }}></div>
          <div className="w-64 h-64 border border-[#57BBB6]/10 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#57BBB6]/20 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-[#376F6B]/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 border border-[#57BBB6]/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
        
        {/* Original Blur Elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#57BBB6]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#376F6B]/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Floating Elements Around Header */}
          <div className="relative">
            <div className="absolute -top-8 left-1/4 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '0s' }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute -top-4 right-1/4 text-[#376F6B]/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-5 h-5" />
            </div>
            <div className="absolute top-0 left-1/3 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '1s' }}>
              <Star className="w-6 h-6" />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg hover:scale-105 transition-transform duration-300">
            <Heart className="h-4 w-4 animate-pulse" />
            Patient Stories
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] bg-clip-text text-transparent">
            What Our Patients Say
          </h2>
          
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold leading-relaxed mb-8">
            Don't just take our word for it - hear from our satisfied patients about their experience
          </p>
          
          {/* Enhanced Overall Rating */}
          <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-7 w-7 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#57BBB6]">4.9</div>
              <div className="text-[#376F6B] font-medium text-sm">out of 5</div>
            </div>
            <div className="text-[#376F6B] font-medium text-sm">
              Based on <span className="font-bold">2,847</span> reviews
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="group text-center p-4 sm:p-6 bg-gradient-to-br from-white to-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-[#57BBB6]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#57BBB6] to-[#376F6B] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#57BBB6] mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-[#376F6B] font-medium text-sm sm:text-base">
                {stat.label}
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#57BBB6]/5 to-[#376F6B]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Featured Testimonial */}
        <div className="mb-12 sm:mb-16">
          <Card className="bg-gradient-to-br from-[#57BBB6] via-[#57BBB6]/95 to-[#376F6B] text-white border-0 shadow-2xl relative overflow-hidden group">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-white/80 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <CardContent className="p-8 sm:p-12 relative z-10">
              <div className="text-center mb-8">
                <div className="relative mb-6">
                  <Quote className="h-16 w-16 text-white/30 mx-auto animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <p className="text-lg sm:text-xl text-white/95 leading-relaxed max-w-4xl mx-auto mb-6 italic">
                  "{testimonials[currentIndex].content}"
                </p>
                
                {/* Enhanced Rating Display */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                
                {/* Enhanced Patient Info */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl font-bold text-white group-hover:text-white transition-colors duration-300">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-white/80 font-medium text-lg">
                      {testimonials[currentIndex].role}
                    </p>
                    <div className="text-white/90 text-sm mt-1">
                      {testimonials[currentIndex].highlight}
                    </div>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mt-4 backdrop-blur-sm border border-white/30">
                  <CheckCircle className="h-4 w-4" />
                  {testimonials[currentIndex].category}
                </div>
              </div>
              
              {/* Enhanced Navigation Controls */}
              <div className="flex items-center justify-center gap-6">
                <Button
                  onClick={prevTestimonial}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#57BBB6] rounded-full w-14 h-14 p-0 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-110"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                
                <div className="flex gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={nextTestimonial}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#57BBB6] rounded-full w-14 h-14 p-0 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-110"
                >
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer ${
                index === currentIndex ? 'ring-4 ring-[#57BBB6]/50 scale-105' : ''
              } bg-gradient-to-br from-white to-white/95 hover:from-[#57BBB6] hover:to-[#57BBB6]/95`}
              onClick={() => goToTestimonial(index)}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
                <div className="absolute top-4 right-4 w-12 h-12 border border-[#57BBB6]/20 rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border border-[#57BBB6]/20 rounded-lg rotate-45 animate-pulse"></div>
              </div>
              
              {/* Floating Sparkles */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-[#57BBB6]/80 rounded-full animate-ping absolute top-1 left-1" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#57BBB6] to-[#376F6B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#376F6B] group-hover:text-white transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-[#376F6B]/80 group-hover:text-white/80 text-sm font-medium transition-colors duration-300">
                      {testimonial.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-[#376F6B]/90 group-hover:text-white/90 text-sm leading-relaxed mb-4 line-clamp-4 transition-colors duration-300">
                  "{testimonial.content}"
                </p>
                
                <div className="inline-flex items-center gap-2 bg-[#57BBB6]/20 group-hover:bg-white/20 text-[#376F6B] group-hover:text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-300">
                  <CheckCircle className="h-3 w-3" />
                  {testimonial.category}
                </div>
                
                {/* Highlight Badge */}
                <div className="mt-3 inline-flex items-center gap-1 bg-gradient-to-r from-[#57BBB6]/10 to-[#376F6B]/10 group-hover:from-white/10 group-hover:to-white/10 px-2 py-1 rounded-lg text-xs text-[#376F6B] group-hover:text-white transition-all duration-300">
                  <Sparkles className="h-3 w-3" />
                  {testimonial.highlight}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center relative">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-[#57BBB6]/5 to-[#376F6B]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-tl from-[#D5C6BC]/10 to-[#57BBB6]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-bold text-[#57BBB6] mb-4 relative z-10">
            Join Our Satisfied Patients
          </h3>
          <p className="text-lg text-[#376F6B] mb-8 max-w-2xl mx-auto relative z-10">
            Experience the difference that personalized care and professional expertise can make in your healthcare journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button 
              className="bg-gradient-to-r from-[#57BBB6] to-[#376F6B] text-white hover:from-[#376F6B] hover:to-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-5 h-5 mr-2 animate-pulse" />
              Get Started Today
            </Button>
            
            <Button 
              variant="outline"
              className="border-2 border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Users className="w-5 h-5 mr-2" />
              View All Reviews
            </Button>
          </div>
          
          {/* Decorative Dots */}
          <div className="flex justify-center space-x-2 mt-8 relative z-10">
            <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};