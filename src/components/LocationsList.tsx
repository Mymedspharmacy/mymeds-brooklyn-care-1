import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Star, Edit, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage, getErrorStatus } from '@/utils/errorUtils';
import api from '@/lib/api';
import LocationForm from './LocationForm';

interface Location {
  id: number;
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
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    appointments: number;
    prescriptions: number;
    users: number;
  };
}

interface LocationsListProps {
  onLocationSelect?: (location: Location) => void;
  showActions?: boolean;
  className?: string;
}

export const LocationsList: React.FC<LocationsListProps> = ({ 
  onLocationSelect, 
  showActions = true,
  className = ""
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching locations from API...');
      const response = await api.get('/locations');
      console.log('Locations API response:', response.data);
      setLocations(response.data.locations || []);
    } catch (err: unknown) {
      console.error('Error fetching locations:', err);
      setError(getErrorMessage(err, 'Failed to fetch locations'));
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowLocationForm(true);
  };

  const handleDelete = async (location: Location) => {
    if (!confirm(`Are you sure you want to delete "${location.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(location.id);
      await api.delete(`/locations/${location.id}`);
      
      toast({
        title: 'Location Deleted',
        description: `${location.name} has been deleted successfully.`
      });
      
      fetchLocations();
    } catch (err: unknown) {
      console.error('Error deleting location:', err);
      
      let errorMessage = 'Failed to delete location';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data && typeof err.response.data.error === 'string') {
        errorMessage = err.response.data.error;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (location: Location) => {
    try {
      await api.patch(`/locations/${location.id}/toggle-active`);
      
      toast({
        title: 'Location Updated',
        description: `${location.name} has been ${location.isActive ? 'deactivated' : 'activated'}.`
      });
      
      fetchLocations();
    } catch (err: unknown) {
      console.error('Error toggling location status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update location status',
        variant: 'destructive'
      });
    }
  };

  const handleSetPrimary = async (location: Location) => {
    try {
      await api.patch(`/locations/${location.id}/set-primary`);
      
      toast({
        title: 'Primary Location Updated',
        description: `${location.name} is now the primary location.`
      });
      
      fetchLocations();
    } catch (err: unknown) {
      console.error('Error setting primary location:', err);
      toast({
        title: 'Error',
        description: 'Failed to set primary location',
        variant: 'destructive'
      });
    }
  };

  const handleFormSuccess = () => {
    setShowLocationForm(false);
    setEditingLocation(null);
    fetchLocations();
  };

  const handleFormClose = () => {
    setShowLocationForm(false);
    setEditingLocation(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#376F6B] mx-auto mb-4" />
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Locations</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchLocations} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Found</h3>
        <p className="text-gray-600 mb-4">Get started by adding your first business location.</p>
        {showActions && (
          <Button 
            onClick={() => setShowLocationForm(true)}
            className="bg-[#376F6B] hover:bg-[#2e5d59] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Location
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showActions && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#376F6B]">Business Locations</h2>
          <Button 
            onClick={() => setShowLocationForm(true)}
            className="bg-[#376F6B] hover:bg-[#2e5d59] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card 
            key={location.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              location.isPrimary ? 'ring-2 ring-[#57BBB6] bg-gradient-to-br from-[#f0f8f8] to-white' : ''
            } ${onLocationSelect ? 'cursor-pointer hover:scale-105' : ''}`}
            onClick={() => onLocationSelect && onLocationSelect(location)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-[#376F6B] flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {location.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {location.address}, {location.city}, {location.state} {location.zipCode}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  {location.isPrimary && (
                    <Badge className="bg-[#57BBB6] text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                  <Badge 
                    variant={location.isActive ? "default" : "secondary"}
                    className={location.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {location.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Contact Information */}
              <div className="space-y-2">
                {location.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{location.phone}</span>
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{location.email}</span>
                  </div>
                )}
                {location.businessHours && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <div className="whitespace-pre-line">{location.businessHours}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {location.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {location.description}
                </p>
              )}

              {/* Statistics */}
              {location._count && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[#376F6B]">
                      {location._count.orders}
                    </div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[#376F6B]">
                      {location._count.appointments}
                    </div>
                    <div className="text-xs text-gray-500">Appointments</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {showActions && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(location);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(location);
                    }}
                    className="flex-1"
                  >
                    {location.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  {!location.isPrimary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(location);
                      }}
                      className="flex-1"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(location);
                    }}
                    disabled={deletingId === location.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === location.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location Form Modal */}
      <LocationForm
        isOpen={showLocationForm}
        onClose={handleFormClose}
        location={editingLocation}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default LocationsList;







