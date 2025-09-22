import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from '../lib/api';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
}

export const AppointmentForm = ({ isOpen, onClose, selectedService }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    service: selectedService || '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Update form when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        service: selectedService
      }));
    }
  }, [selectedService]);

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
  ];

  const services = [
    'Immunizations',
    'Medication Review',
    'Health Consultation',
    'Blood Pressure Check',
    'Diabetes Management',
    'Vision Test for DMV',
    'Notary Public',
    'Other Services'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.preferredDate) newErrors.preferredDate = 'Please select a date';
    if (!formData.preferredTime) newErrors.preferredTime = 'Please select a time';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all required fields.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/appointments', formData);
      setSuccess(true);
      setFormData({ 
        firstName: '', lastName: '', phone: '', email: '', 
        service: '', preferredDate: '', preferredTime: '', notes: '' 
      });
      setErrors({});
      toast({ 
        title: 'Success!', 
        description: "We'll contact you within 24 hours to confirm your appointment." 
      });
      setTimeout(() => onClose(), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit appointment request';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Book Appointment</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <User className="inline h-4 w-4 mr-2" />
                  First Name *
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'border-red-500' : ''}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name *
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'border-red-500' : ''}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone *
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'border-red-500' : ''}
                  placeholder="Phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Service *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              {errors.service && (
                <p className="text-red-500 text-xs mt-1">{errors.service}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Preferred Date *
                </label>
                <Input
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.preferredDate ? 'border-red-500' : ''}
                />
                {errors.preferredDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Preferred Time *
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.preferredTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <MessageSquare className="inline h-4 w-4 mr-2" />
                Additional Notes
              </label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any special requests or additional information..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                Appointment request submitted successfully!
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};