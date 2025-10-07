import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Calendar, User, Clock, Tag, Share2, BookOpen, Heart, MessageCircle, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { wordPressAPI } from '@/lib/wordpress';
import { SafeContentRenderer } from '@/components/SafeImageRenderer';
import { SEOHead } from '@/components/SEOHead';
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
}

interface Author {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

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

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch real post from backend API
        const [postResponse, relatedResponse] = await Promise.all([
          api.get(`/wordpress/posts/${id}`),
          api.get(`/wordpress/posts?per_page=3&exclude=${id}`)
        ]);
        
        const postData = postResponse.data.post || postResponse.data; // Backend returns { post: ... }
        const relatedData = relatedResponse.data.posts || relatedResponse.data || [];
        
        console.log('BlogPost API Response:', postResponse.data);
        console.log('Post Data:', postData);
        console.log('Related Posts:', relatedData);
          
        if (postData) {
          setPost(postData);
          setRelatedPosts(relatedData.slice(0, 3)); // Show up to 3 related posts

          // Set author information - handle both string and object formats
          if (postData.author) {
            if (typeof postData.author === 'string') {
              setAuthor({ id: 1, name: postData.author, slug: 'admin' });
            } else if (typeof postData.author === 'number') {
              setAuthor({ id: postData.author, name: 'Admin', slug: 'admin' });
            }
          }

          // Set categories - handle both array and object formats
          if (postData.categories) {
            if (Array.isArray(postData.categories)) {
              setCategories(postData.categories);
            } else if (postData.categories.length > 0) {
              setCategories([postData.categories]);
            }
          }

          // Set tags - handle both array and object formats
          if (postData.tags) {
            if (Array.isArray(postData.tags)) {
              setTags(postData.tags);
            } else if (postData.tags.length > 0) {
              setTags([postData.tags]);
            }
          }
        } else {
          setError('Post not found');
        }
      } catch (apiError) {
        console.error('Error fetching post from API:', apiError);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content: string | undefined) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/patient-portal')}
          onAppointmentClick={() => navigate('/contact')}
          onTransferClick={() => navigate('/contact')}
        />
        <div className="">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
                <div className="h-64 bg-gray-300 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
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
          onRefillClick={() => navigate('/patient-portal')}
          onAppointmentClick={() => navigate('/contact')}
          onTransferClick={() => navigate('/contact')}
        />
        <div className="">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h1>
              <p className="text-gray-600 mb-8">{error || 'The requested blog post could not be found.'}</p>
              <Button onClick={() => navigate('/blog')} className="bg-[#57BBB6] hover:bg-[#376F6B]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
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
        keywords={tags.map(tag => tag.name).join(', ')}
      />
      
      <div className="min-h-screen bg-white">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
        
        <div className="pt-20">
          {/* Hero Section */}
          <div className="bg-[#57BBB6] text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                {/* Back Button */}
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/blog')}
                  className="mb-8 text-white hover:text-white hover:bg-white/20 rounded-xl px-6 py-3 text-lg font-semibold transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Back to Blog
                </Button>

                {/* Post Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                  {stripHtml(post.title?.rendered || 'Untitled Post')}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-lg mb-8">
                  {author && (
                    <div className="flex items-center gap-3 bg-white/20 rounded-full px-6 py-3">
                      <User className="h-5 w-5" />
                      <span className="font-semibold">{author.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-white/20 rounded-full px-6 py-3">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 rounded-full px-6 py-3">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">{getReadTime(post.content?.rendered)}</span>
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                      <Badge key={category.id} className="bg-white text-[#57BBB6] hover:bg-white/90 px-4 py-2 text-sm font-semibold">
                        <Tag className="h-4 w-4 mr-2" />
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Article Content */}
                <div className="lg:col-span-3">
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-8 lg:p-12">
                      {/* Article Content */}
                      <div className="prose prose-lg max-w-none">
                        <SafeContentRenderer content={post.content?.rendered || ''} />
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tags</h3>
                          <div className="flex flex-wrap gap-3">
                            {tags.map((tag) => (
                              <Badge key={tag.id} variant="outline" className="px-4 py-2 text-sm">
                                <Tag className="h-4 w-4 mr-2" />
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Share Section */}
                      <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Share this article</h3>
                        <div className="flex gap-4">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Facebook className="h-4 w-4" />
                            Facebook
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-8">
                    {/* Author Card */}
                    {author && (
                      <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-[#57BBB6] rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{author.name}</h3>
                            <p className="text-gray-600 text-sm">Health & Wellness Expert</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                      <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-6">Related Articles</h3>
                          <div className="space-y-4">
                            {relatedPosts.map((relatedPost) => (
                              <div key={relatedPost.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                  {stripHtml(relatedPost.title?.rendered || 'Untitled')}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {formatDate(relatedPost.date)}
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/blog/${relatedPost.id}`)}
                                  className="text-[#57BBB6] hover:text-[#376F6B] p-0 h-auto"
                                >
                                  Read More <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Newsletter Signup */}
                    <Card className="shadow-lg border-0 bg-[#57BBB6] text-white">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
                          <p className="text-white/90 text-sm mb-4">
                            Get the latest health tips and pharmacy news delivered to your inbox.
                          </p>
                          <Button 
                            variant="secondary" 
                            className="w-full bg-white text-[#57BBB6] hover:bg-gray-100"
                            onClick={() => navigate('/blog')}
                          >
                            Subscribe Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
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