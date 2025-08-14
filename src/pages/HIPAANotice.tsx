import { ArrowLeft, Shield, Lock, FileText, AlertCircle, CheckCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const HIPAANotice = () => {
  const navigate = useNavigate();
  useScrollToTop();

  return (
    <>
      <SEOHead 
        title="HIPAA Privacy Notice - My Meds Pharmacy | Brooklyn Privacy Practices"
        description="Read our HIPAA Notice of Privacy Practices. Learn how My Meds Pharmacy protects your health information and your privacy rights under federal law."
        keywords="HIPAA notice, privacy practices, health information privacy, patient privacy, Brooklyn pharmacy privacy, HIPAA compliance, health data protection"
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
                <Shield className="h-8 w-8 text-[#57bbb6]" />
                <h1 className="text-3xl font-bold text-gray-900">HIPAA Notice of Privacy Practices</h1>
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
                  Effective Date: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                  <p className="text-blue-800">
                    <strong>Important:</strong> This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.
                  </p>
                </div>
              </div>

              {/* Understanding HIPAA */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-[#57bbb6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Understanding HIPAA</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that protects the privacy and security of your health information. This notice explains your rights and our responsibilities regarding your protected health information (PHI).
                  </p>
                  <p>
                    My Meds Pharmacy is committed to maintaining the privacy and security of your health information in accordance with HIPAA regulations.
                  </p>
                </div>
              </section>

              {/* What is Protected Health Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">What is Protected Health Information?</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>Protected Health Information (PHI) includes any information about your health or healthcare that can identify you, such as:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your name, address, phone number, and other contact information</li>
                    <li>Your date of birth and social security number</li>
                    <li>Information about your medical conditions and treatments</li>
                    <li>Prescription medications and dosages</li>
                    <li>Insurance and payment information</li>
                    <li>Communications with healthcare providers</li>
                  </ul>
                </div>
              </section>

              {/* How We May Use and Disclose Your Information */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-[#57bbb6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">How We May Use and Disclose Your Information</h2>
                </div>
                <div className="space-y-6 text-[#57BBB6]">
                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Treatment</h3>
                    <p>We may use and disclose your PHI to provide, coordinate, or manage your healthcare and related services.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Payment</h3>
                    <p>We may use and disclose your PHI to obtain payment for healthcare services we provide to you.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Healthcare Operations</h3>
                    <p>We may use and disclose your PHI for our healthcare operations, such as quality assessment and improvement activities.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Required by Law</h3>
                    <p>We may use and disclose your PHI when required by federal, state, or local law.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Public Health Activities</h3>
                    <p>We may disclose your PHI for public health activities, such as reporting adverse drug reactions.</p>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-[#57bbb6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Your Rights</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Right to Access</h3>
                    <p>You have the right to inspect and copy your PHI that we maintain.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Right to Request Amendment</h3>
                    <p>You have the right to request that we amend your PHI if you believe it is incorrect or incomplete.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Right to Request Restrictions</h3>
                    <p>You have the right to request restrictions on certain uses and disclosures of your PHI.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Right to Confidential Communications</h3>
                    <p>You have the right to request that we communicate with you about your health information in a certain way or at a certain location.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Right to an Accounting</h3>
                    <p>You have the right to receive a list of certain disclosures of your PHI that we have made.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#376F6B] mb-2">Right to a Paper Copy</h3>
                    <p>You have the right to receive a paper copy of this notice at any time, even if you have agreed to receive it electronically.</p>
                  </div>
                </div>
              </section>

              {/* Our Responsibilities */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Our Responsibilities</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>We are required by law to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Maintain the privacy and security of your PHI</li>
                    <li>Provide you with this notice of our legal duties and privacy practices</li>
                    <li>Notify you if a breach of your unsecured PHI occurs</li>
                    <li>Follow the terms of this notice</li>
                    <li>Train our staff on privacy and security practices</li>
                  </ul>
                </div>
              </section>

              {/* Complaints */}
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-[#57bbb6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Complaints</h2>
                </div>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    If you believe your privacy rights have been violated, you may file a complaint with us or with the Secretary of the Department of Health and Human Services.
                  </p>
                  <p>
                    To file a complaint with us, contact our Privacy Officer at the address below. We will not retaliate against you for filing a complaint.
                  </p>
                </div>
              </section>

              {/* Changes to This Notice */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#376F6B] mb-4">Changes to This Notice</h2>
                <div className="space-y-4 text-[#57BBB6]">
                  <p>
                    We reserve the right to change this notice and to make the revised notice effective for all PHI we maintain. We will post the revised notice in our pharmacy and on our website.
                  </p>
                  <p>
                    You may request a copy of the revised notice at any time.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="h-6 w-6 text-[#57bbb6]" />
                  <h2 className="text-2xl font-semibold text-[#376F6B]">Contact Information</h2>
                </div>
                <div className="bg-[#57BBB6]/5 rounded-lg p-6">
                  <p className="text-[#57BBB6] mb-4">
                    If you have any questions about this notice or our privacy practices, please contact our Privacy Officer:
                  </p>
                  <div className="space-y-2 text-[#57BBB6]">
                    <p><strong>Privacy Officer:</strong> My Meds Pharmacy</p>
                    <p><strong>Email:</strong> privacy@mymedspharmacy.com</p>
                    <p><strong>Phone:</strong> (347) 312-6458</p>
                    <p><strong>Address:</strong> J279+5V Brooklyn, NY</p>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Department of Health and Human Services:</strong><br />
                      Office for Civil Rights<br />
                      200 Independence Avenue, S.W.<br />
                      Washington, D.C. 20201<br />
                      Phone: 1-877-696-6775
                    </p>
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

export default HIPAANotice; 