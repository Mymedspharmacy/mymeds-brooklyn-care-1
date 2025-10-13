import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      
      // Fetch author if available
      if (postData.author) {
        try {
          const authorResponse = await api.get(`/wordpress/users/${postData.author}`);
          setAuthor(authorResponse.data);
        } catch (err) {
          console.warn('Could not fetch author:', err);
          // Set default author
          setAuthor({ 
            id: postData.author, 
            name: 'Admin', 
            slug: 'admin',
            description: 'Health & Wellness Expert',
            avatar_urls: {}
          });
        }
      }
      
      // Fetch categories if available
      if (postData.categories && postData.categories.length > 0) {
        try {
          const categoriesResponse = await api.get(`/wordpress/categories?include=${postData.categories.join(',')}`);
          setCategories(categoriesResponse.data);
        } catch (err) {
          console.warn('Could not fetch categories:', err);
        }
      }
      
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
                className="text-[#57BBB6] hover:text-[#376F6B] hover:bg-[#57BBB6]/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </div>

            {/* Main Content */}
            <Card className="shadow-xl overflow-hidden">
              <CardContent className="p-0">
                {/* Header Section */}
                <div className="bg-[#57BBB6] text-white p-8">
                  <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                      {post.title?.rendered || 'Untitled'}
                    </h1>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                  <div className="max-w-3xl mx-auto">
                    {post.content?.rendered ? (
                      <div className="prose prose-lg max-w-none">
                        <SafeContentRenderer content={post.content.rendered} />
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Content Not Available</h3>
                        <p className="text-gray-500 mb-6">This blog post content is currently unavailable.</p>
                        <Button onClick={fetchPost} variant="outline">
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Card className="shadow-lg bg-[#57BBB6] text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
                  <p className="text-white/90 mb-6">Stay updated with our latest health tips and pharmacy news.</p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/blog')}
                    className="bg-white text-[#57BBB6] hover:bg-white/90"
                  >
                    Read More Articles
                  </Button>
                </CardContent>
              </Card>
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