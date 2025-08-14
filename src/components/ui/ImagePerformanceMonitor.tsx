import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface ImagePerformanceData {
  src: string;
  loadTime: number;
  size: number;
  format: string;
  status: 'success' | 'error' | 'loading';
  timestamp: number;
}

interface PerformanceMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  totalSize: number;
  performanceScore: number;
}

export const ImagePerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<ImagePerformanceData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalSize: 0,
    performanceScore: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for custom image performance events
    const handleImagePerformance = (event: CustomEvent) => {
      const data: ImagePerformanceData = event.detail;
      setPerformanceData(prev => [...prev, data]);
    };

    window.addEventListener('image-performance', handleImagePerformance as EventListener);

    return () => {
      window.removeEventListener('image-performance', handleImagePerformance as EventListener);
    };
  }, []);

  useEffect(() => {
    if (performanceData.length > 0) {
      calculateMetrics();
    }
  }, [performanceData]);

  const calculateMetrics = () => {
    const totalImages = performanceData.length;
    const loadedImages = performanceData.filter(img => img.status === 'success').length;
    const failedImages = performanceData.filter(img => img.status === 'error').length;
    
    const successfulLoads = performanceData.filter(img => img.status === 'success');
    const averageLoadTime = successfulLoads.length > 0 
      ? successfulLoads.reduce((sum, img) => sum + img.loadTime, 0) / successfulLoads.length 
      : 0;
    
    const totalSize = performanceData.reduce((sum, img) => sum + img.size, 0);
    
    // Calculate performance score (0-100)
    const loadTimeScore = Math.max(0, 100 - (averageLoadTime / 100)); // Penalize slow loads
    const successRateScore = (loadedImages / totalImages) * 100;
    const sizeScore = Math.max(0, 100 - (totalSize / 1024 / 1024)); // Penalize large total size
    
    const performanceScore = Math.round((loadTimeScore + successRateScore + sizeScore) / 3);

    setMetrics({
      totalImages,
      loadedImages,
      failedImages,
      averageLoadTime,
      totalSize,
      performanceScore
    });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-[#57BBB6] hover:bg-[#376F6B] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        title="Image Performance Monitor"
      >
        <BarChart3 className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#57BBB6]" />
              <span>Image Performance</span>
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Performance Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getPerformanceColor(metrics.performanceScore)} text-white text-2xl font-bold mb-2`}>
              {metrics.performanceScore}
            </div>
            <p className="text-sm text-gray-600">{getPerformanceLabel(metrics.performanceScore)}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{metrics.loadedImages}</span>
              </div>
              <p className="text-xs text-gray-600">Loaded</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{metrics.failedImages}</span>
              </div>
              <p className="text-xs text-gray-600">Failed</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg Load Time:</span>
              <span className="font-medium">{formatTime(metrics.averageLoadTime)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Size:</span>
              <span className="font-medium">{formatBytes(metrics.totalSize)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">
                {metrics.totalImages > 0 ? Math.round((metrics.loadedImages / metrics.totalImages) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Recent Images */}
          {performanceData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Images</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {performanceData.slice(-5).map((img, index) => (
                  <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <span className="truncate flex-1 mr-2" title={img.src}>
                      {img.src.split('/').pop()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={img.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {img.status === 'success' ? '✓' : '✗'}
                      </Badge>
                      <span className="text-gray-500">{formatTime(img.loadTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Performance Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use WebP format when possible</li>
              <li>• Optimize image sizes for devices</li>
              <li>• Implement lazy loading</li>
              <li>• Use CDN for faster delivery</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagePerformanceMonitor;
