import { ArrowLeft, Shield, Eye, Lock, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  useScrollToTop();

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <SEOHead 
        title="Privacy Policy - My Meds Pharmacy"
        description="Learn about how My Meds Pharmacy collects, uses, and protects your personal information. Read our comprehensive privacy policy to understand your rights and our data practices."
        keywords="privacy policy, data protection, personal information, pharmacy privacy, HIPAA compliance"
      />
      <Header 
        onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
        onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
      />
        
        <div className="pt-20">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-[#57bbb6]/20">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <Button 
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  className="flex items-center gap-2 text-[#376f6b] hover:text-[#57bbb6] hover:bg-[#57bbb6]/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-[#376f6b] mb-4">Privacy Policy</h1>
                <p className="text-lg text-[#57bbb6] max-w-2xl mx-auto">
                  Your privacy is important to us. Learn how we collect, use, and protect your information.
                </p>
              </div>
            </div>
          </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            
            {/* Last Updated */}
            <div className="text-center pb-8 border-b border-[#57BBB6]/20">
              <p className="text-[#57BBB6]">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Information Collection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#376f6b]">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-[#57BBB6]">
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Prescription and medical information</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences</li>
                  <li>Feedback and survey responses</li>
                </ul>
                <p>We also automatically collect certain information when you visit our website, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and preferences</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#376f6b]">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-[#57BBB6]">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and improve our pharmaceutical services</li>
                  <li>Process prescriptions and medication orders</li>
                  <li>Communicate with you about your health and medications</li>
                  <li>Send important updates and notifications</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Improve our website and services</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#376f6b]">Information Sharing and Disclosure</h2>
              </div>
              <div className="space-y-4 text-[#57BBB6]">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and providing services</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred as part of the business assets</li>
                  <li><strong>Emergency Situations:</strong> We may share information in emergency situations to protect public health and safety</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#376f6b]">Data Security</h2>
              </div>
              <div className="space-y-4 text-[#57BBB6]">
                <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                  <li>Compliance with HIPAA and other relevant regulations</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#376f6b] to-[#57bbb6] rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#376f6b]">Your Rights</h2>
              </div>
              <div className="space-y-4 text-[#57BBB6]">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of marketing communications</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided below.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-[#57BBB6]/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#376f6b] mb-4">Contact Us</h3>
              <div className="space-y-2 text-[#57BBB6]">
                <p><strong>My Meds Pharmacy</strong></p>
                <p>2242 65th St, Brooklyn, NY</p>
                <p>Phone: (347) 312-6458</p>
                <p>Email: Mymedspharmacy@outlook.com</p>
                <p>Hours: Monday - Saturday, 9:00 AM - 7:00 PM</p>
                <p className="mt-4">
                  If you have any questions about this Privacy Policy, please contact us using the information above.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 








