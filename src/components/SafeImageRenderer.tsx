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
  // Process content to handle images safely
  const processContent = (htmlContent: string) => {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all img tags and add error handling
    const imgTags = tempDiv.querySelectorAll('img');
    imgTags.forEach((img) => {
      const originalSrc = img.getAttribute('src');
      if (originalSrc) {
        // Add error handling to images
        img.onerror = function() {
          this.style.display = 'none';
        };
        // Add loading attribute
        img.setAttribute('loading', 'lazy');
      }
    });
    
    return tempDiv.innerHTML;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};
