import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Calendar, FileText, Heart, Shield, Clock, User, Settings, Bell, MessageCircle, Download, Eye, Edit, Plus, Phone, Mail, MapPin, CreditCard, History, Star, AlertTriangle } from 'lucide-react';
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
    setActiveTab('prescriptions');
  };

  const handleScheduleAppointment = () => {
    setActiveTab('appointments');
  };

  const handleSendMessage = () => {
    setActiveTab('messages');
  };

  const handleDownloadRecords = () => {
    // This would trigger a download of health records
    console.log('Downloading health records...');
  };

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
      fetchPrescriptions();
      fetchAppointments();
      fetchHealthRecords();
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll use a simple login
      // In production, this would validate against the backend
      const email = (document.getElementById('email') as HTMLInputElement)?.value;
      const password = (document.getElementById('password') as HTMLInputElement)?.value;
      
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      
      // For now, accept any login for demo
      // In production, this would be a real API call
      localStorage.setItem('token', 'demo-token');
      setIsLoggedIn(true);
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setPrescriptions([]);
    setAppointments([]);
    setHealthRecords([]);
    setDashboardData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'refill-needed': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'abnormal': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <SEOHead 
          title="Patient Portal - My Meds Pharmacy"
          description="Access your prescription history, schedule appointments, view health records, and communicate with our pharmacy team securely."
          keywords="patient portal, prescription management, health records, appointment scheduling, pharmacy login"
        />
        
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-light/30 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Patient Portal</CardTitle>
              <CardDescription>
                Secure access to your pharmacy records and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <HIPAACompliance variant="card" showDetails={true} />
              
              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" />
                </div>
                <Button onClick={handleLogin} className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>

              <div className="text-center space-y-2">
                <Button variant="link" className="text-sm">
                  Forgot Password?
                </Button>
                <div className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Contact us to register
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 text-center">
                  By signing in, you agree to our privacy policy and terms of service.
                  Your health information is protected under HIPAA regulations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Patient Portal - My Meds Pharmacy"
        description="Access your prescription history, schedule appointments, view health records, and communicate with our pharmacy team securely."
        keywords="patient portal, prescription management, health records, appointment scheduling, pharmacy login"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-light/30">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-brand-light/20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  className="flex items-center gap-2 text-brand hover:text-brand-light hover:bg-brand-light/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                  <p className="text-gray-600">Welcome back, {user?.name || 'Patient'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <HIPAACompliance variant="badge" />
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="health-records" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Health Records
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                    <Pill className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats?.activePrescriptions || prescriptions.filter(p => p.status === 'active').length}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.stats?.pendingRefills || prescriptions.filter(p => p.status === 'refill-needed').length} need refills
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats?.upcomingAppointments || appointments.filter(a => a.status === 'scheduled').length}</div>
                    <p className="text-xs text-muted-foreground">
                      Next: {appointments[0]?.date || 'No upcoming appointments'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Health Records</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthRecords.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {healthRecords.filter(r => r.status === 'normal').length} normal results
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4" onClick={handleRequestRefill}>
                      <Plus className="h-6 w-6" />
                      <span>Request Refill</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4" onClick={handleScheduleAppointment}>
                      <Calendar className="h-6 w-6" />
                      <span>Schedule Appointment</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4" onClick={handleSendMessage}>
                      <MessageCircle className="h-6 w-6" />
                      <span>Send Message</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4" onClick={handleDownloadRecords}>
                      <Download className="h-6 w-6" />
                      <span>Download Records</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Prescription refill requested</p>
                        <p className="text-xs text-gray-500">Lisinopril 10mg - 2 hours ago</p>
                      </div>
                      <Badge variant="secondary">Processing</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Appointment scheduled</p>
                        <p className="text-xs text-gray-500">Medication Review - Feb 20, 2024</p>
                      </div>
                      <Badge variant="secondary">Confirmed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Prescriptions</h2>
                <Button>
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
                            {prescription.dosage} • {prescription.frequency} • Prescribed by {prescription.prescriber}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status.replace('-', ' ')}
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
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {prescription.status === 'refill-needed' && (
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Refill
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Appointments</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                      <DialogDescription>
                        Book an appointment with our pharmacy team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Appointment Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medication-review">Medication Review</SelectItem>
                            <SelectItem value="immunization">Immunization</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="health-screening">Health Screening</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Preferred Date</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Preferred Time</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea placeholder="Any specific concerns or questions..." />
                      </div>
                      <Button className="w-full">Schedule Appointment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                <Button variant="outline">
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
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Messages</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Message</DialogTitle>
                      <DialogDescription>
                        Send a secure message to our pharmacy team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Subject</Label>
                        <Input placeholder="Message subject" />
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea placeholder="Type your message here..." rows={4} />
                      </div>
                      <Button className="w-full">Send Message</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Send a message to our pharmacy team for any questions or concerns.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PatientPortal;
