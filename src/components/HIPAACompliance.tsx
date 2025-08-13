import { Shield, Lock, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const hipaaFeatures = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Your health information is protected under federal law'
  },
  {
    icon: Lock,
    title: 'SSL Encrypted',
    description: 'All data is encrypted using industry-standard SSL technology'
  },
  {
    icon: Eye,
    title: 'Privacy Protected',
    description: 'Your personal information is never shared without consent'
  },
  {
    icon: CheckCircle,
    title: 'Secure Storage',
    description: 'Patient data is stored in secure, encrypted databases'
  }
];

interface HIPAAComplianceProps {
  variant?: 'badge' | 'card' | 'footer';
  showDetails?: boolean;
}

export const HIPAACompliance = ({ variant = 'badge', showDetails = false }: HIPAAComplianceProps) => {

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-help"
            >
              <Shield className="h-3 w-3 mr-1" />
              HIPAA Compliant
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-semibold mb-1">HIPAA Compliant</p>
              <p className="text-sm">Your health information is protected under federal law. We follow strict privacy and security standards.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="border-white bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            HIPAA Compliance
          </CardTitle>
          <CardDescription className="text-green-700">
            Your privacy and data security are our top priorities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Data Protection</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Encrypted data transmission</li>
                <li>• Secure storage systems</li>
                <li>• Access controls and authentication</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Privacy Standards</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Strict confidentiality policies</li>
                <li>• Limited data access</li>
                <li>• Regular security audits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Privacy Protected</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <p>Your health information is protected under federal law (HIPAA)</p>
              <p>All communications are encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// HIPAA Compliance Banner for forms
export const HIPAAFormBanner = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-800 mb-1">Privacy Notice</h4>
          <p className="text-sm text-blue-700 mb-2">
            This form is HIPAA compliant. Your information is encrypted and protected under federal law. 
            We will only use your information to provide pharmacy services and will never share it without your consent.
          </p>
          <div className="flex items-center space-x-4 text-xs text-blue-600">
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>HIPAA Protected</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>SSL Encrypted</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Secure Transmission</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// HIPAA Compliance Modal
export const HIPAAComplianceModal = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">HIPAA Compliance & Privacy</h2>
              <p className="text-gray-600">Your health information is protected</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Protect Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hipaaFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <feature.icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rights Under HIPAA</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Right to access your health information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Right to request corrections to your records</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Right to receive a copy of our privacy notice</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Right to file a complaint if you believe your rights have been violated</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Contact Information</h4>
              <p className="text-sm text-blue-700">
                If you have questions about our privacy practices or would like to exercise your rights, 
                please contact us at (347) 312-6458 or email us at Mymedspharmacy@outlook.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
