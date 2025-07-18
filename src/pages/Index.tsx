import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { RefillForm } from "@/components/RefillForm";
import { useState } from "react";

const Index = () => {
  const [showRefillForm, setShowRefillForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onRefillClick={() => setShowRefillForm(true)} />
      <Hero onRefillClick={() => setShowRefillForm(true)} />
      <Services />
      <About />
      <Testimonials />
      <Contact />
      <Footer />
      <RefillForm isOpen={showRefillForm} onClose={() => setShowRefillForm(false)} />
    </div>
  );
};

export default Index;
