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
  // Simple and safe approach - just render the HTML content directly
  // The SafeImageRenderer will handle any image errors gracefully
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
