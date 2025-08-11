import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Clock, ArrowRight, Tag, Eye, Heart, Share2, BookOpen, TrendingUp, Shield, Leaf, Brain, Heart as HeartIcon, Loader2, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { wordPressAPI } from "@/lib/wordpress";

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

// Fallback sample posts when WordPress is not available
const fallbackPosts: WordPressPost[] = [
  {
    id: 1,
    title: { rendered: "Understanding Your Prescription Medications" },
    content: { rendered: "Learn about the importance of understanding your prescription medications, including dosage, side effects, and interactions..." },
    excerpt: { rendered: "Essential guide to understanding your prescription medications for better health outcomes." },
    author: 1,
    date: new Date().toISOString(),
    modified: new Date().toISOString(),
    categories: [1],
    tags: [],
    _embedded: {
      author: [{ name: "Pharmacy Team" }]
    }
  },
  {
    id: 2,
    title: { rendered: "Seasonal Health Tips for Spring" },
    content: { rendered: "Spring brings new health challenges and opportunities. Discover how to stay healthy during allergy season..." },
    excerpt: { rendered: "Stay healthy this spring with our expert tips for managing seasonal allergies and wellness." },
    author: 1,
    date: new Date().toISOString(),
    modified: new Date().toISOString(),
    categories: [2],
    tags: [],
    _embedded: {
      author: [{ name: "Pharmacy Team" }]
    }
  },
  {
    id: 3,
    title: { rendered: "The Importance of Medication Adherence" },
    content: { rendered: "Taking your medications as prescribed is crucial for treatment success. Learn strategies to improve adherence..." },
    excerpt: { rendered: "Why following your medication schedule is essential for your health and recovery." },
    author: 1,
    date: new Date().toISOString(),
    modified: new Date().toISOString(),
    categories: [1],
    tags: [],
    _embedded: {
      author: [{ name: "Pharmacy Team" }]
    }
  }
];

