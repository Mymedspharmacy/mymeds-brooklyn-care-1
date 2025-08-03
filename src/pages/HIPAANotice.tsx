import { ArrowLeft, Shield, Lock, FileText, AlertCircle, CheckCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const HIPAANotice = () => {
  const navigate = useNavigate();
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
              <p className="text-gray-600 text-lg leading-relaxed">
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
                <h2 className="text-2xl font-semibold text-gray-900">Understanding HIPAA</h2>
              </div>
              <div className="space-y-4 text-gray-700">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is Protected Health Information?</h2>
              <div className="space-y-4 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900">How We May Use and Disclose Your Information</h2>
              </div>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment</h3>
                  <p>We may use and disclose your PHI to provide, coordinate, or manage your healthcare and related services. This includes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Filling your prescriptions</li>
                    <li>Providing medication counseling</li>
                    <li>Coordinating with your healthcare providers</li>
                    <li>Managing your medication therapy</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment</h3>
                  <p>We may use and disclose your PHI to obtain payment for services we provide to you. This includes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Billing your insurance company</li>
                    <li>Processing claims</li>
                    <li>Determining eligibility for benefits</li>
                    <li>Collecting payment from you</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Healthcare Operations</h3>
                  <p>We may use and disclose your PHI for our healthcare operations. This includes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Quality assessment and improvement activities</li>
                    <li>Staff training and evaluation</li>
                    <li>Business planning and development</li>
                    <li>Legal and regulatory compliance</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Other Permitted Uses and Disclosures */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Other Permitted Uses and Disclosures</h2>
              <div className="space-y-4 text-gray-700">
                <p>We may also use or disclose your PHI in the following situations:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>With Your Authorization:</strong> For any purpose not covered by this notice, we will obtain your written authorization</li>
                  <li><strong>Public Health Activities:</strong> To report adverse drug reactions or other public health concerns</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government agency</li>
                  <li><strong>Health Oversight:</strong> To health oversight agencies for audits and investigations</li>
                  <li><strong>Law Enforcement:</strong> In response to a valid subpoena or court order</li>
                  <li><strong>Emergency Situations:</strong> To prevent or lessen a serious threat to health or safety</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-[#57bbb6]" />
                <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
              </div>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Access</h3>
                  <p>You have the right to inspect and copy your PHI that we maintain. We may charge a reasonable fee for copying and postage.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Request Amendment</h3>
                  <p>You have the right to request that we amend your PHI if you believe it is inaccurate or incomplete. We may deny your request under certain circumstances.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Request Restrictions</h3>
                  <p>You have the right to request restrictions on how we use or disclose your PHI for treatment, payment, or healthcare operations. We are not required to agree to all restrictions.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Confidential Communications</h3>
                  <p>You have the right to request that we communicate with you about your health information in a certain way or at a certain location.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to an Accounting</h3>
                  <p>You have the right to receive a list of certain disclosures of your PHI that we have made.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to a Paper Copy</h3>
                  <p>You have the right to receive a paper copy of this notice at any time, even if you have agreed to receive it electronically.</p>
                </div>
              </div>
            </section>

            {/* Our Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Responsibilities</h2>
              <div className="space-y-4 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900">Complaints</h2>
              </div>
              <div className="space-y-4 text-gray-700">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Notice</h2>
              <div className="space-y-4 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this notice or our privacy practices, please contact our Privacy Officer:
                </p>
                <div className="space-y-2 text-gray-700">
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
  );
};

export default HIPAANotice; 