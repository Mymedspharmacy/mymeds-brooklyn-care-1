import { Heart, Star, Quote, ArrowLeft, ArrowRight, Users, Award, CheckCircle } from "lucide-react";
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
      category: "Medication Management"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "New Patient",
      rating: 5,
      content: "As a new patient, I was impressed by the warm welcome and professional service. They helped me understand my new prescription and even found a more affordable alternative. Highly recommend!",
      avatar: "/images/testimonials/michael.jpg",
      category: "Cost Savings"
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Senior Patient",
      rating: 5,
      content: "The staff at My Meds Pharmacy treats me like family. They're patient with my questions, help me organize my medications, and the 24/7 support gives me peace of mind.",
      avatar: "/images/testimonials/maria.jpg",
      category: "Senior Care"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Parent",
      rating: 5,
      content: "Finding a pharmacy that understands pediatric medications was crucial for us. My Meds Pharmacy has been amazing with our children's prescriptions and always provides helpful advice.",
      avatar: "/images/testimonials/david.jpg",
      category: "Pediatric Care"
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Chronic Care Patient",
      rating: 5,
      content: "Managing multiple medications can be overwhelming, but the medication therapy management program here has made it so much easier. They truly care about my health outcomes.",
      avatar: "/images/testimonials/lisa.jpg",
      category: "Chronic Care"
    },
    {
      id: 6,
      name: "Robert Williams",
      role: "Local Resident",
      rating: 5,
      content: "Living in Brooklyn, having a reliable local pharmacy is essential. My Meds Pharmacy offers everything I need - from prescriptions to health consultations - all with exceptional service.",
      avatar: "/images/testimonials/robert.jpg",
      category: "Local Service"
    }
  ];

  const stats = [
    { number: "98%", label: "Patient Satisfaction", icon: Heart },
    { number: "4.9★", label: "Average Rating", icon: Star },
    { number: "10K+", label: "Patients Served", icon: Users },
    { number: "25+", label: "Years Experience", icon: Award }
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
    <section className="py-16 sm:py-20 md:py-24 bg-[#D5C6BC] relative overflow-hidden">
      {/* Healing Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Heart className="h-4 w-4" />
            Patient Stories
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[#57BBB6]">
            What Our Patients Say
          </h2>
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold leading-relaxed mb-8">
            Don't just take our word for it - hear from our satisfied patients about their experience
          </p>
          
          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-2xl font-bold text-[#57BBB6]">4.9</span>
            <span className="text-[#376F6B] font-medium">out of 5</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 sm:p-6 bg-[#57BBB6] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                {stat.number}
              </div>
              <div className="text-white/90 font-medium text-sm sm:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <div className="mb-12 sm:mb-16">
          <Card className="bg-[#57BBB6] text-white border-0 shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>
            
            <CardContent className="p-8 sm:p-12 relative z-10">
              <div className="text-center mb-8">
                <Quote className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-lg sm:text-xl text-white/95 leading-relaxed max-w-4xl mx-auto mb-6">
                  "{testimonials[currentIndex].content}"
                </p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-white/80 font-medium">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mt-4">
                  <CheckCircle className="h-4 w-4" />
                  {testimonials[currentIndex].category}
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={prevTestimonial}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#57BBB6] rounded-full w-12 h-12 p-0 transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={nextTestimonial}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#57BBB6] rounded-full w-12 h-12 p-0 transition-all duration-300"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer ${
                index === currentIndex ? 'ring-4 ring-white/30' : ''
              } bg-[#57BBB6] hover:bg-[#57BBB6]/95`}
              onClick={() => goToTestimonial(index)}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white group-hover:text-white transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-white/80 text-sm font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{testimonial.content}"
                </p>
                
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle className="h-3 w-3" />
                  {testimonial.category}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#57BBB6] mb-4">
            Join Our Satisfied Patients
          </h3>
          <p className="text-lg text-[#376F6B] mb-8 max-w-2xl mx-auto">
            Experience the difference that personalized care and professional expertise can make in your healthcare journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-[#57BBB6] text-white hover:bg-[#57BBB6]/90 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Get Started Today
            </Button>
            
            <Button 
              variant="outline"
              className="border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              View All Reviews
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};