import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Phone, Mail, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getErrorStatus } from '@/utils/errorUtils';
import api from '@/lib/api';

interface Location {
  id?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  businessHours?: string;
  services?: string;
  coordinates?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isPrimary: boolean;
}

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
  onSuccess?: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({ 
  isOpen, 
  onClose, 
  location = null,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Location>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    businessHours: '',
    services: '',
    coordinates: '',
    description: '',
    imageUrl: '',
    isActive: true,
    isPrimary: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const isEditing = location && location.id;

  useEffect(() => {
    if (location && isEditing) {
      setFormData(location);
    } else {
      // Reset form for new location
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        phone: '',
        email: '',
        businessHours: '',
        services: '',
        coordinates: '',
        description: '',
        imageUrl: '',
        isActive: true,
        isPrimary: false
      });
    }
    setErrors({});
    setSuccess(false);
  }, [location, isEditing, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before submitting',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        // Parse JSON strings if they exist
        services: formData.services ? JSON.parse(formData.services) : null,
        coordinates: formData.coordinates ? JSON.parse(formData.coordinates) : null
      };

      console.log('Submitting location data:', submitData);
      let response;
      if (isEditing) {
        response = await api.put(`/locations/${location.id}`, submitData);
      } else {
        response = await api.post('/locations', submitData);
      }
      console.log('Location submission response:', response.data);

      toast({
        title: isEditing ? 'Location Updated!' : 'Location Created!',
        description: response.data.message || 'Location saved successfully.'
      });

      setSuccess(true);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close form after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (error: unknown) {
      console.error('Error saving location:', error);
      
      let errorMessage = isEditing ? 'Failed to update location' : 'Failed to create location';
      
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data && typeof error.response.data.error === 'string') {
        errorMessage = error.response.data.error;
      } else if (getErrorStatus(error) === 400) {
        errorMessage = 'Please check your input and try again.';
      } else if (getErrorStatus(error) === 404) {
        errorMessage = 'Location not found.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-[#376F6B]" />
            <h2 className="text-2xl font-bold text-[#376F6B]">
              {success ? 'Success!' : (isEditing ? 'Edit Location' : 'Add New Location')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isEditing ? 'Location Updated!' : 'Location Created!'}
              </h3>
              <p className="text-gray-600">
                {isEditing ? 'Your location has been updated successfully.' : 'Your new location has been added successfully.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#376F6B] flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  {/* Location Name */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Location Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="e.g., Main Street Pharmacy"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State *
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-1 ${errors.state ? 'border-red-500' : ''}`}
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                        ZIP Code *
                      </Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`mt-1 ${errors.zipCode ? 'border-red-500' : ''}`}
                        placeholder="12345"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Hours */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#376F6B] flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact & Hours
                  </h3>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="mymedspharmacy@outlook.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Business Hours */}
                  <div>
                    <Label htmlFor="businessHours" className="text-sm font-medium text-gray-700">
                      Business Hours
                    </Label>
                    <Textarea
                      id="businessHours"
                      name="businessHours"
                      value={formData.businessHours}
                      onChange={handleChange}
                      className="mt-1 min-h-[80px]"
                      placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 9:00 AM - 4:00 PM&#10;Sunday: Closed"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#376F6B] flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Services */}
                  <div>
                    <Label htmlFor="services" className="text-sm font-medium text-gray-700">
                      Services (JSON format)
                    </Label>
                    <Textarea
                      id="services"
                      name="services"
                      value={formData.services}
                      onChange={handleChange}
                      className="mt-1 min-h-[100px] font-mono text-sm"
                      placeholder='["Prescription Filling", "Consultation", "Health Screenings"]'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter services as a JSON array of strings
                    </p>
                  </div>

                  {/* Coordinates */}
                  <div>
                    <Label htmlFor="coordinates" className="text-sm font-medium text-gray-700">
                      Coordinates (JSON format)
                    </Label>
                    <Textarea
                      id="coordinates"
                      name="coordinates"
                      value={formData.coordinates}
                      onChange={handleChange}
                      className="mt-1 min-h-[100px] font-mono text-sm"
                      placeholder='{"lat": 40.7128, "lng": -74.0060}'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter latitude and longitude as JSON
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 min-h-[100px]"
                    placeholder="Brief description of this location..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className={`mt-1 ${errors.imageUrl ? 'border-red-500' : ''}`}
                    placeholder="https://example.com/location-image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-[#376F6B] flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Settings
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active Location
                    </Label>
                    <p className="text-xs text-gray-500">
                      Location is operational and accepting customers
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                      Primary Location
                    </Label>
                    <p className="text-xs text-gray-500">
                      Set as the main/default location for the business
                    </p>
                  </div>
                  <Switch
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onCheckedChange={(checked) => handleSwitchChange('isPrimary', checked)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#376F6B] hover:bg-[#2e5d59] text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditing ? 'Update Location' : 'Create Location'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationForm;

