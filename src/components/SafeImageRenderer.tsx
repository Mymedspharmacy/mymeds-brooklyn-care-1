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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (src: string) => {
    setImageErrors(prev => new Set(prev).add(src));
  };

  // Process content to replace img tags with SafeImageRenderer
  const processContent = (htmlContent: string) => {
    if (!htmlContent) return '';

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Find all img tags
    const imgTags = tempDiv.querySelectorAll('img');
    
    imgTags.forEach((img, index) => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const className = img.getAttribute('class') || '';
      
      // Skip if this image has already errored
      if (imageErrors.has(src)) {
        img.style.display = 'none';
        return;
      }

      // Create a wrapper div for the safe image
      const wrapper = document.createElement('div');
      wrapper.className = 'safe-image-wrapper';
      wrapper.setAttribute('data-src', src);
      wrapper.setAttribute('data-alt', alt);
      wrapper.setAttribute('data-class', className);
      wrapper.setAttribute('data-index', index.toString());
      
      // Replace the img with wrapper
      img.parentNode?.replaceChild(wrapper, img);
    });

    return tempDiv.innerHTML;
  };

  // Convert processed HTML to React elements
  const createReactElements = (htmlContent: string) => {
    const processedContent = processContent(htmlContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;

    const convertNodeToReact = (node: Node): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const props: any = {};

        // Copy attributes
        Array.from(element.attributes).forEach(attr => {
          props[attr.name] = attr.value;
        });

        // Handle safe image wrappers
        if (element.classList.contains('safe-image-wrapper')) {
          const src = element.getAttribute('data-src') || '';
          const alt = element.getAttribute('data-alt') || '';
          const imgClass = element.getAttribute('data-class') || '';
          
          return (
            <SafeImageRenderer
              key={`safe-img-${element.getAttribute('data-index')}`}
              src={src}
              alt={alt}
              className={imgClass}
              onError={() => handleImageError(src)}
              fallbackIcon={<AlertCircle className="h-6 w-6 text-gray-400" />}
            />
          );
        }

        // Convert children
        const children = Array.from(element.childNodes).map(convertNodeToReact);

        // Create React element
        return React.createElement(tagName, props, ...children);
      }

      return null;
    };

    return Array.from(tempDiv.childNodes).map((node, index) => 
      convertNodeToReact(node)
    );
  };

  return (
    <div className={className}>
      {createReactElements(content)}
    </div>
  );
};
