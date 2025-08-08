import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  FileCheck,
  Fingerprint,
  Camera as CameraIcon,
  UploadCloud,
  AlertCircle,
  Info
} from 'lucide-react';
import { HIPAAFormBanner } from '@/components/HIPAACompliance';
import api from '@/lib/api';

interface AccountCreationData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  ssn: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Insurance Information
  insuranceProvider: string;
  insuranceGroupNumber: string;
  insuranceMemberId: string;
  
  // Medical Information
  primaryCarePhysician: string;
  physicianPhone: string;
  allergies: string;
  currentMedications: string;
  medicalConditions: string;
  
  // Legal Documentation
  governmentIdType: string;
  governmentIdNumber: string;
  governmentIdFile: File | null;
  proofOfAddressFile: File | null;
  insuranceCardFile: File | null;
  
  // Verification
  identityVerified: boolean;
  addressVerified: boolean;
  insuranceVerified: boolean;
  
  // Legal Agreements
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  hipaaConsent: boolean;
  medicalAuthorization: boolean;
  financialResponsibility: boolean;
  
  // Security
  password: string;
  confirmPassword: string;
  securityQuestions: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    question3: string;
    answer3: string;
  };
}

const securityQuestions = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your mother's maiden name?",
  "What was the make of your first car?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "What is the name of the street you grew up on?"
];

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function PatientAccountCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const [formData, setFormData] = useState<AccountCreationData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    insuranceProvider: '',
    insuranceGroupNumber: '',
    insuranceMemberId: '',
    primaryCarePhysician: '',
    physicianPhone: '',
    allergies: '',
    currentMedications: '',
    medicalConditions: '',
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdFile: null,
    proofOfAddressFile: null,
    insuranceCardFile: null,
    identityVerified: false,
    addressVerified: false,
    insuranceVerified: false,
    termsAccepted: false,
    privacyPolicyAccepted: false,
    hipaaConsent: false,
    medicalAuthorization: false,
    financialResponsibility: false,
    password: '',
    confirmPassword: '',
    securityQuestions: {
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: ''
    }
  });

  const updateFormData = (field: keyof AccountCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSecurityQuestion = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      securityQuestions: {
        ...prev.securityQuestions,
        [field]: value
      }
    }));
  };

  const handleFileUpload = (field: keyof AccountCreationData, file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only JPEG, PNG, or PDF files');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    updateFormData(field, file);
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Information
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth && 
                 formData.email && formData.phone && formData.ssn);
      
      case 2: // Address & Emergency Contact
        return !!(formData.address && formData.city && formData.state && formData.zipCode &&
                 formData.emergencyContactName && formData.emergencyContactPhone);
      
      case 3: // Insurance & Medical
        return !!(formData.insuranceProvider && formData.insuranceGroupNumber && 
                 formData.insuranceMemberId && formData.primaryCarePhysician);
      
      case 4: // Legal Documentation
        return !!(formData.governmentIdType && formData.governmentIdNumber && 
                 formData.governmentIdFile && formData.proofOfAddressFile);
      
      case 5: // Legal Agreements
        return !!(formData.termsAccepted && formData.privacyPolicyAccepted && 
                 formData.hipaaConsent && formData.medicalAuthorization && 
                 formData.financialResponsibility);
      
      case 6: // Security Setup
        return !!(formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword &&
                 formData.password.length >= 8 &&
                 formData.securityQuestions.answer1 && 
                 formData.securityQuestions.answer2 && 
                 formData.securityQuestions.answer3);
      
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please complete all required fields');
      return;
    }

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setError('');
      return;
    }

    // Final submission
    setLoading(true);
    setError('');

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'securityQuestions') {
          submitData.append(key, JSON.stringify(formData.securityQuestions));
        } else if (key.includes('File') && formData[key as keyof AccountCreationData]) {
          submitData.append(key, formData[key as keyof AccountCreationData] as File);
        } else if (key !== 'governmentIdFile' && key !== 'proofOfAddressFile' && key !== 'insuranceCardFile') {
          submitData.append(key, String(formData[key as keyof AccountCreationData]));
        }
      });

      // Submit to backend
      const response = await api.post('/patient/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Account created successfully! You will receive verification email shortly.');
      
      // Redirect to patient portal after 3 seconds
      setTimeout(() => {
        navigate('/patient-portal');
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Address & Emergency', icon: MapPin },
    { number: 3, title: 'Insurance & Medical', icon: FileText },
    { number: 4, title: 'Identity Verification', icon: Shield },
    { number: 5, title: 'Legal Agreements', icon: FileCheck },
    { number: 6, title: 'Security Setup', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-light/30 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Patient Account</h1>
          <p className="text-gray-600">Complete the registration process to access your secure patient portal</p>
        </div>

        <HIPAAFormBanner />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Creation Progress
            </CardTitle>
            <CardDescription>
              Step {currentStep} of 6: {steps[currentStep - 1]?.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.number <= currentStep 
                      ? 'bg-brand text-white border-brand' 
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}>
                    {step.number < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step.number < currentStep ? 'bg-brand' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 6) * 100} className="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Please provide your basic personal information"}
              {currentStep === 2 && "Enter your address and emergency contact details"}
              {currentStep === 3 && "Provide insurance and medical information"}
              {currentStep === 4 && "Upload required documents for identity verification"}
              {currentStep === 5 && "Review and accept legal agreements"}
              {currentStep === 6 && "Set up your account security"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ssn">Social Security Number *</Label>
                      <Input
                        id="ssn"
                        type="password"
                        value={formData.ssn}
                        onChange={(e) => updateFormData('ssn', e.target.value)}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                        placeholder="Enter ZIP code"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                        <Input
                          id="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                          placeholder="Enter emergency contact name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                        <Input
                          id="emergencyContactPhone"
                          type="tel"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                      <Input
                        id="emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={(e) => updateFormData('emergencyContactRelationship', e.target.value)}
                        placeholder="e.g., Spouse, Parent, Friend"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                        <Input
                          id="insuranceProvider"
                          value={formData.insuranceProvider}
                          onChange={(e) => updateFormData('insuranceProvider', e.target.value)}
                          placeholder="Enter insurance provider name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="insuranceGroupNumber">Group Number *</Label>
                        <Input
                          id="insuranceGroupNumber"
                          value={formData.insuranceGroupNumber}
                          onChange={(e) => updateFormData('insuranceGroupNumber', e.target.value)}
                          placeholder="Enter group number"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="insuranceMemberId">Member ID *</Label>
                      <Input
                        id="insuranceMemberId"
                        value={formData.insuranceMemberId}
                        onChange={(e) => updateFormData('insuranceMemberId', e.target.value)}
                        placeholder="Enter member ID"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryCarePhysician">Primary Care Physician *</Label>
                        <Input
                          id="primaryCarePhysician"
                          value={formData.primaryCarePhysician}
                          onChange={(e) => updateFormData('primaryCarePhysician', e.target.value)}
                          placeholder="Enter physician name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="physicianPhone">Physician Phone *</Label>
                        <Input
                          id="physicianPhone"
                          type="tel"
                          value={formData.physicianPhone}
                          onChange={(e) => updateFormData('physicianPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) => updateFormData('allergies', e.target.value)}
                        placeholder="List any known allergies (or 'None')"
                        rows={2}
                      />
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="currentMedications">Current Medications</Label>
                      <Textarea
                        id="currentMedications"
                        value={formData.currentMedications}
                        onChange={(e) => updateFormData('currentMedications', e.target.value)}
                        placeholder="List current medications (or 'None')"
                        rows={2}
                      />
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea
                        id="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={(e) => updateFormData('medicalConditions', e.target.value)}
                        placeholder="List any medical conditions (or 'None')"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Identity Verification Required:</strong> Please upload clear, legible copies of your documents. 
                      All documents will be securely encrypted and used only for verification purposes.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="governmentIdType">Government ID Type *</Label>
                      <Select value={formData.governmentIdType} onValueChange={(value) => updateFormData('governmentIdType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drivers-license">Driver's License</SelectItem>
                          <SelectItem value="state-id">State ID</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="military-id">Military ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="governmentIdNumber">Government ID Number *</Label>
                      <Input
                        id="governmentIdNumber"
                        value={formData.governmentIdNumber}
                        onChange={(e) => updateFormData('governmentIdNumber', e.target.value)}
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Government ID Upload *</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('governmentIdFile', e.target.files[0])}
                            className="hidden"
                            id="governmentIdFile"
                          />
                          <label htmlFor="governmentIdFile" className="cursor-pointer text-brand hover:text-brand-light">
                            <span className="font-medium">Click to upload</span> or drag and drop
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</p>
                        {formData.governmentIdFile && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ {formData.governmentIdFile.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Proof of Address Upload *</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfAddressFile', e.target.files[0])}
                            className="hidden"
                            id="proofOfAddressFile"
                          />
                          <label htmlFor="proofOfAddressFile" className="cursor-pointer text-brand hover:text-brand-light">
                            <span className="font-medium">Click to upload</span> or drag and drop
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Utility bill, bank statement, or lease agreement</p>
                        {formData.proofOfAddressFile && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ {formData.proofOfAddressFile.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Insurance Card Upload</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('insuranceCardFile', e.target.files[0])}
                            className="hidden"
                            id="insuranceCardFile"
                          />
                          <label htmlFor="insuranceCardFile" className="cursor-pointer text-brand hover:text-brand-light">
                            <span className="font-medium">Click to upload</span> or drag and drop
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Front and back of insurance card</p>
                        {formData.insuranceCardFile && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ {formData.insuranceCardFile.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Verification Process</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          After uploading your documents, our verification team will review them within 24-48 hours. 
                          You will receive an email notification once your account is verified and activated.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Legal Requirements:</strong> Please read and accept all terms and agreements to proceed with account creation.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="termsAccepted"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="termsAccepted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Terms of Service *
                        </Label>
                        <p className="text-sm text-gray-500">
                          I have read and agree to the <a href="/terms-of-service" className="text-brand hover:underline" target="_blank">Terms of Service</a> 
                          and understand my rights and responsibilities as a patient.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacyPolicyAccepted"
                        checked={formData.privacyPolicyAccepted}
                        onCheckedChange={(checked) => updateFormData('privacyPolicyAccepted', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="privacyPolicyAccepted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Privacy Policy *
                        </Label>
                        <p className="text-sm text-gray-500">
                          I have read and agree to the <a href="/privacy-policy" className="text-brand hover:underline" target="_blank">Privacy Policy</a> 
                          and understand how my information will be used and protected.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hipaaConsent"
                        checked={formData.hipaaConsent}
                        onCheckedChange={(checked) => updateFormData('hipaaConsent', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="hipaaConsent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          HIPAA Consent *
                        </Label>
                        <p className="text-sm text-gray-500">
                          I acknowledge receipt of the <a href="/hipaa-notice" className="text-brand hover:underline" target="_blank">HIPAA Notice of Privacy Practices</a> 
                          and consent to the use and disclosure of my health information for treatment, payment, and healthcare operations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="medicalAuthorization"
                        checked={formData.medicalAuthorization}
                        onCheckedChange={(checked) => updateFormData('medicalAuthorization', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="medicalAuthorization" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Medical Authorization *
                        </Label>
                        <p className="text-sm text-gray-500">
                          I authorize My Meds Pharmacy to provide pharmaceutical services and communicate with my healthcare providers 
                          regarding my medications and treatment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="financialResponsibility"
                        checked={formData.financialResponsibility}
                        onCheckedChange={(checked) => updateFormData('financialResponsibility', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="financialResponsibility" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Financial Responsibility *
                        </Label>
                        <p className="text-sm text-gray-500">
                          I understand that I am financially responsible for any charges not covered by my insurance, 
                          including copayments, deductibles, and non-covered services.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          By accepting these terms, you acknowledge that providing false information or failing to disclose 
                          relevant medical information may result in account termination and could have serious health consequences.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Setup:</strong> Create a strong password and set up security questions to protect your account.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => updateFormData('password', e.target.value)}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Security Questions</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Security Question 1 *</Label>
                        <Select value={formData.securityQuestions.question1} onValueChange={(value) => updateSecurityQuestion('question1', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>{question}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2"
                          value={formData.securityQuestions.answer1}
                          onChange={(e) => updateSecurityQuestion('answer1', e.target.value)}
                          placeholder="Enter your answer"
                        />
                      </div>

                      <div>
                        <Label>Security Question 2 *</Label>
                        <Select value={formData.securityQuestions.question2} onValueChange={(value) => updateSecurityQuestion('question2', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>{question}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2"
                          value={formData.securityQuestions.answer2}
                          onChange={(e) => updateSecurityQuestion('answer2', e.target.value)}
                          placeholder="Enter your answer"
                        />
                      </div>

                      <div>
                        <Label>Security Question 3 *</Label>
                        <Select value={formData.securityQuestions.question3} onValueChange={(value) => updateSecurityQuestion('question3', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>{question}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2"
                          value={formData.securityQuestions.answer3}
                          onChange={(e) => updateSecurityQuestion('answer3', e.target.value)}
                          placeholder="Enter your answer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Account Creation Complete</h4>
                        <p className="text-sm text-green-700 mt-1">
                          You're almost done! Click "Create Account" to submit your application. 
                          Our team will review your information and verify your identity within 24-48 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : currentStep === 6 ? (
                  'Create Account'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/patient-portal" className="text-brand hover:underline">
              Sign in to your patient portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
