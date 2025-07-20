import { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Filter, BookOpen, Heart, Share2, Tag } from 'lucide-react';

// Professional medical blog articles
const ARTICLES = [
  {
    id: 1,
    title: 'Understanding Blood Pressure: A Complete Guide to Heart Health',
    excerpt: 'Learn about the importance of monitoring your blood pressure, understanding readings, and maintaining cardiovascular health through lifestyle changes and medical guidance.',
    content: `
      <h2>What is Blood Pressure?</h2>
      <p>Blood pressure is the force of your blood pushing against the walls of your arteries as your heart pumps. It's measured in millimeters of mercury (mmHg) and consists of two numbers: systolic (top number) and diastolic (bottom number).</p>
      
      <h3>Understanding Your Readings</h3>
      <ul>
        <li><strong>Normal:</strong> Less than 120/80 mmHg</li>
        <li><strong>Elevated:</strong> 120-129/80 mmHg</li>
        <li><strong>High Blood Pressure (Stage 1):</strong> 130-139/80-89 mmHg</li>
        <li><strong>High Blood Pressure (Stage 2):</strong> 140/90 mmHg or higher</li>
      </ul>
      
      <h3>Risk Factors for High Blood Pressure</h3>
      <p>Several factors can contribute to high blood pressure, including:</p>
      <ul>
        <li>Age (risk increases with age)</li>
        <li>Family history</li>
        <li>Obesity or being overweight</li>
        <li>Physical inactivity</li>
        <li>High salt intake</li>
        <li>Excessive alcohol consumption</li>
        <li>Stress</li>
        <li>Smoking</li>
      </ul>
      
      <h3>Lifestyle Changes for Better Blood Pressure</h3>
      <p>Making healthy lifestyle changes can significantly impact your blood pressure:</p>
      <ol>
        <li><strong>Exercise regularly:</strong> Aim for at least 150 minutes of moderate-intensity exercise per week</li>
        <li><strong>Maintain a healthy weight:</strong> Even a small weight loss can make a big difference</li>
        <li><strong>Reduce salt intake:</strong> Limit sodium to less than 2,300 mg per day</li>
        <li><strong>Eat a balanced diet:</strong> Focus on fruits, vegetables, whole grains, and lean proteins</li>
        <li><strong>Limit alcohol:</strong> No more than 1-2 drinks per day</li>
        <li><strong>Quit smoking:</strong> Smoking damages blood vessels and increases heart disease risk</li>
        <li><strong>Manage stress:</strong> Practice relaxation techniques like meditation or deep breathing</li>
      </ol>
      
      <h3>When to See a Doctor</h3>
      <p>Contact your healthcare provider if you experience:</p>
      <ul>
        <li>Consistently high blood pressure readings</li>
        <li>Severe headaches</li>
        <li>Chest pain</li>
        <li>Shortness of breath</li>
        <li>Vision problems</li>
        <li>Irregular heartbeat</li>
      </ul>
      
      <p>Regular blood pressure monitoring is crucial for maintaining heart health. Consider investing in a reliable home blood pressure monitor and keep a log of your readings to share with your healthcare provider.</p>
    `,
    category: 'Cardiovascular Health',
    author: 'Dr. Sarah Johnson',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80',
    publishDate: '2024-01-15',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80',
    tags: ['Blood Pressure', 'Heart Health', 'Cardiovascular', 'Prevention'],
    featured: true,
    views: 1247,
    likes: 89
  },
  {
    id: 2,
    title: 'Managing Diabetes: A Comprehensive Approach to Blood Sugar Control',
    excerpt: 'Discover effective strategies for managing diabetes through diet, exercise, medication, and lifestyle modifications to maintain optimal blood sugar levels.',
    content: `
      <h2>Understanding Diabetes</h2>
      <p>Diabetes is a chronic condition that affects how your body processes glucose (sugar). There are three main types: Type 1, Type 2, and gestational diabetes. Each requires different management approaches.</p>
      
      <h3>Blood Sugar Monitoring</h3>
      <p>Regular blood sugar monitoring is essential for diabetes management. Target ranges typically include:</p>
      <ul>
        <li><strong>Before meals:</strong> 80-130 mg/dL</li>
        <li><strong>2 hours after meals:</strong> Less than 180 mg/dL</li>
        <li><strong>Bedtime:</strong> 90-150 mg/dL</li>
      </ul>
      
      <h3>Dietary Guidelines</h3>
      <p>A balanced diet is crucial for diabetes management:</p>
      <ul>
        <li>Choose complex carbohydrates over simple sugars</li>
        <li>Include plenty of fiber-rich foods</li>
        <li>Monitor portion sizes</li>
        <li>Eat regular meals and snacks</li>
        <li>Limit processed foods and added sugars</li>
      </ul>
      
      <h3>Exercise and Physical Activity</h3>
      <p>Regular exercise helps improve insulin sensitivity and blood sugar control:</p>
      <ul>
        <li>Aim for 150 minutes of moderate-intensity exercise weekly</li>
        <li>Include both aerobic and strength training</li>
        <li>Monitor blood sugar before, during, and after exercise</li>
        <li>Stay hydrated during physical activity</li>
      </ul>
      
      <h3>Medication Management</h3>
      <p>Work closely with your healthcare team to:</p>
      <ul>
        <li>Take medications as prescribed</li>
        <li>Monitor for side effects</li>
        <li>Adjust dosages as needed</li>
        <li>Keep regular appointments</li>
      </ul>
    `,
    category: 'Diabetes Management',
    author: 'Dr. Michael Chen',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80',
    publishDate: '2024-01-12',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    tags: ['Diabetes', 'Blood Sugar', 'Nutrition', 'Exercise'],
    featured: true,
    views: 892,
    likes: 67
  },
  {
    id: 3,
    title: 'Respiratory Health: Understanding Asthma and COPD Management',
    excerpt: 'Learn about common respiratory conditions, their symptoms, treatment options, and how to improve lung function through proper medication use and lifestyle changes.',
    content: `
      <h2>Common Respiratory Conditions</h2>
      <p>Respiratory conditions affect millions of people worldwide. Understanding these conditions is the first step toward better management.</p>
      
      <h3>Asthma</h3>
      <p>Asthma is a chronic inflammatory condition that causes airway narrowing and increased mucus production. Common triggers include:</p>
      <ul>
        <li>Allergens (pollen, dust mites, pet dander)</li>
        <li>Respiratory infections</li>
        <li>Exercise</li>
        <li>Cold air</li>
        <li>Air pollution</li>
        <li>Stress</li>
      </ul>
      
      <h3>COPD (Chronic Obstructive Pulmonary Disease)</h3>
      <p>COPD is a progressive lung disease that makes breathing difficult. It's typically caused by long-term exposure to irritants like cigarette smoke.</p>
      
      <h3>Treatment Options</h3>
      <p>Both conditions can be managed with:</p>
      <ul>
        <li><strong>Inhaled medications:</strong> Bronchodilators and corticosteroids</li>
        <li><strong>Lifestyle modifications:</strong> Smoking cessation, exercise, and avoiding triggers</li>
        <li><strong>Pulmonary rehabilitation:</strong> Exercise programs designed for lung conditions</li>
        <li><strong>Regular monitoring:</strong> Peak flow meters and spirometry tests</li>
      </ul>
      
      <h3>Prevention Strategies</h3>
      <ul>
        <li>Quit smoking and avoid secondhand smoke</li>
        <li>Get vaccinated against flu and pneumonia</li>
        <li>Maintain good indoor air quality</li>
        <li>Exercise regularly to improve lung function</li>
        <li>Follow your treatment plan consistently</li>
      </ul>
    `,
    category: 'Respiratory Health',
    author: 'Dr. Emily Rodriguez',
    authorImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=100&q=80',
    publishDate: '2024-01-10',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    tags: ['Asthma', 'COPD', 'Respiratory', 'Lung Health'],
    featured: false,
    views: 654,
    likes: 45
  },
  {
    id: 4,
    title: 'Medication Safety: Best Practices for Safe Medication Use',
    excerpt: 'Essential guidelines for safe medication use, including proper storage, dosage timing, potential interactions, and when to consult healthcare professionals.',
    content: `
      <h2>Medication Safety Fundamentals</h2>
      <p>Safe medication use is crucial for achieving optimal treatment outcomes while minimizing risks. Here are essential guidelines to follow.</p>
      
      <h3>Reading Medication Labels</h3>
      <p>Always read and understand medication labels before taking any medication:</p>
      <ul>
        <li>Check the active ingredients</li>
        <li>Verify the dosage strength</li>
        <li>Read all warnings and precautions</li>
        <li>Follow storage instructions</li>
        <li>Note expiration dates</li>
      </ul>
      
      <h3>Proper Storage</h3>
      <p>Store medications correctly to maintain their effectiveness:</p>
      <ul>
        <li>Keep in a cool, dry place</li>
        <li>Avoid bathroom storage (humidity can affect medications)</li>
        <li>Store out of reach of children and pets</li>
        <li>Keep medications in their original containers</li>
        <li>Don't mix different medications in the same container</li>
      </ul>
      
      <h3>Timing and Dosing</h3>
      <p>Proper timing and dosing are essential for medication effectiveness:</p>
      <ul>
        <li>Take medications at the same time each day</li>
        <li>Use a pill organizer for multiple medications</li>
        <li>Set reminders on your phone or calendar</li>
        <li>Don't skip doses or double up if you miss one</li>
        <li>Take with or without food as directed</li>
      </ul>
      
      <h3>Potential Drug Interactions</h3>
      <p>Be aware of potential interactions:</p>
      <ul>
        <li>Inform your pharmacist about all medications you're taking</li>
        <li>Include over-the-counter medications and supplements</li>
        <li>Ask about food and alcohol interactions</li>
        <li>Report any unusual side effects immediately</li>
      </ul>
      
      <h3>When to Contact Your Healthcare Provider</h3>
      <p>Contact your doctor or pharmacist if you experience:</p>
      <ul>
        <li>Severe side effects</li>
        <li>Allergic reactions</li>
        <li>Medication doesn't seem to be working</li>
        <li>Difficulty taking the medication as prescribed</li>
        <li>Questions about dosage or timing</li>
      </ul>
    `,
    category: 'Medication Safety',
    author: 'Dr. Lisa Thompson',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=100&q=80',
    publishDate: '2024-01-08',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    tags: ['Medication Safety', 'Drug Interactions', 'Dosage', 'Storage'],
    featured: false,
    views: 543,
    likes: 38
  },
  {
    id: 5,
    title: 'Mental Health and Wellness: Strategies for Stress Management',
    excerpt: 'Explore effective techniques for managing stress, anxiety, and maintaining mental wellness through mindfulness, exercise, and healthy lifestyle choices.',
    content: `
      <h2>Understanding Stress and Mental Health</h2>
      <p>Mental health is just as important as physical health. Chronic stress can impact both your mental and physical well-being, making stress management essential.</p>
      
      <h3>Recognizing Stress Symptoms</h3>
      <p>Common signs of stress include:</p>
      <ul>
        <li>Difficulty sleeping or excessive sleep</li>
        <li>Changes in appetite</li>
        <li>Irritability or mood swings</li>
        <li>Difficulty concentrating</li>
        <li>Physical symptoms (headaches, muscle tension)</li>
        <li>Feeling overwhelmed or anxious</li>
      </ul>
      
      <h3>Stress Management Techniques</h3>
      <p>Effective stress management strategies include:</p>
      <ul>
        <li><strong>Mindfulness and meditation:</strong> Practice daily meditation or mindfulness exercises</li>
        <li><strong>Regular exercise:</strong> Physical activity releases endorphins and reduces stress hormones</li>
        <li><strong>Deep breathing:</strong> Practice deep breathing exercises when feeling stressed</li>
        <li><strong>Time management:</strong> Prioritize tasks and learn to say no when necessary</li>
        <li><strong>Social support:</strong> Maintain connections with friends and family</li>
        <li><strong>Hobbies and interests:</strong> Engage in activities you enjoy</li>
      </ul>
      
      <h3>Lifestyle Factors</h3>
      <p>Healthy lifestyle choices support mental wellness:</p>
      <ul>
        <li>Maintain a regular sleep schedule</li>
        <li>Eat a balanced, nutritious diet</li>
        <li>Limit caffeine and alcohol intake</li>
        <li>Spend time outdoors and in nature</li>
        <li>Practice gratitude and positive thinking</li>
      </ul>
      
      <h3>When to Seek Professional Help</h3>
      <p>Consider professional help if you experience:</p>
      <ul>
        <li>Persistent feelings of sadness or hopelessness</li>
        <li>Difficulty functioning in daily life</li>
        <li>Thoughts of self-harm</li>
        <li>Severe anxiety or panic attacks</li>
        <li>Substance use to cope with stress</li>
      </ul>
    `,
    category: 'Mental Health',
    author: 'Dr. James Wilson',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    publishDate: '2024-01-05',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    tags: ['Mental Health', 'Stress Management', 'Wellness', 'Mindfulness'],
    featured: false,
    views: 789,
    likes: 56
  },
  {
    id: 6,
    title: 'Senior Health: Maintaining Independence and Quality of Life',
    excerpt: 'Comprehensive guide to senior health, including mobility, nutrition, medication management, and strategies for maintaining independence and quality of life.',
    content: `
      <h2>Senior Health Priorities</h2>
      <p>As we age, maintaining health and independence becomes increasingly important. Focus on these key areas for optimal senior health.</p>
      
      <h3>Mobility and Physical Activity</h3>
      <p>Regular physical activity is crucial for seniors:</p>
      <ul>
        <li>Low-impact exercises like walking, swimming, or tai chi</li>
        <li>Strength training to maintain muscle mass</li>
        <li>Balance exercises to prevent falls</li>
        <li>Flexibility exercises for joint health</li>
        <li>Consult with healthcare providers before starting new exercise programs</li>
      </ul>
      
      <h3>Nutrition for Seniors</h3>
      <p>Proper nutrition supports overall health:</p>
      <ul>
        <li>Focus on nutrient-dense foods</li>
        <li>Ensure adequate protein intake</li>
        <li>Stay hydrated throughout the day</li>
        <li>Consider vitamin D and calcium supplements</li>
        <li>Eat regular, balanced meals</li>
      </ul>
      
      <h3>Medication Management</h3>
      <p>Many seniors take multiple medications:</p>
      <ul>
        <li>Use pill organizers to manage multiple medications</li>
        <li>Keep an updated medication list</li>
        <li>Review medications regularly with healthcare providers</li>
        <li>Be aware of potential interactions</li>
        <li>Store medications safely and check expiration dates</li>
      </ul>
      
      <h3>Preventive Care</h3>
      <p>Regular preventive care is essential:</p>
      <ul>
        <li>Annual physical examinations</li>
        <li>Recommended screenings (mammograms, colonoscopies, etc.)</li>
        <li>Vaccinations (flu, pneumonia, shingles)</li>
        <li>Dental and vision check-ups</li>
        <li>Hearing assessments</li>
      </ul>
      
      <h3>Safety and Independence</h3>
      <p>Maintain safety while preserving independence:</p>
      <ul>
        <li>Home safety assessments and modifications</li>
        <li>Emergency response systems</li>
        <li>Regular social engagement</li>
        <li>Mental stimulation through hobbies and learning</li>
        <li>Transportation planning for medical appointments</li>
      </ul>
    `,
    category: 'Senior Health',
    author: 'Dr. Patricia Martinez',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80',
    publishDate: '2024-01-03',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80',
    tags: ['Senior Health', 'Aging', 'Independence', 'Preventive Care'],
    featured: false,
    views: 432,
    likes: 34
  }
];

const CATEGORIES = ['All', 'Cardiovascular Health', 'Diabetes Management', 'Respiratory Health', 'Medication Safety', 'Mental Health', 'Senior Health'];

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArticles, setLikedArticles] = useState([]);
  const [articleLikes, setArticleLikes] = useState({});

  // Filter articles
  const filteredArticles = ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = ARTICLES.filter(article => article.featured);
  const recentArticles = ARTICLES.slice(0, 3);

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
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
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
                        {article.tags.slice(0, 2).map((tag, index) => (
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
                    {selectedArticle.tags.map((tag, index) => (
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