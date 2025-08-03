import { BookOpen } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Blog() {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-[#f5fefd]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#57bbb6]/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center mb-6">
            <button 
              onClick={() => window.history.back()}
              className="absolute left-4 flex items-center gap-2 text-[#376f6b] hover:text-[#57bbb6] transition-colors duration-300 p-2 rounded-lg hover:bg-[#57bbb6]/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-normal text-[#376f6b] mb-4">Health & Wellness Blog</h1>
            <p className="text-xl text-[#376f6b] max-w-3xl mx-auto">
              Expert medical insights, health tips, and wellness advice to help you live a healthier life
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-[#57bbb6]/20">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#376f6b] to-[#57bbb6] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-[#376f6b] mb-6">
            Coming Soon
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#57bbb6] mb-8 font-medium">
            Health & Wellness Blog
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're preparing to share expert medical insights, health tips, and wellness advice 
            to help you live a healthier life. Our blog will feature articles from licensed pharmacists 
            and healthcare professionals.
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#376f6b] mb-2">Expert Articles</h3>
              <p className="text-sm text-gray-600">Written by licensed pharmacists and healthcare professionals</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#376f6b] mb-2">Health Tips</h3>
              <p className="text-sm text-gray-600">Practical advice for better health and wellness</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#376f6b] mb-2">Latest Research</h3>
              <p className="text-sm text-gray-600">Stay updated with the latest medical research and trends</p>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="bg-gradient-to-r from-[#376f6b] to-[#57bbb6] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Health Advice Now?</h3>
            <p className="text-lg mb-6 opacity-90">
              Our pharmacists are available for consultation and health advice
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:3473126458"
                className="bg-white text-[#376f6b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call (347) 312-6458
              </a>
              <a 
                href="mailto:info@mymedspharmacy.com"
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center gap-2 border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 