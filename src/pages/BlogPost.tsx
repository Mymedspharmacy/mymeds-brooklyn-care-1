import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeContentRenderer } from '@/components/SafeImageRenderer';
import { SEOHead } from '@/components/SEOHead';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useFormHandlers } from '@/hooks/useFormHandlers';
import { RefillForm } from '@/components/RefillForm';
import { AppointmentForm } from '@/components/AppointmentForm';
import { TransferForm } from '@/components/TransferForm';
import api from '@/lib/api';

interface BlogPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  author: number;
  categories: number[];
  tags: number[];
  featured_media: number;
  slug: string;
  link: string;
}

interface Author {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls: { [key: string]: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    showRefillForm,
    showAppointmentForm,
    showTransferForm,
    onRefillClick,
    onAppointmentClick,
    onTransferClick,
    closeRefillForm,
    closeAppointmentForm,
    closeTransferForm
  } = useFormHandlers();

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/wordpress/posts/${id}`);
      const postData = response.data.post || response.data;
      
      if (!postData) {
        throw new Error('Post not found');
      }
      
      setPost(postData);
      
      // Set default author (no API call needed)
      setAuthor({ 
        id: 1, 
        name: 'Admin', 
        slug: 'admin',
        description: 'Health & Wellness Expert',
        avatar_urls: {}
      });
      
      // Set empty categories (no API call needed)
      setCategories([]);
      
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-10 w-32" />
              </div>
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <Skeleton className="h-12 w-full mb-6" />
                  <div className="flex items-center space-x-4 mb-8">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/blog')}
                  className="text-[#57BBB6] hover:text-[#376F6B] hover:bg-[#57BBB6]/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </div>
              <Card className="shadow-xl">
                <CardContent className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h1>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button onClick={() => navigate('/blog')} className="bg-[#57BBB6] hover:bg-[#376F6B] text-white">
                    Return to Blog
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${stripHtml(post.title?.rendered || 'Blog Post')} - My Meds Pharmacy Blog`}
        description={stripHtml(post.excerpt?.rendered || 'Read our latest health and wellness insights')}
        keywords={categories.map(cat => cat.name).join(', ')}
      />
      
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
        
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/blog')}
                className="text-[#57BBB6] hover:text-[#376F6B] hover:bg-[#57BBB6]/10 transition-all duration-300 px-6 py-3 text-lg font-medium rounded-full border border-[#57BBB6]/20 hover:border-[#57BBB6]/40 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Blog
              </Button>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#57BBB6] via-[#57BBB6] to-[#376F6B] mb-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>
              
              <div className="relative z-10 p-12 text-center">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                    {post.title?.rendered || 'Untitled'}
                  </h1>
                  <div className="flex items-center justify-center space-x-6 text-white/90">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg">{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span className="text-lg">{author?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-lg">{getReadingTime(post.content?.rendered || '')} min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl overflow-hidden border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-0">
                  {/* Content Section */}
                  <div className="p-12">
                    {post.content?.rendered ? (
                      <div className="prose prose-xl max-w-none prose-headings:text-[#376F6B] prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg prose-strong:text-[#57BBB6] prose-a:text-[#57BBB6] prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-lg prose-blockquote:border-l-[#57BBB6] prose-blockquote:bg-[#57BBB6]/5 prose-blockquote:p-6 prose-blockquote:rounded-r-lg">
                        <SafeContentRenderer content={post.content.rendered} />
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-gray-500 mb-8">
                          <svg className="w-20 h-20 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-4">Content Not Available</h3>
                        <p className="text-gray-500 mb-8 text-lg">This blog post content is currently unavailable.</p>
                        <Button 
                          onClick={fetchPost} 
                          className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#57BBB6] via-[#57BBB6] to-[#376F6B] p-12 shadow-2xl">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-18c9.941 0 18 8.059 18 18s-8.059 18-18 18-18-8.059-18-18 8.059-18 18-18z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-4">Enjoyed this article?</h3>
                  <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                    Stay connected with My Meds Pharmacy for more health tips, wellness insights, and pharmacy services.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      className="bg-white text-[#57BBB6] hover:bg-white/90 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Like this Post
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-[#57BBB6] px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share Article
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-[#57BBB6] px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Leave Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Services */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-[#376F6B] mb-4">Need Pharmacy Services?</h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Explore our comprehensive pharmacy services and get the care you deserve.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-[#57BBB6]/5">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-[#376F6B] mb-3">Prescription Refills</h4>
                    <p className="text-gray-600 mb-6">Quick and convenient prescription refills with same-day pickup available.</p>
                    <Button 
                      onClick={onRefillClick}
                      className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-6 py-2 rounded-full transition-all duration-300"
                    >
                      Refill Now
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-[#57BBB6]/5">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-[#376F6B] mb-3">Transfer Prescriptions</h4>
                    <p className="text-gray-600 mb-6">Seamlessly transfer your prescriptions to My Meds Pharmacy.</p>
                    <Button 
                      onClick={onTransferClick}
                      className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-6 py-2 rounded-full transition-all duration-300"
                    >
                      Transfer Now
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-[#57BBB6]/5">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 7l4 4m0 0l4-4m-4 4V7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-[#376F6B] mb-3">Book Appointment</h4>
                    <p className="text-gray-600 mb-6">Schedule consultations with our pharmacists and healthcare professionals.</p>
                    <Button 
                      onClick={onAppointmentClick}
                      className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-6 py-2 rounded-full transition-all duration-300"
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Forms */}
      <RefillForm isOpen={showRefillForm} onClose={closeRefillForm} />
      <AppointmentForm isOpen={showAppointmentForm} onClose={closeAppointmentForm} />
      <TransferForm isOpen={showTransferForm} onClose={closeTransferForm} />
    </>
  );
};

export default BlogPost;