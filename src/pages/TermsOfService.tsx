import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const TermsOfService = () => {
  const navigate = useNavigate();
  useScrollToTop();

  return (
    <>
      <SEOHead 
        title="Terms of Service - My Meds Pharmacy | Brooklyn Pharmacy Terms"
        description="Read our terms of service and user agreement for My Meds Pharmacy services. Understand your rights and responsibilities when using our pharmacy services."
        keywords="terms of service, pharmacy terms, user agreement, pharmacy services terms, Brooklyn pharmacy terms, service conditions"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
      
      <div className="pt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-[#57BBB6]" />
                <h1 className="text-3xl font-bold text-[#376F6B]">Terms of Service</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-8">
                <p className="text-[#57BBB6] text-lg leading-relaxed">
                  These terms and conditions govern your use of our website and services. By using our website, you accept these terms in full.
                </p>
                <p className="text-[#57BBB6] mt-4">
                  These Terms of Service ("Terms") govern your use of My Meds Pharmacy's services, including our website, mobile applications, and pharmacy services. By using our services, you agree to be bound by these Terms.
                </p>
              </div>

              {/* Acceptance of Terms */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-[#57BBB6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Acceptance of Terms</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
                  </p>
                  <p>
                    These Terms apply to all users of our services, including patients, caregivers, and healthcare providers.
                  </p>
                </div>
              </section>

              {/* Services Description */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-6 w-6 text-[#57BBB6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Services Description</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>My Meds Pharmacy provides the following services:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Prescription medication dispensing and delivery</li>
                    <li>Medication counseling and consultation</li>
                    <li>Health screenings and immunizations</li>
                    <li>Medication therapy management</li>
                    <li>Online prescription refills</li>
                    <li>Health and wellness products</li>
                    <li>24/7 pharmacist consultation</li>
                  </ul>
                </div>
              </section>

              {/* User Responsibilities */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#57BBB6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">User Responsibilities</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>As a user of our services, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Use our services only for lawful purposes</li>
                    <li>Not attempt to access unauthorized areas of our systems</li>
                    <li>Report any suspected security breaches immediately</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Take medications as prescribed by your healthcare provider</li>
                  </ul>
                </div>
              </section>

              {/* Prescription Requirements */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Prescription Requirements</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>To receive prescription medications, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Have a valid prescription from a licensed healthcare provider</li>
                    <li>Provide accurate personal and insurance information</li>
                    <li>Be present to receive controlled substances (if required by law)</li>
                    <li>Complete required consultations for certain medications</li>
                    <li>Pay applicable copays and fees</li>
                  </ul>
                  <div className="bg-[#57BBB6]/5 rounded-xl p-6">
                    <p className="text-yellow-800">
                      <strong>Important:</strong> We reserve the right to refuse to fill any prescription if we believe it may be harmful or if we have concerns about the prescription's validity.
                    </p>
                  </div>
                </div>
              </section>

              {/* Payment Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Payment Terms</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>Payment for services is due at the time of service unless other arrangements have been made. We accept:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cash, check, and major credit cards</li>
                    <li>Insurance coverage (subject to verification)</li>
                    <li>Online payment through our secure portal</li>
                  </ul>
                  <p>
                    Prices are subject to change without notice. We will provide you with the current price before processing your order.
                  </p>
                </div>
              </section>

              {/* Privacy and Data Protection */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Privacy and Data Protection</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    Your privacy is important to us. Our collection and use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                  </p>
                  <p>
                    We are committed to protecting your health information in accordance with HIPAA and other applicable privacy laws.
                  </p>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Intellectual Property</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    All content on our website and mobile applications, including text, graphics, logos, and software, is the property of My Meds Pharmacy or its licensors and is protected by copyright and other intellectual property laws.
                  </p>
                  <p>
                    You may not reproduce, distribute, or create derivative works from our content without our express written permission.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Limitation of Liability</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    To the maximum extent permitted by law, My Meds Pharmacy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                  </p>
                  <p>
                    Our total liability to you for any claims arising from these Terms or your use of our services shall not exceed the amount you paid for the specific service giving rise to the claim.
                  </p>
                </div>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Dispute Resolution</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    Any disputes arising from these Terms or your use of our services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                  </p>
                  <p>
                    The arbitration shall be conducted in Brooklyn, New York, and the laws of the State of New York shall govern these Terms.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-[#57BBB6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Changes to Terms</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the "Last updated" date.
                  </p>
                  <p>
                    Your continued use of our services after any changes constitutes acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Contact Us</h2>
                <div className="bg-[#57BBB6]/5 rounded-lg p-6">
                  <p className="text-[#57BBB6] mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 text-[#57BBB6]">
                    <p><strong>Email:</strong> mymedspharmacy@outlook.com</p>
                    <p><strong>Phone:</strong> (347) 312-6458</p>
                    <p><strong>Address:</strong> J279+5V Brooklyn, NY</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
        </div>
      </>
    );
};

export default TermsOfService; 