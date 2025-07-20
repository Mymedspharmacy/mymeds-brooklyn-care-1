import { ShoppingCart, Heart, Zap, Thermometer, Bandage, Pill } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const OTCSection = () => {
  const navigate = useNavigate();
  const otcCategories = [
    {
      icon: Heart,
      title: "Heart Health",
      description: "Vitamins, supplements, and monitors for cardiovascular wellness",
      items: ["Blood pressure monitors", "Heart-healthy supplements", "Cholesterol management", "Omega-3 supplements"]
    },
    {
      icon: Thermometer,
      title: "Cold & Flu",
      description: "Relief from common cold and flu symptoms",
      items: ["Pain relievers", "Cough suppressants", "Throat lozenges", "Decongestants"]
    },
    {
      icon: Bandage,
      title: "First Aid",
      description: "Essential supplies for minor injuries and emergencies",
      items: ["Bandages & gauze", "Antiseptic wipes", "Pain relief gels", "Thermometers"]
    },
    {
      icon: Zap,
      title: "Vitamins & Supplements",
      description: "Daily wellness and nutritional support",
      items: ["Multivitamins", "Vitamin D", "Calcium supplements", "Probiotics"]
    },
    {
      icon: Pill,
      title: "Digestive Health",
      description: "Solutions for digestive comfort and wellness",
      items: ["Antacids", "Anti-diarrheal", "Fiber supplements", "Probiotics"]
    },
    {
      icon: ShoppingCart,
      title: "Personal Care",
      description: "Daily hygiene and personal wellness products",
      items: ["Oral care", "Skin care", "Hair care", "Body care"]
    }
  ];

  return (
    <section id="otc" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Over-the-Counter Products</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find everything you need for your daily health and wellness, available without prescription
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {otcCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <category.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground mb-4 text-base leading-relaxed">
                  {category.description}
                </CardDescription>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Can't find what you're looking for? Our knowledgeable staff is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/shop')}
              className="bg-[#376f6b] hover:bg-[#57bbb6] text-white"
            >
              Browse Products In-Store
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Try to open phone dialer
                const phoneNumber = '3473126458';
                const telLink = `tel:${phoneNumber}`;
                
                // For mobile devices, this will open the phone app
                // For desktop, it will show a confirmation dialog
                if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                  window.location.href = telLink;
                } else {
                  // For desktop browsers, show a confirmation dialog
                  if (confirm(`Call ${phoneNumber}?`)) {
                    window.open(telLink);
                  }
                }
              }}
              className="border-[#376f6b] text-[#376f6b] hover:bg-[#376f6b] hover:text-white transition-colors"
            >
              📞 Call for Availability
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};