const fallbackCategories: WordPressCategory[] = [
  { id: 1, name: "Medication Safety", count: 2, description: "Tips for safe medication use" },
  { id: 2, name: "Seasonal Health", count: 1, description: "Health advice for different seasons" }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<WordPressPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<WordPressPost[]>([]);

  // Fetch posts from WordPress
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if WordPress API is configured
        if (!import.meta.env.VITE_WORDPRESS_URL) {
          console.warn('WordPress API not configured, using fallback content');
          setPosts(fallbackPosts);
          setCategories(fallbackCategories);
          setFeaturedPosts(fallbackPosts.slice(0, 2));
          setRecentPosts(fallbackPosts);
          return;
        }

        const [postsData, categoriesData, featuredData] = await Promise.all([
          wordPressAPI.getPosts({ per_page: 100 }),
          wordPressAPI.getCategories(),
          wordPressAPI.getFeaturedPosts({ per_page: 3 })
        ]);
        
        setPosts(postsData);
        setCategories(categoriesData);
        setFeaturedPosts(featuredData);
        setRecentPosts(postsData.slice(0, 6));
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Unable to load blog posts at this time. Please try again later.');
        // Use fallback content on error
        setPosts(fallbackPosts);
        setCategories(fallbackCategories);
        setFeaturedPosts(fallbackPosts.slice(0, 2));
        setRecentPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.rendered.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           post.categories.includes(parseInt(selectedCategory));
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

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => window.location.href = '/'}
          onAppointmentClick={() => window.location.href = '/'}
          onTransferClick={() => window.location.href = '/'}
        />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#57BBB6] mx-auto mb-4" />
            <p className="text-lg text-[#376F6B]">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => window.location.href = '/'}
        onAppointmentClick={() => window.location.href = '/'}
        onTransferClick={() => window.location.href = '/'}
      />
      
      <div className="pt-20">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#57BBB6] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white text-[#57BBB6] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <BookOpen className="h-5 w-5" />
                Health & Wellness Blog
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                Stay Informed with 
                <span className="block text-white">
                  Expert Health Insights
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto font-medium leading-relaxed">
                Discover evidence-based health tips, medication guidance, and wellness advice from our experienced 
                pharmacy team to help you make informed decisions about your health.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  />
                </div>
                <Button className="bg-white text-[#57BBB6] hover:bg-gray-100 px-6 py-3">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className={`${
                    selectedCategory === "all"
                      ? "bg-white text-[#57BBB6] hover:bg-gray-100"
                      : "border-white text-white hover:bg-white hover:text-[#57BBB6]"
                  } px-4 py-2 rounded-full transition-all duration-300`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  All Posts
                  <Badge variant="secondary" className="ml-2 bg-[#57BBB6] text-white">
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
                        ? "bg-white text-[#57BBB6] hover:bg-gray-100"
                        : "border-white text-white hover:bg-white hover:text-[#57BBB6]"
                    } px-4 py-2 rounded-full transition-all duration-300`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {category.name}
                    <Badge variant="secondary" className="ml-2 bg-[#57BBB6] text-white">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Featured Articles
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Our most popular and informative health articles, carefully selected to help you stay healthy and informed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-0">
                    {/* Post Image */}
                    <div className="w-full h-48 bg-[#D5C6BC] rounded-t-xl flex items-center justify-center overflow-hidden">
                      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                        <img 
                          src={post._embedded['wp:featuredmedia'][0].source_url} 
                          alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-[#57BBB6]" />
                      )}
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="mb-4">
                        <Badge className="bg-[#57BBB6] text-white border-0">
                          {getCategoryName(post.categories[0])}
                        </Badge>
                      </div>

                      {/* Post Meta */}
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

                      {/* Post Title */}
                      <CardTitle className="text-lg sm:text-xl font-bold text-[#376F6B] mb-3 group-hover:text-[#57BBB6] transition-colors duration-300 line-clamp-2">
                        {post.title.rendered}
                      </CardTitle>

                      {/* Post Excerpt */}
                      <CardDescription className="text-gray-600 mb-4 leading-relaxed line-clamp-2 text-sm">
                        {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                      </CardDescription>

                      {/* Read Time */}
                      <div className="flex items-center gap-3 text-gray-500 text-xs mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getReadTime(post.content.rendered)}
                        </div>
                      </div>

                      {/* Read More Button */}
                      <Button 
                        variant="outline" 
                        className="border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white rounded-full px-3 py-1 text-xs transition-all duration-300"
                      >
                        <ArrowRight className="h-3 w-3" />
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-16 sm:py-20 bg-[#D5C6BC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Recent Articles
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Stay up-to-date with our latest health insights and wellness tips.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recentPosts.map((post) => (
                <Card key={post.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
                  <CardContent className="p-0">
                    {/* Post Image */}
                    <div className="w-full h-48 bg-[#D5C6BC] rounded-t-xl flex items-center justify-center overflow-hidden">
                      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                        <img 
                          src={post._embedded['wp:featuredmedia'][0].source_url} 
                          alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-[#57BBB6]" />
                      )}
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="mb-4">
                        <Badge className="bg-[#376F6B] text-white border-0">
                          {getCategoryName(post.categories[0])}
                        </Badge>
                      </div>

                      {/* Post Meta */}
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

                      {/* Post Title */}
                      <CardTitle className="text-lg sm:text-xl font-bold text-[#376F6B] mb-3 group-hover:text-[#57BBB6] transition-colors duration-300 line-clamp-2">
                        {post.title.rendered}
                      </CardTitle>

                      {/* Post Excerpt */}
                      <CardDescription className="text-gray-600 mb-4 leading-relaxed line-clamp-2 text-sm">
                        {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                      </CardDescription>

                      {/* Read Time */}
                      <div className="flex items-center gap-3 text-gray-500 text-xs mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getReadTime(post.content.rendered)}
                        </div>
                      </div>

                      {/* Read More Button */}
                      <Button 
                        variant="outline" 
                        className="border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white rounded-full px-3 py-1 text-xs transition-all duration-300"
                      >
                        <ArrowRight className="h-3 w-3" />
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Stay Updated with Health Insights
                </h3>
                <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                  Get the latest health tips, medication updates, and wellness advice delivered to your inbox
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 border-white/30 text-white placeholder:text-white/60 focus:border-white focus:ring-white/30 bg-white/10"
                  />
                  <Button 
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Subscribe
                  </Button>
                </div>
                
                <p className="text-white/70 text-sm mt-4">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
} 