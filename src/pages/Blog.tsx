import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Clock, ArrowRight, Tag, Eye, Heart, Share2, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { wordPressAPI } from "@/lib/wordpress";
import { SEOHead } from "@/components/SEOHead";
import { useFormHandlers } from "@/hooks/useFormHandlers";
import { RefillForm } from "@/components/RefillForm";
import { AppointmentForm } from "@/components/AppointmentForm";
import { TransferForm } from "@/components/TransferForm";
import { SafeImageRenderer } from '@/components/SafeImageRenderer';
import api from "@/lib/api";

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  date: string;
  modified: string;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{ name: string }>;
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
  };
}

interface WordPressCategory {
  id: number;
  name: string;
  count: number;
  description: string;
}





export default function Blog() {
  const navigate = useNavigate();
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
  
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = () => {
    // The search is already handled by the searchQuery state and useEffect
    // This function can be used for additional search logic if needed
    console.log('Searching for:', searchQuery);
    // Force a re-render to show search results
    setSearchQuery(searchQuery);
  };

  const handleReadMore = (postId: number) => {
    try {
      // Navigate to individual blog post page
      console.log('Navigating to blog post:', postId);
      navigate(`/blog/${postId}`);
    } catch (error) {
      console.error('Error navigating to blog post:', error);
      // Fallback: try to navigate to a sample post
      navigate('/blog/1');
    }
  };

  const handleNewsletterSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    try {
      const response = await api.post('/newsletter/subscribe', { 
        email: newsletterEmail,
        source: 'blog',
        consent: true
      });
      
      if (response.data.success) {
        setIsSubscribed(true);
        setNewsletterEmail('');
        
        if (response.data.alreadySubscribed) {
          alert('You\'re already subscribed to our newsletter!');
        } else {
          alert('Thank you for subscribing! Check your email for confirmation.');
        }
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      if (error.response?.status === 400) {
        alert('Please enter a valid email address.');
      } else if (error.response?.status === 500) {
        alert('Subscription failed. Please try again later or contact us directly.');
      } else {
        alert('Unable to subscribe at the moment. Please try again later.');
      }
    }
  };
  const [featuredPosts, setFeaturedPosts] = useState<WordPressPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<WordPressPost[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Fetch posts from WordPress
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if WordPress API is configured
        if (!import.meta.env.VITE_WORDPRESS_URL) {
          console.warn('WordPress API not configured');
          setError('WordPress blog not configured. Please configure VITE_WORDPRESS_URL to show blog posts.');
        }

        // Use your backend API instead of direct WordPress API
        const [postsResponse, categoriesResponse, featuredResponse] = await Promise.all([
          api.get('/wordpress/posts?per_page=100').then(res => res.data.posts || res.data),
          api.get('/wordpress/categories').then(res => res.data.categories || res.data || []),
          api.get('/wordpress/posts?featured=true&per_page=3').then(res => res.data.posts || res.data || [])
        ]);
        
        // Type assertions to fix TypeScript errors
        const typedPostsData = postsResponse as WordPressPost[];
        const typedCategoriesData = categoriesResponse as WordPressCategory[];
        const typedFeaturedData = featuredResponse as WordPressPost[];
        
        // Filter out posts with empty titles or content
        const validPosts = typedPostsData.filter(post => {
          const title = typeof post.title === 'string' ? post.title : post.title?.rendered || '';
          const content = typeof post.content === 'string' ? post.content : post.content?.rendered || '';
          return title.trim() !== '' && content.trim() !== '';
        });
        
        setPosts(validPosts);
        setFeaturedPosts(typedFeaturedData.filter(post => {
          const title = typeof post.title === 'string' ? post.title : post.title?.rendered || '';
          const content = typeof post.content === 'string' ? post.content : post.content?.rendered || '';
          return title.trim() !== '' && content.trim() !== '';
        }));
        setRecentPosts(validPosts.slice(0, 6));
        setCategories(typedCategoriesData);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Unable to load blog posts at this time. Please try again later.');
        // Set empty arrays on error - fallback content will be provided by the API
        setPosts([]);
        setCategories([]);
        setFeaturedPosts([]);
        setRecentPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    // Handle both WordPress format (title.rendered) and our sample format (title directly)
    const postTitle = typeof post.title === 'string' ? post.title : post.title?.rendered || '';
    const postExcerpt = typeof post.excerpt === 'string' ? post.excerpt : post.excerpt?.rendered || '';
    const postContent = typeof post.content === 'string' ? post.content : post.content?.rendered || '';
    
    if (!searchQuery.trim()) {
      // If no search query, only filter by category
      const postCategories = Array.isArray(post.categories) ? post.categories : [];
      const categoryIds = postCategories.map(cat => 
        typeof cat === 'number' ? cat : (cat as any)?.id || cat
      );
      const matchesCategory = selectedCategory === "all" || 
                             categoryIds.includes(parseInt(selectedCategory));
      return matchesCategory;
    }
    
    // Enhanced search logic
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    const titleLower = postTitle.toLowerCase();
    const excerptLower = postExcerpt.toLowerCase();
    const contentLower = postContent.toLowerCase();
    
    // Check if all search terms match any field
    const matchesSearch = searchTerms.every(term => 
      titleLower.includes(term) ||
      excerptLower.includes(term) ||
      contentLower.includes(term)
    );
    
    // Handle categories - could be array of IDs or array of category objects
    const postCategories = Array.isArray(post.categories) ? post.categories : [];
    const categoryIds = postCategories.map(cat => 
      typeof cat === 'number' ? cat : (cat as any)?.id || cat
    );
    
    const matchesCategory = selectedCategory === "all" || 
                           categoryIds.includes(parseInt(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'General';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReadTime = (content: string | undefined) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#57BBB6] mx-auto mb-4" />
            <p className="text-lg text-[#376F6B]">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Health Blog - My Meds Pharmacy | Expert Health & Wellness Articles"
        description="Read expert health articles, medication guides, and wellness tips from our pharmacy team. Stay informed about your health with our comprehensive blog."
        keywords="health blog, pharmacy blog, medication guides, health articles, wellness tips, pharmaceutical advice, health education, medication safety"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={onRefillClick}
          onAppointmentClick={onAppointmentClick}
          onTransferClick={onTransferClick}
        />
      
      <div className="">
        {/* Error Banner */}
        {error && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 mx-4 sm:mx-6 lg:mx-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="py-8 text-center">
            <div className="max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-600 mb-4">
                Blog posts will appear here once they are published in your WordPress admin panel.
              </p>
              <p className="text-sm text-gray-500">
                Make sure your WordPress site is configured and you have published posts.
              </p>
            </div>
          </div>
        )}


        {/* Hero Section */}
        <section className="py-8 sm:py-12 md:py-16 text-white relative overflow-hidden">
          {/* Background Image - More Visible */}
          <div
            className="absolute inset-0 opacity-100 pointer-events-none"
            style={{
              backgroundImage: `url('/images/new/blogpage.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
          
          {/* Light overlay for text readability without gradient */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none z-10"></div>
          
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm text-[#57BBB6] px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-xl border border-white/20">
                <BookOpen className="h-5 w-5" />
                Health & Wellness Blog
                <div className="w-2 h-2 bg-[#57BBB6] rounded-full"></div>
              </div>
              
              {/* Enhanced Title with Better Typography */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="block text-white">
                  Stay Informed with
                </span>
                <span className="block text-white">
                  Expert Health Insights
                </span>
              </h1>
              
              {/* Enhanced Description */}
              <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-4xl mx-auto font-medium leading-relaxed mb-6">
                Discover evidence-based health tips, medication guidance, and wellness advice from our experienced 
                pharmacy team to help you make informed decisions about your health.
              </p>
              
              {/* Enhanced Decorative Elements */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-1 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                <div className="w-12 h-1 bg-white/60 rounded-full"></div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{posts.length}</div>
                  <div className="text-white/80 text-xs">Health Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{categories.length}</div>
                  <div className="text-white/80 text-xs">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">24/7</div>
                  <div className="text-white/80 text-xs">Expert Support</div>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filter */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                    <Input
                      type="text"
                      placeholder="Search health articles, medications, tips..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="pl-12 pr-4 py-3 text-base border-2 border-gray-200 focus:ring-2 focus:ring-[#57BBB6] focus:border-[#57BBB6] focus:outline-none text-gray-800 placeholder:text-gray-500 bg-white/90 rounded-xl shadow-sm"
                    />
                  </div>
                  <Button 
                    className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-6 py-3 rounded-xl shadow-lg" 
                    onClick={() => handleSearch()}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Enhanced Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    className={`${
                      selectedCategory === "all"
                        ? "bg-[#57BBB6] text-white hover:bg-[#376F6B] shadow-lg"
                        : "border-2 border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white bg-white/90"
                    } px-4 py-2 rounded-full font-semibold text-sm`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    All Posts
                    <Badge variant="secondary" className="ml-2 bg-white text-[#57BBB6] font-bold text-xs">
                      {posts.length}
                    </Badge>
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`${
                        selectedCategory === category.id.toString()
                          ? "bg-[#57BBB6] text-white hover:bg-[#376F6B] shadow-lg"
                          : "border-2 border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white bg-white/90"
                      } px-4 py-2 rounded-full font-semibold text-sm`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {category.name}
                      <Badge variant="secondary" className="ml-2 bg-white text-[#57BBB6] font-bold text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-8 sm:py-12 bg-[#F1EEE9]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Featured Articles
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Our most popular and informative health articles, carefully selected to help you stay healthy and informed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-20">
              {filteredPosts.slice(0, 3).map((post, index) => (
                <Card 
                  key={post.id} 
                  className="group border-0 shadow-xl hover:shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Enhanced Post Image with Overlay */}
                    <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
                      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                        <SafeImageRenderer 
                          src={post._embedded['wp:featuredmedia'][0].source_url} 
                          alt={post._embedded['wp:featuredmedia'][0].alt_text || (typeof post.title === 'string' ? post.title : post.title?.rendered || '')}
                          className="w-full h-full object-cover"
                          fallbackIcon={<BookOpen className="h-20 w-20 text-[#57BBB6]" />}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <BookOpen className="h-20 w-20 text-[#57BBB6]" />
                        </div>
                      )}
                      
                      {/* Simple Overlay */}
                      <div className="absolute inset-0 bg-black/10"></div>
                      
                      {/* Category Badge - Floating */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-[#57BBB6] text-white border-0 shadow-lg backdrop-blur-sm bg-opacity-90">
                          {getCategoryName(post.categories[0])}
                        </Badge>
                      </div>
                      
                      {/* Read Time - Floating */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getReadTime(typeof post.content === 'string' ? post.content : post.content?.rendered || '')}
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Post Meta with Icons */}
                      <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#57BBB6]/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-[#57BBB6]" />
                          </div>
                          <span className="font-medium">{post._embedded?.author?.[0]?.name || 'Unknown Author'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#376F6B]/10 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-[#376F6B]" />
                          </div>
                          <span className="font-medium">{formatDate(post.date)}</span>
                        </div>
                      </div>

                      {/* Enhanced Post Title */}
                      <CardTitle className="text-xl sm:text-2xl font-bold text-[#376F6B] mb-4 group-hover:text-[#57BBB6] line-clamp-2 leading-tight">
                        {(typeof post.title === 'string' ? post.title : post.title?.rendered || '')}
                      </CardTitle>

                      {/* Enhanced Post Excerpt */}
                      <CardDescription className="text-gray-600 mb-6 leading-relaxed line-clamp-3 text-base">
                        {(typeof post.excerpt === 'string' ? post.excerpt : post.excerpt?.rendered || '').replace(/<[^>]*>/g, '')}
                      </CardDescription>

                      {/* Enhanced Read More Button */}
                      <Button 
                        variant="outline" 
                        onClick={() => handleReadMore(post.id)}
                        className="w-full border-2 border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white rounded-xl px-6 py-3 text-sm font-semibold group-hover:shadow-lg hover:shadow-xl"
                      >
                        <span className="mr-2">Read Full Article</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-8 sm:py-12 bg-[#E8F4F3]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Recent Articles
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Stay up-to-date with our latest health insights and wellness tips.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {filteredPosts.slice(3).map((post, index) => (
                <Card 
                  key={post.id} 
                  className="group border-0 shadow-lg hover:shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Enhanced Post Image */}
                    <div className="relative w-full h-52 bg-gray-200 overflow-hidden">
                      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                        <SafeImageRenderer 
                          src={post._embedded['wp:featuredmedia'][0].source_url} 
                          alt={post._embedded['wp:featuredmedia'][0].alt_text || (typeof post.title === 'string' ? post.title : post.title?.rendered || '')}
                          className="w-full h-full object-cover"
                          fallbackIcon={<BookOpen className="h-16 w-16 text-[#376F6B]" />}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <BookOpen className="h-16 w-16 text-[#376F6B]" />
                        </div>
                      )}
                      
                      {/* Category Badge - Floating */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#376F6B] text-white border-0 shadow-md backdrop-blur-sm bg-opacity-90">
                          {getCategoryName(post.categories[0])}
                        </Badge>
                      </div>
                      
                      {/* Read Time - Floating */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium shadow-md">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getReadTime(typeof post.content === 'string' ? post.content : post.content?.rendered || '')}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Post Meta with Enhanced Icons */}
                      <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post._embedded?.author?.[0]?.name || 'Unknown Author'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.date)}
                        </div>
                      </div>

                      {/* Enhanced Post Title */}
                      <CardTitle className="text-lg sm:text-xl font-bold text-[#376F6B] mb-3 group-hover:text-[#57BBB6] line-clamp-2 leading-tight">
                        {(typeof post.title === 'string' ? post.title : post.title?.rendered || '')}
                      </CardTitle>

                      {/* Enhanced Post Excerpt */}
                      <CardDescription className="text-gray-600 mb-4 leading-relaxed line-clamp-3 text-sm">
                        {(typeof post.excerpt === 'string' ? post.excerpt : post.excerpt?.rendered || '').replace(/<[^>]*>/g, '')}
                      </CardDescription>

                      {/* Enhanced Read More Button */}
                      <Button 
                        variant="outline" 
                        onClick={() => handleReadMore(post.id)}
                        className="w-full border-2 border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white rounded-lg px-4 py-2 text-sm font-semibold group-hover:shadow-md hover:shadow-lg"
                      >
                        <span className="mr-2">Read Article</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                {searchQuery ? (
                  <p className="text-gray-500 mb-6">
                    No articles found for "<span className="font-semibold">{searchQuery}</span>"
                    {selectedCategory !== "all" && ` in ${getCategoryName(parseInt(selectedCategory))}`}
                  </p>
                ) : (
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                )}
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
                  >
                    Clear All Filters
                  </Button>
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                      className="border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-8 sm:py-12 bg-[#E8F4F3]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Stay Updated with Health Insights
                </h3>
                <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                  Get the latest health tips, medication updates, and wellness advice delivered to your inbox
                </p>
                
                <form onSubmit={handleNewsletterSubscription} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 border-white/30 text-white placeholder:text-white/60 focus:border-white focus:ring-white/30 bg-white/10"
                    required
                  />
                  <Button 
                    type="submit"
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-6 py-3 rounded-xl shadow-lg"
                  >
                    Subscribe
                  </Button>
                </form>
                
                <p className="text-white/70 text-sm mt-4">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      
      {/* Forms */}
      <RefillForm isOpen={showRefillForm} onClose={closeRefillForm} />
      <AppointmentForm isOpen={showAppointmentForm} onClose={closeAppointmentForm} />
      <TransferForm isOpen={showTransferForm} onClose={closeTransferForm} />
        </div>
      </>
    );
} 