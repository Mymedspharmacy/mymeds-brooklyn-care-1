import { useState } from "react";
import { X, Pill, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from '../lib/api';

interface RefillFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefillForm = ({ isOpen, onClose }: RefillFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    prescriptionNumber: '',
    medication: '',
    pharmacy: '',
    notes: ''
  });
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate file upload
    if (!prescriptionFile) {
      setError('Please upload your prescription file');
      toast({ title: 'Error', description: 'Please upload your prescription file', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Create FormData to include file upload
      const formDataToSend = new FormData();
      formDataToSend.append('file', prescriptionFile);
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      await api.post('/prescriptions/refill', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setFormData({
        firstName: '', lastName: '', phone: '', email: '', prescriptionNumber: '', medication: '', pharmacy: '', notes: ''
      });
      setPrescriptionFile(null);
      toast({ title: 'Refill Request Submitted!', description: "We'll process your prescription refill and contact you when it's ready." });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit refill request');
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="relative rounded-t-lg" style={{ backgroundColor: '#376f6b', color: '#fff' }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-primary-foreground hover:text-primary-foreground/70"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <Pill className="h-8 w-8" />
              <CardTitle className="text-2xl">Prescription Refill Request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Patient Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      First Name *
                    </label>
                    <Input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Last Name *
                    </label>
                    <Input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(347) 312-6458"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Prescription Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Pill className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Prescription Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Prescription Number *
                    </label>
                    <Input
                      name="prescriptionNumber"
                      type="text"
                      required
                      value={formData.prescriptionNumber}
                      onChange={handleChange}
                      placeholder="Rx# (required)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Medication Name *
                    </label>
                    <Input
                      name="medication"
                      type="text"
                      required
                      value={formData.medication}
                      onChange={handleChange}
                      placeholder="Name of medication"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Current Pharmacy
                  </label>
                  <Input
                    name="pharmacy"
                    type="text"
                    value={formData.pharmacy}
                    onChange={handleChange}
                    placeholder="Name of current pharmacy"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions, questions, or additional information..."
                />
              </div>

              {/* Prescription File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#376f6b] mb-2">
                  Upload Prescription *
                </label>
                <input 
                  id="prescriptionFile"
                  name="prescriptionFile"
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={e => setPrescriptionFile(e.target.files?.[0] || null)} 
                  required 
                  className="border p-2 rounded w-full" 
                />
                {prescriptionFile && (
                  <div className="text-[#57bbb6] mt-1">
                    Selected: {prescriptionFile.name}
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="w-full text-lg py-3" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
                {success && <div className="text-green-600 mt-2">Refill request sent!</div>}
                <Button type="button" variant="outline" onClick={onClose} className="px-6">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};