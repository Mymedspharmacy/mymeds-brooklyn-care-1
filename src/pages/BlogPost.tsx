import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Clock, Tag } from 'lucide-react';
import { wordPressAPI } from '@/lib/wordpress';
import { SafeContentRenderer } from '@/components/SafeImageRenderer';
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

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch real post from backend API
        const response = await api.get(`/wordpress/posts/${id}`);
        const postData = response.data.post || response.data; // Backend returns { post: ... }
        
        console.log('BlogPost API Response:', response.data);
        console.log('Post Data:', postData);
          
        if (postData) {
          setPost(postData);

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
        
        // If API fails, try to provide a fallback post
        const fallbackPost = {
          id: parseInt(id),
          title: { rendered: 'Sample Blog Post' },
          content: { rendered: '<p>This is a sample blog post. The WordPress integration is not currently configured, but you can still view this example content.</p><p>To enable real WordPress blog posts, please configure the WordPress settings in the admin panel.</p>' },
          excerpt: { rendered: 'Sample blog post content' },
          date: new Date().toISOString(),
          modified: new Date().toISOString(),
          slug: 'sample-post',
          link: '/blog/sample-post',
          author: 1,
          categories: [1],
          tags: [1],
          featured_media: 0
        };
        
        setPost(fallbackPost);
        setAuthor({ id: 1, name: 'Admin', slug: 'admin' });
        setCategories([{ id: 1, name: 'General', slug: 'general' }]);
        setTags([{ id: 1, name: 'Sample', slug: 'sample' }]);
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
        <div className="pt-20">
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
        <div className="pt-20">
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
    <div className="min-h-screen bg-gradient-to-br from-[#D5C6BC] via-[#F1EEE9] to-[#E8F4F3]">
      <Header 
        onRefillClick={() => navigate('/patient-portal')}
        onAppointmentClick={() => navigate('/contact')}
        onTransferClick={() => navigate('/contact')}
      />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Enhanced Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-12 text-[#57BBB6] hover:text-[#376F6B] hover:bg-[#57BBB6]/10 rounded-xl px-6 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Back to Blog
            </Button>

            {/* Enhanced Post Header */}
            <div className="mb-12 text-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 mb-8 leading-tight bg-gradient-to-r from-[#376F6B] to-[#57BBB6] bg-clip-text text-transparent">
                  {stripHtml(post.title?.rendered || 'Untitled Post')}
                </h1>
                
                {/* Enhanced Meta Information */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-base text-gray-600 mb-8">
                  {author && (
                    <div className="flex items-center gap-3 bg-[#57BBB6]/10 rounded-full px-4 py-2">
                      <div className="w-8 h-8 bg-[#57BBB6] rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold">{author.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-[#376F6B]/10 rounded-full px-4 py-2">
                    <div className="w-8 h-8 bg-[#376F6B] rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#87E5E0]/20 rounded-full px-4 py-2">
                    <div className="w-8 h-8 bg-[#87E5E0] rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-[#376F6B]" />
                    </div>
                    <span className="font-semibold">{getReadTime(post.content?.rendered)}</span>
                  </div>
                </div>

                {/* Enhanced Categories and Tags */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {categories.map((category) => (
                    <Badge key={category.id} className="bg-[#57BBB6] text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                      {category.name}
                    </Badge>
                  ))}
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="border-2 border-[#57BBB6] text-[#57BBB6] px-4 py-2 text-sm font-semibold">
                      <Tag className="h-4 w-4 mr-2" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Post Content */}
            <Card className="mb-12 shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-12 bg-white/95 backdrop-blur-sm">
                <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed">
                  <SafeContentRenderer 
                    content={post.content?.rendered || 'No content available.'}
                    className="blog-content"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Back to Blog Button */}
            <div className="text-center">
              <Button 
                onClick={() => navigate('/blog')}
                className="bg-gradient-to-r from-[#57BBB6] to-[#376F6B] hover:from-[#376F6B] hover:to-[#57BBB6] text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                Back to All Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;