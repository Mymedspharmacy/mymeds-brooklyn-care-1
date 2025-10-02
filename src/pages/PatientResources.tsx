import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Calculator, FileText, Heart, Shield, Clock, AlertTriangle, Download, ExternalLink, Search, BookOpen, Users, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HIPAACompliance } from '@/components/HIPAACompliance';
import { SEOHead } from '@/components/SEOHead';
import BMICalculator from '@/components/calculators/BMICalculator';
import BloodPressureTracker from '@/components/calculators/BloodPressureTracker';
import MedicationTimingCalculator from '@/components/calculators/MedicationTimingCalculator';
import DosageCalculator from '@/components/calculators/DosageCalculator';
import api from '@/lib/api';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  slug: string;
  link: string;
  featured_media?: {
    source_url: string;
    alt_text: string;
  };
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

const PatientResources = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useScrollToTop();

  const healthCalculators = [
    {
      id: 'bmi',
      title: 'BMI Calculator',
      description: 'Calculate your Body Mass Index',
      icon: Calculator,
      category: 'Health Metrics'
    },
    {
      id: 'blood-pressure',
      title: 'Blood Pressure Tracker',
      description: 'Monitor your blood pressure readings',
      icon: Heart,
      category: 'Health Metrics'
    },
    {
      id: 'medication-timing',
      title: 'Medication Timing',
      description: 'Schedule your medications properly',
      icon: Clock,
      category: 'Medication Management'
    },
    {
      id: 'dosage-calculator',
      title: 'Dosage Calculator',
      description: 'Calculate medication dosages',
      icon: Pill,
      category: 'Medication Management'
    }
  ];

  const medicationGuides = [
    {
      id: 'diabetes',
      title: 'Diabetes Management',
      description: 'Complete guide to diabetes medications and management',
      icon: Heart,
      category: 'Chronic Conditions',
      pdfUrl: '/resources/diabetes-guide.pdf'
    },
    {
      id: 'hypertension',
      title: 'Hypertension Treatment',
      description: 'Understanding blood pressure medications',
      icon: Heart,
      category: 'Chronic Conditions',
      pdfUrl: '/resources/hypertension-guide.pdf'
    },
    {
      id: 'antibiotics',
      title: 'Antibiotic Safety',
      description: 'Proper use and safety of antibiotics',
      icon: Pill,
      category: 'Medication Safety',
      pdfUrl: '/resources/antibiotic-safety.pdf'
    },
    {
      id: 'pain-management',
      title: 'Pain Management',
      description: 'Safe use of pain medications',
      icon: Pill,
      category: 'Medication Safety',
      pdfUrl: '/resources/pain-management.pdf'
    }
  ];

  // Fetch blog posts from WordPress
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/wordpress/posts?per_page=20');
        setBlogPosts(response.data.posts || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load health articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // No fallback articles needed - we now have real blog posts

  // Transform blog posts to match the expected format
  const transformBlogPostToArticle = (post: BlogPost) => ({
    id: post.id.toString(),
    title: post.title,
    description: post.excerpt.replace(/<[^>]*>/g, ''), // Strip HTML tags
    category: post.categories?.[0]?.name || 'Health Education',
    readTime: '5 min read', // Default read time
    date: post.date,
    link: post.link,
    excerpt: post.excerpt,
    featured_media: post.featured_media
  });

  // Use blog posts (now we always have them)
  const healthArticles = blogPosts.map(transformBlogPostToArticle);

  const emergencyInfo = [
    {
      title: 'Poison Control',
      phone: '1-800-222-1222',
              description: 'Dawn to Dusk emergency poison information'
    },
    {
      title: 'Emergency Services',
      phone: '911',
      description: 'For life-threatening emergencies'
    },
    {
      title: 'Pharmacy Emergency',
      phone: '(347) 312-6458',
      description: 'After-hours pharmacy consultation'
    }
  ];

  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);

  const handleCalculatorClick = (calculatorId: string) => {
    setSelectedCalculator(calculatorId);
  };

  const renderCalculator = () => {
    switch (selectedCalculator) {
      case 'bmi':
        return <BMICalculator />;
      case 'blood-pressure':
        return <BloodPressureTracker />;
      case 'medication-timing':
        return <MedicationTimingCalculator />;
      case 'dosage-calculator':
        return <DosageCalculator />;
      default:
        return null;
    }
  };

  const handleDownloadGuide = (pdfUrl: string) => {
    // Trigger download
    window.open(pdfUrl, '_blank');
  };

  const handleReadArticle = (article: any) => {
    if (article.link && article.link !== '#') {
      // Open blog post in new tab
      window.open(article.link, '_blank');
    } else {
      // Navigate to blog page for all articles
      navigate('/blog');
    }
  };

  const filteredCalculators = healthCalculators.filter(calc =>
    calc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuides = medicationGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArticles = healthArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEOHead 
        title="Patient Resources - My Meds Pharmacy"
        description="Access health calculators, medication guides, educational articles, and patient resources. Your trusted source for pharmaceutical information and health education."
        keywords="patient resources, health calculators, medication guides, health education, pharmaceutical information, medication safety, health articles"
      />
      
      <div className="min-h-screen bg-[#D5C6BC]">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-brand-light/20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button 
                onClick={() => navigate(-1)}
                variant="ghost"
                className="flex items-center gap-2 text-brand hover:text-brand-light hover:bg-brand-light/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <HIPAACompliance variant="badge" />
            </div>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-brand mb-4">Patient Resources</h1>
              <p className="text-lg text-brand-light max-w-3xl mx-auto">
                Your comprehensive source for health information, medication guides, calculators, and educational resources. 
                Everything you need to make informed decisions about your health.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Tabs defaultValue="calculators" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="calculators" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculators
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medication Guides
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Health Articles
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Info
              </TabsTrigger>
            </TabsList>

            {/* Health Calculators */}
            <TabsContent value="calculators" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Health Calculators</h2>
                  <p className="text-gray-600">Tools to help you track and manage your health metrics</p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCalculators.map((calculator) => (
                  <Dialog key={calculator.id} onOpenChange={(open) => {
                    if (open) {
                      setSelectedCalculator(calculator.id);
                    } else {
                      setSelectedCalculator(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <calculator.icon className="h-6 w-6 text-white" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {calculator.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{calculator.title}</CardTitle>
                          <CardDescription>{calculator.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full" variant="outline">
                            Open Calculator
                          </Button>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{calculator.title}</DialogTitle>
                      </DialogHeader>
                      {renderCalculator()}
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </TabsContent>

            {/* Medication Guides */}
            <TabsContent value="guides" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Medication Guides</h2>
                <p className="text-gray-600">Comprehensive guides for understanding your medications</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGuides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center">
                          <guide.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {guide.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={() => handleDownloadGuide(guide.pdfUrl)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Guide
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Health Articles */}
            <TabsContent value="articles" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Health Articles</h2>
      <p className="text-gray-600">
        Latest health articles from our blog ({blogPosts.length} articles)
      </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading health articles...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Articles Grid */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{article.readTime}</span>
                            {article.date && (
                              <span className="text-xs text-gray-400">
                                {new Date(article.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {article.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={() => handleReadArticle(article)}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Read Article
                          </Button>
                          {article.link && article.link !== '#' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(article.link, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* No Articles State */}
              {!loading && !error && filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600">
                    No articles match "{searchTerm}". Try a different search term.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Emergency Information */}
            <TabsContent value="emergency" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Information</h2>
                <p className="text-gray-600">Important contact information for emergencies</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {emergencyInfo.map((info, index) => (
                  <Card key={index} className="border-white bg-red-50/50">
                    <CardHeader>
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Phone className="h-6 w-6 text-red-600" />
                      </div>
                      <CardTitle className="text-lg text-red-800">{info.title}</CardTitle>
                      <CardDescription className="text-red-700">{info.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => window.open(`tel:${info.phone}`)}>
                        <Phone className="h-4 w-4 mr-2" />
                        {info.phone}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Emergency Resources */}
              <Card className="border-white bg-orange-50/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-orange-800">Urgent Care</CardTitle>
                  <CardDescription className="text-orange-700">
                    For non-life-threatening conditions that need immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => window.open('tel:3473126458')}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call (347) 312-6458
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Information */}
          <Card className="mt-12 border-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Need Help?</CardTitle>
              <CardDescription className="text-center">
                Our pharmacy team is here to help with any questions about your medications or health.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="w-full" onClick={() => window.open('tel:3473126458')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.open('/contact', '_blank')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PatientResources;
