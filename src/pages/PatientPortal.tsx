import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Calendar, FileText, Heart, Shield, Clock, User, Settings, Bell, MessageCircle, Download, Eye, Edit, Plus, Phone, Mail, MapPin, CreditCard, History, Star, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HIPAACompliance } from '@/components/HIPAACompliance';
import { SEOHead } from '@/components/SEOHead';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  refills: number;
  status: 'active' | 'refill-needed' | 'expired';
  lastFilled: string;
  nextRefill: string;
  prescriber: string;
}

interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  provider: string;
  notes?: string;
}

interface HealthRecord {
  id: string;
  type: string;
  date: string;
  provider: string;
  result: string;
  status: 'normal' | 'abnormal' | 'pending';
}

const PatientPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  useScrollToTop();

  // API functions
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/patient/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/patient/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/patient/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const fetchHealthRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/patient/health-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthRecords(data.healthRecords);
      }
    } catch (err) {
      console.error('Error fetching health records:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/patient/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  // Action handlers
  const handleRequestRefill = () => {
    navigate('/', { state: { openRefillForm: true } });
  };

  const handleScheduleAppointment = () => {
    navigate('/', { state: { openAppointmentForm: true } });
  };

  const handleSendMessage = () => {
    // Handle sending message
  };

  const handleDownloadRecords = () => {
    // Handle downloading records
  };

  const handleDownloadAllRecords = () => {
    // Handle downloading all records
  };

  const handleDownloadRecord = (record: any) => {
    // Handle downloading individual record
    console.log(`Downloading record: ${record.id}`);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      setIsLoggedIn(true);
      setUser({
        name: 'John Doe',
        email: 'john.doe@example.com',
        memberSince: '2023-01-15'
      });
      
      // Fetch user data
      await Promise.all([
        fetchUserProfile(),
        fetchPrescriptions(),
        fetchAppointments(),
        fetchHealthRecords(),
        fetchDashboardData()
      ]);
      
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setPrescriptions([]);
    setAppointments([]);
    setHealthRecords([]);
    setDashboardData(null);
    localStorage.removeItem('token');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'normal':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'refill-needed':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'abnormal':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for demo
  useEffect(() => {
    if (isLoggedIn) {
      setPrescriptions([
        {
          id: '1',
          medication: 'Lisinopril 10mg',
          dosage: '10mg',
          frequency: 'Once daily',
          refills: 2,
          status: 'active',
          lastFilled: '2024-01-01',
          nextRefill: '2024-02-01',
          prescriber: 'Dr. Smith'
        },
        {
          id: '2',
          medication: 'Metformin 500mg',
          dosage: '500mg',
          frequency: 'Twice daily',
          refills: 0,
          status: 'refill-needed',
          lastFilled: '2024-01-15',
          nextRefill: '2024-01-15',
          prescriber: 'Dr. Johnson'
        }
      ]);

      setAppointments([
        {
          id: '1',
          type: 'Medication Review',
          date: '2024-02-15',
          time: '10:00 AM',
          status: 'scheduled',
          provider: 'Dr. Chen',
          notes: 'Annual medication review and consultation'
        }
      ]);

      setHealthRecords([
        {
          id: '1',
          type: 'Blood Pressure',
          date: '2024-01-10',
          provider: 'Dr. Smith',
          result: '120/80 mmHg',
          status: 'normal'
        },
        {
          id: '2',
          type: 'Blood Glucose',
          date: '2024-01-10',
          provider: 'Dr. Johnson',
          result: '95 mg/dL',
          status: 'normal'
        }
      ]);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
        
        <div className="pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-md mx-auto">
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#376F6B]">Patient Portal</CardTitle>
                  <CardDescription className="text-[#57BBB6]">
                    Access your health records, manage prescriptions, and schedule appointments
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>
                    
                    {error && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-[#57BBB6]">
                      Enter your credentials to access your patient portal
                    </p>
                    <p className="text-[#57BBB6]">
                      Don't have an account?{' '}
                      <Button 
                        variant="link" 
                        className="text-[#57BBB6] p-0 h-auto"
                        onClick={() => navigate('/patient-account-creation')}
                      >
                        Create one here
                      </Button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
        onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
      />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#376F6B]">Patient Portal</h1>
              <p className="text-[#57BBB6]">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#376F6B]">
                      {prescriptions.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-sm text-[#57BBB6]">Active Prescriptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#376F6B] rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#376F6B]">
                      {appointments.filter(a => a.status === 'scheduled').length}
                    </p>
                    <p className="text-sm text-[#57BBB6]">Upcoming Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#376F6B]">
                      {prescriptions.filter(p => p.status === 'refill-needed').length}
                    </p>
                    <p className="text-sm text-[#57BBB6]">Refills Needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#376F6B] rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#376F6B]">
                      {healthRecords.filter(r => r.status === 'normal').length}
                    </p>
                    <p className="text-sm text-[#57BBB6]">Normal Results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Button 
              onClick={handleRequestRefill}
              className="h-24 bg-[#57BBB6] hover:bg-[#376F6B] text-white text-lg font-semibold"
            >
              <Pill className="h-8 w-8 mr-3" />
              Request Refill
            </Button>
            
            <Button 
              onClick={handleScheduleAppointment}
              className="h-24 bg-[#376F6B] hover:bg-[#57BBB6] text-white text-lg font-semibold"
            >
              <Calendar className="h-8 w-8 mr-3" />
              Schedule Appointment
            </Button>
            
            <Button 
              onClick={handleSendMessage}
              className="h-24 bg-[#57BBB6] hover:bg-[#376F6B] text-white text-lg font-semibold"
            >
              <MessageCircle className="h-8 w-8 mr-3" />
              Send Message
            </Button>
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="health-records">Health Records</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {prescriptions.slice(0, 3).map((prescription) => (
                          <div key={prescription.id} className="flex items-center justify-between p-3 bg-[#57BBB6]/5 rounded-lg">
                            <div>
                              <p className="font-medium">{prescription.medication}</p>
                              <p className="text-sm text-[#57BBB6]">{prescription.dosage}</p>
                            </div>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="p-3 bg-[#57BBB6]/5 rounded-lg">
                            <p className="font-medium">{appointment.type}</p>
                            <p className="text-sm text-[#57BBB6]">
                              {appointment.date} at {appointment.time}
                            </p>
                            <p className="text-sm text-[#57BBB6]">with {appointment.provider}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Prescriptions</h2>
                  <Button onClick={handleRequestRefill}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Refill
                  </Button>
                </div>

                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{prescription.medication}</CardTitle>
                            <CardDescription>
                              {prescription.dosage} • {prescription.frequency}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Refills Remaining</p>
                            <p className="font-medium">{prescription.refills}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Filled</p>
                            <p className="font-medium">{prescription.lastFilled}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Next Refill</p>
                            <p className="font-medium">{prescription.nextRefill}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Prescriber</p>
                            <p className="font-medium">{prescription.prescriber}</p>
                          </div>
                        </div>
                        
                        {prescription.status === 'refill-needed' && (
                          <div className="mt-4">
                            <Button onClick={handleRequestRefill} className="w-full">
                              Request Refill
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Appointments</h2>
                  <Button onClick={handleScheduleAppointment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>

                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{appointment.type}</CardTitle>
                            <CardDescription>
                              {appointment.date} at {appointment.time} with {appointment.provider}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      {appointment.notes && (
                        <CardContent>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Health Records Tab */}
              <TabsContent value="health-records" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Health Records</h2>
                  <Button variant="outline" onClick={() => handleDownloadAllRecords()}>
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="space-y-4">
                  {healthRecords.map((record) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{record.type}</CardTitle>
                            <CardDescription>
                              {record.date} • {record.provider}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Result: {record.result}</p>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadRecord(record)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatientPortal;
