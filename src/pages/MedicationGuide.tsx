import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Pill, Loader2, AlertTriangle, BookOpen, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SEOHead } from '@/components/SEOHead';
import api from '@/lib/api';

interface MedicationGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  content: string;
  lastUpdated: string;
  tags?: string[];
  relatedMedications?: string[];
  warnings?: string[];
  dosage?: string;
  sideEffects?: string[];
  interactions?: string[];
}

const MedicationGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<MedicationGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/medication-guides/${id}`);
        if (response.data.success && response.data.guide) {
          setGuide(response.data.guide);
        } else {
          setError('Guide not found');
        }
      } catch (err) {
        console.error('Error fetching medication guide:', err);
        setError('Failed to load medication guide. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id]);

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-medium text-gray-700 mb-3 mt-4">{line.substring(4)}</h3>;
      } else if (line.startsWith('- **')) {
        const parts = line.substring(2).split('**: ');
        return (
          <li key={index} className="mb-2">
            <strong>{parts[0]}</strong>: {parts[1]}
          </li>
        );
      } else if (line.startsWith('- ')) {
        return <li key={index} className="mb-2">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{line}</p>;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading medication guide...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-[#D5C6BC] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested medication guide could not be found.'}</p>
          <Button onClick={() => navigate('/patient-resources')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient Resources
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = guide.icon === 'Heart' ? Heart : Pill;

  return (
    <>
      <SEOHead 
        title={`${guide.title} - Medication Guide | My Meds Pharmacy`}
        description={guide.description}
        keywords={guide.tags?.join(', ') || guide.category}
      />
      
      <div className="min-h-screen bg-[#D5C6BC]">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-brand-light/20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button 
                onClick={() => navigate('/patient-resources')}
                variant="ghost"
                className="flex items-center gap-2 text-brand hover:text-brand-light hover:bg-brand-light/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Patient Resources
              </Button>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center mr-4">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <Badge variant="secondary" className="mb-2">
                    {guide.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last updated: {new Date(guide.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-brand mb-4">
                {guide.title}
              </h1>
              <p className="text-lg text-brand-light max-w-3xl mx-auto">
                {guide.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Guide Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    {formatContent(guide.content)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guide.dosage && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dosage</h4>
                      <p className="text-sm text-gray-600">{guide.dosage}</p>
                    </div>
                  )}
                  
                  {guide.tags && guide.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {guide.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Warnings */}
              {guide.warnings && guide.warnings.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <h4 className="font-semibold text-red-800 mb-2">Important Warnings</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      {guide.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Side Effects */}
              {guide.sideEffects && guide.sideEffects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Common Side Effects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {guide.sideEffects.map((effect, index) => (
                        <li key={index}>• {effect}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Drug Interactions */}
              {guide.interactions && guide.interactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Drug Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {guide.interactions.map((interaction, index) => (
                        <li key={index}>• {interaction}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Related Medications */}
              {guide.relatedMedications && guide.relatedMedications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {guide.relatedMedications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicationGuide;
