import { Award, Heart, Users, Clock } from "lucide-react";

export const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">About My Meds Pharmacy</h2>
            <p className="text-lg text-pharmacy-gray mb-6 leading-relaxed">
              Located in the heart of Brooklyn, My Meds Pharmacy has been serving our community with 
              dedication, expertise, and genuine care. We believe that exceptional pharmaceutical care 
              goes beyond just dispensing medications.
            </p>
            <p className="text-lg text-pharmacy-gray mb-8 leading-relaxed">
              Our team of licensed pharmacists and healthcare professionals are committed to 
              providing personalized service, expert advice, and innovative solutions to meet 
              your unique health needs.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4">
                <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-2xl text-foreground">Licensed</h3>
                <p className="text-pharmacy-gray">Certified Pharmacists</p>
              </div>
              <div className="text-center p-4">
                <Heart className="h-12 w-12 text-pharmacy-red mx-auto mb-3" />
                <h3 className="font-bold text-2xl text-foreground">Caring</h3>
                <p className="text-pharmacy-gray">Personalized Service</p>
              </div>
              <div className="text-center p-4">
                <Users className="h-12 w-12 text-accent mx-auto mb-3" />
                <h3 className="font-bold text-2xl text-foreground">Community</h3>
                <p className="text-pharmacy-gray">Local Focus</p>
              </div>
              <div className="text-center p-4">
                <Clock className="h-12 w-12 text-pharmacy-purple mx-auto mb-3" />
                <h3 className="font-bold text-2xl text-foreground">Available</h3>
                <p className="text-pharmacy-gray">Extended Hours</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide exceptional pharmaceutical care while building lasting relationships with 
                our patients through trust, expertise, and personalized attention to their health needs.
              </p>
            </div>

            <div className="bg-accent/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Why Choose Us?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Experienced, licensed pharmacists
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Convenient location and extended hours
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Comprehensive health services
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Free prescription delivery service
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Insurance accepted and affordable pricing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};