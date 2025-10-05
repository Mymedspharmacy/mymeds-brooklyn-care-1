import React, { useState } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface SafeImageRendererProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
}

export const SafeImageRenderer: React.FC<SafeImageRendererProps> = ({
  src,
  alt = '',
  className = '',
  fallbackIcon,
  onError
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        {fallbackIcon || <ImageIcon className="h-8 w-8" />}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57BBB6]"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

interface SafeContentRendererProps {
  content: string;
  className?: string;
}

export const SafeContentRenderer: React.FC<SafeContentRendererProps> = ({
  content,
  className = ''
}) => {
  // Process content to handle images safely using regex instead of DOM manipulation
  const processContent = (htmlContent: string) => {
    if (!htmlContent) return '';
    
    // Use regex to find and modify img tags
    return htmlContent.replace(/<img([^>]*)>/gi, (match, attributes) => {
      // Extract src attribute
      const srcMatch = attributes.match(/src\s*=\s*["']([^"']+)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      
      // Add error handling and loading attributes
      let newAttributes = attributes;
      
      // Add onerror handler if not present
      if (!newAttributes.includes('onerror')) {
        newAttributes += ' onerror="this.style.display=\'none\';"';
      }
      
      // Add loading attribute if not present
      if (!newAttributes.includes('loading')) {
        newAttributes += ' loading="lazy"';
      }
      
      // Add error handling classes
      if (!newAttributes.includes('class=')) {
        newAttributes += ' class="max-w-full h-auto rounded-lg"';
      } else {
        newAttributes = newAttributes.replace(/class\s*=\s*["']([^"']*)["']/i, (classMatch, classValue) => {
          return `class="${classValue} max-w-full h-auto rounded-lg"`;
        });
      }
      
      return `<img${newAttributes}>`;
    });
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};
