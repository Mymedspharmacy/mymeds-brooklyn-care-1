import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Clock, Tag } from 'lucide-react';
import { wordPressAPI } from '@/lib/wordpress';

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

        // Try to fetch from WordPress first
        if (import.meta.env.VITE_WORDPRESS_URL) {
          const postData = await wordPressAPI.getPost(parseInt(id));
          if (postData) {
            setPost(postData);

            // Fetch author
            if (postData.author) {
              try {
                const authorData = await wordPressAPI.getAuthor(postData.author);
                setAuthor(authorData);
              } catch (err) {
                console.warn('Could not fetch author:', err);
              }
            }

            // Fetch categories
            if (postData.categories.length > 0) {
              try {
                const categoriesData = await wordPressAPI.getCategories();
                const postCategories = categoriesData.filter((cat: Category) => 
                  postData.categories.includes(cat.id)
                );
                setCategories(postCategories);
              } catch (err) {
                console.warn('Could not fetch categories:', err);
              }
            }

            // Fetch tags
            if (postData.tags.length > 0) {
              try {
                const tagsData = await wordPressAPI.getTags();
                const postTags = tagsData.filter((tag: Tag) => 
                  postData.tags.includes(tag.id)
                );
                setTags(postTags);
              } catch (err) {
                console.warn('Could not fetch tags:', err);
              }
            }
          } else {
            setError('Post not found');
          }
        } else {
          if (import.meta.env.MODE !== 'production') {
            // Only use mock data in non-production
            const mockListResp = await fetch('/api/mock-blog/');
            const mockList = await mockListResp.json();
            const mockPost = mockList.find((p: any) => p.slug === slug);
            if (mockPost) {
              setPost({
                id: mockPost.id,
                title: { rendered: mockPost.title },
                content: { rendered: mockPost.content },
                excerpt: { rendered: mockPost.excerpt },
                date: mockPost.createdAt,
                author: 1,
                categories: mockPost.categories || [],
                tags: mockPost.tags || [],
                featured_media: 0,
                slug: mockPost.slug
              });
              setAuthor({ id: 1, name: mockPost.author, slug: 'author' });
            } else {
              setError('Post not found');
            }
          } else {
            // In production, do not use mock data
            setError('Post not found');
          }
        }
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content: string) => {
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
        <Header />
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
        <Header />
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
      <Header />
      
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
                {stripHtml(post.title.rendered)}
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
                  <span>{getReadTime(post.content.rendered)}</span>
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
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
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
