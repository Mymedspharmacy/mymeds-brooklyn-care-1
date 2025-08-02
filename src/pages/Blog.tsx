import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Filter, BookOpen, Heart, Share2, Tag } from 'lucide-react';
import wordPressAPI from '../lib/wordpress';

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArticles, setLikedArticles] = useState([]);
  const [articleLikes, setArticleLikes] = useState({});
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Check if WordPress is configured
      if (!import.meta.env.VITE_WORDPRESS_URL) {
        console.warn('WordPress not configured, using sample posts');
        setError('WordPress not configured. Please set up VITE_WORDPRESS_URL in your .env file.');
        setPosts([
          {
            id: 1,
            title: { rendered: 'Sample Blog Post 1' },
            excerpt: { rendered: 'This is a sample blog post for testing purposes.' },
            content: { rendered: 'This is the full content of the sample blog post.' },
            date: new Date().toISOString(),
            author: 1,
            categories: [1],
            sticky: true,
            _embedded: {
              'wp:featuredmedia': [{ source_url: '/placeholder.svg' }],
              author: [{ name: 'Admin', avatar_urls: { '96': '/placeholder.svg' } }]
            }
          },
          {
            id: 2,
            title: { rendered: 'Sample Blog Post 2' },
            excerpt: { rendered: 'Another sample blog post for testing.' },
            content: { rendered: 'This is the full content of another sample blog post.' },
            date: new Date().toISOString(),
            author: 1,
            categories: [2],
            sticky: false,
            _embedded: {
              'wp:featuredmedia': [{ source_url: '/placeholder.svg' }],
              author: [{ name: 'Admin', avatar_urls: { '96': '/placeholder.svg' } }]
            }
          }
        ]);
        return;
      }
      
      const postsData = await wordPressAPI.getPosts({
        per_page: 20,
        status: 'publish',
      });
      // Ensure postsData is an array
      if (Array.isArray(postsData)) {
        setPosts(postsData);
      } else {
        console.error('Posts data is not an array:', postsData);
        setPosts([]);
        setError('Invalid posts data received');
      }
    } catch (err) {
      setError('Failed to load posts from WordPress');
      console.error('Error loading posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Check if WordPress is configured
      if (!import.meta.env.VITE_WORDPRESS_URL) {
        console.warn('WordPress not configured, using sample categories');
        setCategories([
          { id: 1, name: 'Health & Wellness' },
          { id: 2, name: 'Pharmacy Tips' },
          { id: 3, name: 'Medical News' },
          { id: 4, name: 'Patient Care' }
        ]);
        return;
      }
      
      const categoriesData = await wordPressAPI.getCategories();
      // Ensure categoriesData is an array
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.error('Categories data is not an array:', categoriesData);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };

  // Filter posts
  const filteredArticles = Array.isArray(posts) ? posts.filter(article => {
    const matchesCategory = selectedCategory === 'All' || 
      article.categories?.some(catId => {
        const category = categories.find(cat => cat.id === catId);
        return category && category.name === selectedCategory;
      });
    const matchesSearch = article.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.rendered.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) : [];

  const featuredArticles = Array.isArray(posts) ? posts.filter(article => article.sticky) : [];
  const recentArticles = Array.isArray(posts) ? posts.slice(0, 3) : [];

  function toggleLike(articleId) {
    setLikedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
    
    // Update like count
    setArticleLikes(prev => ({
      ...prev,
      [articleId]: prev[articleId] || 0
    }));
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function shareArticle(article) {
    const shareData = {
      title: article.title.rendered,
      text: article.excerpt.rendered.replace(/<[^>]*>/g, ''), // Remove HTML tags
      url: `${window.location.origin}/blog?article=${article.id}`
    };

    if (navigator.share) {
      // Use native sharing on mobile devices
      navigator.share(shareData).catch((error) => {
        console.log('Error sharing:', error);
        fallbackShare(shareData);
      });
    } else {
      // Fallback for desktop browsers
      fallbackShare(shareData);
    }
  }

  function fallbackShare(shareData) {
    // Create a temporary textarea to copy the share text
    const textarea = document.createElement('textarea');
    textarea.value = `${shareData.title}\n\n${shareData.text}\n\nRead more: ${shareData.url}`;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Show a toast notification
    alert('Article link copied to clipboard!');
  }

  // Get featured image URL
  const getFeaturedImage = (post) => {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    // Return a default blog image or data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik01MCA1MEgxNTBWMTUwSDUwVjUwWiIgZmlsbD0iIzU3QkJCNiIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QmxvZzwvdGV4dD4KPC9zdmc+Cg==';
  };

  // Get author name
  const getAuthorName = (post) => {
    if (post._embedded && post._embedded.author && post._embedded.author[0]) {
      return post._embedded.author[0].name;
    }
    return 'Admin';
  };

  // Get author image
  const getAuthorImage = (post) => {
    if (post._embedded && post._embedded.author && post._embedded.author[0] && 
        post._embedded.author[0].avatar_urls) {
      return post._embedded.author[0].avatar_urls['96'];
    }
    // Return a default avatar or data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiM1N0JCQjYiLz4KPGNpcmNsZSBjeD0iNDgiIGN5PSIzNSIgcj0iMTIiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCA3MUMzMiA1OSA2NCA1OSA3NiA3MSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';
  };

  // Get category name
  const getCategoryName = (post) => {
    if (post.categories && post.categories.length > 0) {
      const category = categories.find(cat => cat.id === post.categories[0]);
      return category ? category.name : 'Uncategorized';
    }
    return 'Uncategorized';
  };

  // Get category names for display
  const categoryNames = ['All', ...categories.map(cat => cat.name)];

  return (
    <div className="min-h-screen bg-[#f5fefd]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#57bbb6]/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-normal text-[#376f6b] mb-4">Health & Wellness Blog</h1>
            <p className="text-xl text-[#376f6b] max-w-3xl mx-auto">
              Expert medical insights, health tips, and wellness advice to help you live a healthier life
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#376f6b]" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#57bbb6] rounded-lg focus:outline-none focus:border-[#376f6b]"
            />
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar - Categories */}
          <div className="md:w-64 w-full flex-shrink-0 mb-4 md:mb-0">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 sticky top-24 md:static">
              <h3 className="text-lg font-medium text-[#376f6b] mb-3 md:mb-4">Categories</h3>
              <div className="flex md:block flex-wrap gap-2 md:space-y-2">
                {categoryNames.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full md:w-auto text-left px-3 py-2 rounded-md transition-colors text-sm md:text-base ${
                      selectedCategory === category
                        ? 'bg-[#376f6b] text-white'
                        : 'text-[#376f6b] hover:bg-[#57bbb6] hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#376f6b] mx-auto"></div>
                <p className="text-[#376f6b] mt-4">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={loadPosts}
                  className="bg-[#376f6b] text-white px-6 py-3 rounded-lg hover:bg-[#57bbb6] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Featured Articles */}
                {selectedCategory === 'All' && searchTerm === '' && featuredArticles.length > 0 && (
                  <div className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#376f6b] mb-4 sm:mb-6">Featured Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                      {featuredArticles.map((article) => (
                        <div key={article.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                          <div className="relative">
                            <img 
                              src={getFeaturedImage(article)} 
                              alt={article.title.rendered} 
                              className="w-full h-64 object-cover"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-[#57bbb6] text-[#231f20] px-3 py-1 rounded-full text-sm font-semibold">
                                Featured
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-[#376f6b] text-white px-2 py-1 rounded-full text-xs font-semibold">
                                {getCategoryName(article)}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                                <Clock size={14} />
                                {Math.ceil(article.content.rendered.split(' ').length / 200)} min read
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-normal text-[#231f20] mb-3 cursor-pointer hover:text-[#376f6b]"
                                onClick={() => setSelectedArticle(article)}>
                              {article.title.rendered}
                            </h3>
                            
                            <p className="text-[#376f6b] mb-4 line-clamp-3" 
                               dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }} />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={getAuthorImage(article)} alt={getAuthorName(article)} className="w-8 h-8 rounded-full" />
                                <div>
                                  <p className="text-sm font-semibold text-[#231f20]">{getAuthorName(article)}</p>
                                  <p className="text-xs text-[#376f6b]">{formatDate(article.date)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleLike(article.id)}
                                  className={`p-2 rounded-full transition-all duration-200 ${
                                    likedArticles.includes(article.id)
                                      ? 'text-green-600 scale-110'
                                      : 'text-[#376f6b] hover:text-green-600 hover:scale-105'
                                  }`}
                                >
                                  <Heart size={16} fill={likedArticles.includes(article.id) ? 'currentColor' : 'none'} />
                                </button>
                                <span className="text-xs text-[#376f6b]">
                                  {(articleLikes[article.id] || 0)}
                                </span>
                                <button
                                  onClick={() => shareArticle(article)}
                                  className="p-2 rounded-full transition-colors text-[#376f6b] hover:text-[#57bbb6]"
                                  title="Share article"
                                >
                                  <Share2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      <div className="relative">
                        <img 
                          src={getFeaturedImage(article)} 
                          alt={article.title.rendered} 
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => setSelectedArticle(article)}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#57bbb6] text-[#231f20] px-2 py-1 rounded-full text-xs font-semibold">
                            {getCategoryName(article)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                            <Clock size={14} />
                            {Math.ceil(article.content.rendered.split(' ').length / 200)} min read
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-normal text-[#231f20] mb-3 cursor-pointer hover:text-[#376f6b] line-clamp-2"
                            onClick={() => setSelectedArticle(article)}>
                          {article.title.rendered}
                        </h3>
                        
                        <p className="text-[#376f6b] text-sm mb-4 line-clamp-3" 
                           dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }} />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={getAuthorImage(article)} alt={getAuthorName(article)} className="w-6 h-6 rounded-full" />
                            <span className="text-sm font-semibold text-[#231f20]">{getAuthorName(article)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLike(article.id)}
                              className={`p-1 rounded-full transition-all duration-200 ${
                                likedArticles.includes(article.id)
                                  ? 'text-green-600 scale-110'
                                  : 'text-[#376f6b] hover:text-green-600 hover:scale-105'
                              }`}
                            >
                              <Heart size={14} fill={likedArticles.includes(article.id) ? 'currentColor' : 'none'} />
                            </button>
                            <span className="text-xs text-[#376f6b]">
                              {(articleLikes[article.id] || 0)}
                            </span>
                            <button
                              onClick={() => shareArticle(article)}
                              className="p-1 rounded-full transition-colors text-[#376f6b] hover:text-[#57bbb6]"
                              title="Share article"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-[#57bbb6]/20">
                          <div className="flex items-center gap-2 text-xs text-[#376f6b]">
                            <Calendar size={12} />
                            {formatDate(article.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <BookOpen size={48} className="mx-auto text-[#57bbb6] mb-4" />
                    <p className="text-[#231f20] text-lg">No articles found</p>
                    <p className="text-[#376f6b]">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-full sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#57bbb6] text-[#231f20] px-3 py-1 rounded-full font-semibold">
                      {getCategoryName(selectedArticle)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                      <Clock size={16} />
                      {Math.ceil(selectedArticle.content.rendered.split(' ').length / 200)} min read
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-normal text-[#376f6b] mb-4">{selectedArticle.title.rendered}</h2>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <img src={getAuthorImage(selectedArticle)} alt={getAuthorName(selectedArticle)} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-[#231f20]">{getAuthorName(selectedArticle)}</p>
                      <p className="text-sm text-[#376f6b]">{formatDate(selectedArticle.date)}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-[#376f6b] hover:text-[#57bbb6] ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <img src={getFeaturedImage(selectedArticle)} alt={selectedArticle.title.rendered} className="w-full h-64 object-cover rounded-lg mb-6" />
              
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.rendered }} />
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#57bbb6]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-[#376f6b]" />
                    <span className="text-sm font-semibold text-[#231f20]">Category:</span>
                    <span className="text-sm bg-[#f5fefd] text-[#376f6b] px-2 py-1 rounded">
                      {getCategoryName(selectedArticle)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(selectedArticle.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        likedArticles.includes(selectedArticle.id)
                          ? 'bg-green-50 text-green-600'
                          : 'bg-[#f5fefd] text-[#376f6b] hover:bg-[#57bbb6] hover:text-white'
                      }`}
                    >
                      <Heart size={16} fill={likedArticles.includes(selectedArticle.id) ? 'currentColor' : 'none'} />
                      {likedArticles.includes(selectedArticle.id) ? 'Liked' : 'Like'} ({articleLikes[selectedArticle.id] || 0})
                    </button>
                    
                    <button 
                      onClick={() => shareArticle(selectedArticle)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#f5fefd] text-[#376f6b] rounded-lg hover:bg-[#57bbb6] hover:text-white transition-colors"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 