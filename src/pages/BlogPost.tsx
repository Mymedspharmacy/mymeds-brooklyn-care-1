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

        // Check if this is a sample post (IDs 1, 2, 3)
        const postId = parseInt(id);
        if (postId >= 1 && postId <= 3) {
          // Handle sample posts
          const samplePosts = [
            {
              id: 1,
              title: { rendered: "Understanding Medication Safety: A Complete Guide" },
              content: { rendered: "<h2>Introduction</h2><p>Medication safety is crucial for maintaining good health. This comprehensive guide covers everything you need to know about taking medications safely, including proper storage, timing, and interactions.</p><h3>Key Safety Principles</h3><p>Key points include always reading labels carefully, storing medications in appropriate conditions, and consulting with healthcare providers about potential side effects.</p><h3>Storage Guidelines</h3><p>Proper medication storage is essential for maintaining effectiveness and safety. Store medications in a cool, dry place away from direct sunlight and out of reach of children.</p><h3>Timing and Dosage</h3><p>Always follow the prescribed dosage and timing instructions. Never skip doses or double up on medications without consulting your healthcare provider.</p><h3>Drug Interactions</h3><p>Be aware of potential drug interactions and always inform your healthcare provider about all medications, supplements, and over-the-counter drugs you are taking.</p>" },
              excerpt: { rendered: "Learn essential medication safety practices to protect your health and ensure effective treatment." },
              author: 1,
              date: new Date().toISOString(),
              modified: new Date().toISOString(),
              categories: [1],
              tags: [1, 2],
              _embedded: {
                author: [{ name: "Dr. Sarah Johnson" }]
              }
            },
            {
              id: 2,
              title: { rendered: "Managing Chronic Conditions: Tips for Better Health" },
              content: { rendered: "<h2>Understanding Chronic Conditions</h2><p>Living with chronic conditions requires careful management and lifestyle adjustments. This article provides practical tips for managing conditions like diabetes, hypertension, and heart disease.</p><h3>Medication Adherence</h3><p>Consistent medication adherence is crucial for managing chronic conditions. Set up reminders, use pill organizers, and maintain regular communication with your healthcare team.</p><h3>Diet Modifications</h3><p>Diet plays a significant role in managing chronic conditions. Work with a nutritionist to develop a meal plan that supports your health goals and medication effectiveness.</p><h3>Exercise Routines</h3><p>Regular physical activity can help manage symptoms and improve overall health. Start with low-impact exercises and gradually increase intensity under medical supervision.</p><h3>Regular Monitoring</h3><p>Regular monitoring of vital signs and symptoms helps track progress and identify potential issues early. Keep detailed records of your health metrics.</p>" },
              excerpt: { rendered: "Discover effective strategies for managing chronic health conditions and improving your quality of life." },
              author: 1,
              date: new Date(Date.now() - 86400000).toISOString(),
              modified: new Date(Date.now() - 86400000).toISOString(),
              categories: [1],
              tags: [2, 3],
              _embedded: {
                author: [{ name: "Dr. Michael Chen" }]
              }
            },
            {
              id: 3,
              title: { rendered: "The Importance of Regular Health Checkups" },
              content: { rendered: "<h2>Why Regular Checkups Matter</h2><p>Regular health checkups are essential for early detection and prevention of health issues. This guide explains why routine medical examinations are crucial for maintaining good health.</p><h3>Early Detection</h3><p>Regular checkups allow healthcare providers to detect potential health issues before they become serious problems. Early detection often leads to more effective treatment options.</p><h3>Preventive Care</h3><p>Preventive care focuses on maintaining health and preventing disease. Regular screenings, vaccinations, and health assessments are key components of preventive care.</p><h3>What to Expect</h3><p>During a checkup, your healthcare provider will review your medical history, perform a physical examination, and may order laboratory tests or imaging studies based on your age and risk factors.</p><h3>Frequency Guidelines</h3><p>The frequency of checkups depends on your age, health status, and risk factors. Generally, adults should have annual checkups, while those with chronic conditions may need more frequent visits.</p>" },
              excerpt: { rendered: "Learn why regular health checkups are vital for prevention and early detection of health problems." },
              author: 1,
              date: new Date(Date.now() - 172800000).toISOString(),
              modified: new Date(Date.now() - 172800000).toISOString(),
              categories: [1],
              tags: [1, 4],
              _embedded: {
                author: [{ name: "Dr. Emily Rodriguez" }]
              }
            }
          ];

          const samplePost = samplePosts.find(p => p.id === postId);
          if (samplePost) {
            setPost(samplePost);
            setAuthor({ id: 1, name: samplePost._embedded.author[0].name, slug: 'sample-author' });
            setCategories([{ id: 1, name: 'Health & Wellness', slug: 'health-wellness' }]);
            setTags([
              { id: 1, name: 'Medication Safety', slug: 'medication-safety' },
              { id: 2, name: 'Health Tips', slug: 'health-tips' },
              { id: 3, name: 'Chronic Conditions', slug: 'chronic-conditions' },
              { id: 4, name: 'Preventive Care', slug: 'preventive-care' }
            ]);
            setLoading(false);
            return;
          }
        }

        // Try to fetch from WordPress for real posts
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
          setError('Post not found');
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
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: post.content?.rendered || 'No content available.' }}
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
