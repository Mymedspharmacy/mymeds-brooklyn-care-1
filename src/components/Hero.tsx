import { Button } from "@/components/ui/button";
import { Phone, Truck, Clock } from "lucide-react";
import heroImage from "@/assets/pharmacy-hero.jpg";

interface HeroProps {
  onRefillClick: () => void;
}

export const Hero = ({ onRefillClick }: HeroProps) => {
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

  return (
    <section id="home" className="py-10 sm:py-16 lg:py-20">
      <div className="container-fluid px-4">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-12 col-lg-6 order-2 order-lg-1">
            <div className="text-center text-lg-start">
              <div className="mb-4 mb-lg-5">
                <h1 className="display-6 display-md-4 display-lg-3 fw-bold text-brand-black lh-sm">
                  Your Trusted
                  <span className="text-brand d-block">Neighborhood Pharmacy</span>
                </h1>
                <p className="lead text-brand-dark mt-3 mt-lg-4 lh-base">
                  Providing exceptional pharmaceutical care and personalized service to the Brooklyn community since day one. Your health is our priority.
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-4 mb-lg-5">
                <Button 
                  onClick={onRefillClick}
                  size="lg" 
                  className="btn btn-primary bg-brand hover:bg-brand-dark px-4 py-3 fw-semibold"
                >
                  Refill Prescription
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="btn btn-outline-primary border-brand text-brand hover:bg-brand-light hover:text-brand-dark px-4 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleCallClick}
                >
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </Button>
              </div>

              <div className="row g-3 g-lg-4">
                <div className="col-12 col-sm-4">
                  <div className="card h-100 border-0 shadow-sm text-center p-3">
                    <div className="card-body d-flex flex-column align-items-center">
                      <Truck className="text-primary mb-2" size={24} />
                      <h6 className="card-title fw-semibold mb-1">Free Delivery over $50</h6>
                      <p className="card-text small text-muted mb-0">Local prescription delivery</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="card h-100 border-0 shadow-sm text-center p-3">
                    <div className="card-body d-flex flex-column align-items-center">
                      <Clock className="text-accent mb-2" size={24} />
                      <h6 className="card-title fw-semibold mb-1">Extended Hours</h6>
                      <p className="card-text small text-muted mb-0">Open 6 days a week</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="card h-100 border-0 shadow-sm text-center p-3">
                    <div className="card-body d-flex flex-column align-items-center">
                      <Phone className="text-pharmacy-purple mb-2" size={24} />
                      <h6 className="card-title fw-semibold mb-1">Expert Care</h6>
                      <p className="card-text small text-muted mb-0">Professional consultation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 order-1 order-lg-2">
            <div className="position-relative">
              <div className="card border-0 shadow-lg p-1 p-lg-2">
                <img 
                  src={heroImage}
                  alt="Modern pharmacy interior" 
                  className="card-img img-fluid rounded"
                  style={{ height: '300px', objectFit: 'cover' }}
                  sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 500px"
                />
                <div className="position-absolute top-0 end-0 translate-middle">
                  <div className="bg-[#376f6b] text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '4rem', height: '4rem' }}>
                    <div className="text-center">
                      <div className="fw-bold h5 mb-0">3+</div>
                      <div className="small">Years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};