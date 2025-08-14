import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Truck, Package, Phone, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HowItWorksProps {
  className?: string;
  showTitle?: boolean;
}

export const HowItWorks = ({ className = '', showTitle = true }: HowItWorksProps) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      icon: ShoppingCart,
      title: "Place your order",
      description: "Order online, by phone, or in-store",
      details: "Choose from our easy ordering options. Our user-friendly website, dedicated phone line, or visit us in person for personalized service."
    },
    {
      id: 2,
      icon: Package,
      title: "We prepare & package",
      description: "Our team carefully prepares your order",
      details: "Licensed pharmacists review and prepare your medications with the highest standards of safety and accuracy."
    },
    {
      id: 3,
      icon: CheckCircle,
      title: "Get tracking info",
      description: "Receive real-time updates",
      details: "Stay informed with SMS notifications, email updates, and real-time tracking through our secure patient portal."
    },
    {
      id: 4,
      icon: Truck,
      title: "Same-day delivery",
      description: "Fast delivery to your doorstep",
      details: "Enjoy same-day delivery within Brooklyn, with secure handling and professional delivery personnel."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
          <section className={`py-16 sm:py-20 md:py-24 relative overflow-hidden ${showTitle ? '' : 'pt-0'}`}>
      {/* Background Image Placeholder - Replace with actual pharmacy process/workflow image */}
                   <div
               className="absolute inset-0 opacity-60 pointer-events-none"
               style={{
                 backgroundImage: `url('/images/new/homepage.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             ></div>
             
             {/* Balanced Overlay for Text Readability */}
             <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      {/* Background Blur Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#57BBB6]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#376F6B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showTitle && (
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] leading-tight mb-6">
              HOW IT WORKS
            </h2>
            <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-medium">
              Simple, transparent, and efficient - your healthcare journey made easy
            </p>
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={stepVariants}
              onHoverStart={() => setHoveredStep(step.id)}
              onHoverEnd={() => setHoveredStep(null)}
              className="group cursor-pointer"
            >
              <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#376F6B] to-[#57BBB6] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <CardContent className="p-6 sm:p-8 text-center relative z-10">
                  {/* Step Number Circle */}
                  <div className="relative mb-6">
                    <motion.div
                      className="w-16 h-16 bg-[#376F6B] rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-2xl font-bold text-white">{step.id}</span>
                    </motion.div>
                    
                    {/* Animated Arrow */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 text-[#376F6B]"
                        animate={{ x: hoveredStep === step.id ? 5 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="h-8 w-8" />
                      </motion.div>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <motion.div
                      className="w-12 h-12 bg-[#57BBB6]/20 rounded-xl flex items-center justify-center mx-auto"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <step.icon className="h-6 w-6 text-[#376F6B]" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[#376F6B] group-hover:text-[#57BBB6] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#376F6B] font-medium leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Expandable Details */}
                    <motion.div
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: hoveredStep === step.id ? 'auto' : 0,
                        opacity: hoveredStep === step.id ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-xs sm:text-sm text-[#376F6B]/80 leading-relaxed pt-2">
                        {step.details}
                      </p>
                    </motion.div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-[#376F6B] to-[#57BBB6] h-2 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(step.id / steps.length) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-[#376F6B] font-medium mb-4">
            Ready to get started?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#376F6B] hover:bg-[#57BBB6] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your Order
            </button>
            <button className="border-2 border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
