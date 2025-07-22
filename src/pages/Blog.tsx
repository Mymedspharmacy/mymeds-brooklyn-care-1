import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Filter, BookOpen, Heart, Share2, Tag } from 'lucide-react';
import api from '../lib/api';

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArticles, setLikedArticles] = useState([]);
  const [articleLikes, setArticleLikes] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/blogs')
      .then(res => setBlogs(res.data))
      .catch(() => setError('Failed to load blogs'));
  }, []);

  // Filter blogs
  const filteredArticles = blogs.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = blogs.filter(article => article.featured);
  const recentArticles = blogs.slice(0, 3);

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
      title: article.title,
      text: article.excerpt,
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
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
        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-medium text-[#376f6b] mb-4">Categories</h3>
              <div className="space-y-2">
                {/* CATEGORIES array is removed, so this loop will not render anything */}
                {/* This section needs to be updated to fetch categories from the backend */}
                <button
                  key="All"
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-[#376f6b] text-white'
                      : 'text-[#376f6b] hover:bg-[#57bbb6] hover:text-white'
                  }`}
                >
                  All Categories
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">

        {/* Featured Articles */}
        {selectedCategory === 'All' && searchTerm === '' && (
          <div className="mb-12">
            <h2 className="text-3xl font-normal text-[#376f6b] mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={article.image} 
                      alt={article.title} 
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
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                        <Clock size={14} />
                        {article.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-normal text-[#231f20] mb-3 cursor-pointer hover:text-[#376f6b]"
                        onClick={() => setSelectedArticle(article)}>
                      {article.title}
                    </h3>
                    
                    <p className="text-[#376f6b] mb-4 line-clamp-3">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={article.authorImage} alt={article.author} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-[#231f20]">{article.author}</p>
                          <p className="text-xs text-[#376f6b]">{formatDate(article.publishDate)}</p>
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
                          {(articleLikes[article.id] || 0) + article.likes}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#57bbb6] text-[#231f20] px-2 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                        <Clock size={14} />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                        <BookOpen size={14} />
                        {article.views} views
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-normal text-[#231f20] mb-3 cursor-pointer hover:text-[#376f6b] line-clamp-2"
                        onClick={() => setSelectedArticle(article)}>
                      {article.title}
                    </h3>
                    
                    <p className="text-[#376f6b] text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={article.authorImage} alt={article.author} className="w-6 h-6 rounded-full" />
                        <span className="text-sm font-semibold text-[#231f20]">{article.author}</span>
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
                      {(articleLikes[article.id] || 0) + article.likes}
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
                      <div className="flex flex-wrap gap-1">
                        {article.tags && article.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-[#f5fefd] text-[#376f6b] px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-[#57bbb6] mb-4" />
                <p className="text-[#231f20] text-lg">No articles found</p>
                <p className="text-[#376f6b]">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#57bbb6] text-[#231f20] px-3 py-1 rounded-full font-semibold">
                      {selectedArticle.category}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                      <Clock size={16} />
                      {selectedArticle.readTime}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#376f6b]">
                      <BookOpen size={16} />
                      {selectedArticle.views} views
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-normal text-[#376f6b] mb-4">{selectedArticle.title}</h2>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <img src={selectedArticle.authorImage} alt={selectedArticle.author} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-[#231f20]">{selectedArticle.author}</p>
                      <p className="text-sm text-[#376f6b]">{formatDate(selectedArticle.publishDate)}</p>
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
              
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg mb-6" />
              
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#57bbb6]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-[#376f6b]" />
                    <span className="text-sm font-semibold text-[#231f20]">Tags:</span>
                    {selectedArticle.tags && selectedArticle.tags.map((tag, index) => (
                      <span key={index} className="text-sm bg-[#f5fefd] text-[#376f6b] px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
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
                      {likedArticles.includes(selectedArticle.id) ? 'Liked' : 'Like'} ({((articleLikes[selectedArticle.id] || 0) + selectedArticle.likes)})
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