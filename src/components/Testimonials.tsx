import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Maria Rodriguez",
      rating: 5,
      text: "The staff at My Meds Pharmacy is incredibly helpful and knowledgeable. They always take the time to explain my medications and answer all my questions. The free delivery service is a lifesaver!",
      location: "Brooklyn, NY"
    },
    {
      name: "James Thompson",
      rating: 5,
      text: "I've been coming here for over 3 years and the service is consistently excellent. They remember my name, know my medications, and truly care about my health. Highly recommended!",
      location: "Brooklyn, NY"
    },
    {
      name: "Sarah Chen",
      rating: 5,
      text: "My Meds Pharmacy goes above and beyond. When I had questions about drug interactions, the pharmacist spent 20 minutes with me explaining everything. This is real personalized care.",
      location: "Brooklyn, NY"
    }
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">What Our Patients Say</h2>
          <p className="text-xl text-pharmacy-gray">
            Don't just take our word for it - hear from our satisfied patients
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t pt-4">
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-pharmacy-gray">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};