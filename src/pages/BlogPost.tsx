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
        try {
        const response = await api.get(`/wordpress/posts/${id}`);
        const postData = response.data.post || response.data; // Backend returns { post: ... }
          
          if (postData) {
            setPost(postData);

            // Set author information
            if (postData.author) {
              setAuthor({ id: postData.author, name: postData.author || 'Admin', slug: 'admin' });
            }

            // Set categories
            if (postData.categories && postData.categories.length > 0) {
              setCategories(postData.categories);
            }

            // Set tags
            if (postData.tags && postData.tags.length > 0) {
              setTags(postData.tags);
            }
          } else {
            setError('Post not found');
          }
        } catch (apiError) {
          console.error('Error fetching post from API:', apiError);
          setError('Failed to load post');
        }
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
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
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => navigate('/patient-portal')}
        onAppointmentClick={() => navigate('/contact')}
        onTransferClick={() => navigate('/contact')}
      />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-8 text-[#57BBB6] hover:text-[#376F6B] hover:bg-[#57BBB6]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>

            {/* Post Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {stripHtml(post.title?.rendered || 'Untitled Post')}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                {author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{getReadTime(post.content?.rendered)}</span>
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Badge key={category.id} variant="secondary" className="bg-[#57BBB6]/10 text-[#376F6B]">
                    {category.name}
                  </Badge>
                ))}
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="border-[#57BBB6] text-[#57BBB6]">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post Content */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <SafeContentRenderer 
                  content={post.content?.rendered || 'No content available.'}
                  className="prose prose-lg max-w-none text-gray-700"
                />
              </CardContent>
            </Card>

            {/* Back to Blog Button */}
            <div className="text-center">
              <Button 
                onClick={() => navigate('/blog')}
                className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
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