import React from 'react';
import { cn } from '@/lib/utils';
import OptimizedImage from './OptimizedImage';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'photo' | 'wide' | 'custom';
  customAspectRatio?: string;
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
  priority = false,
  fallbackSrc,
  aspectRatio = 'photo',
  customAspectRatio,
  breakpoints = {
    sm: '640',
    md: '768',
    lg: '1024',
    xl: '1280',
    '2xl': '1536'
  }
}) => {
  // Generate responsive srcSet
  const generateSrcSet = (baseSrc: string) => {
    const srcSetParts = [];
    
    // Add different sizes for responsive images
    Object.entries(breakpoints).forEach(([breakpoint, width]) => {
      if (width) {
        const size = parseInt(width);
        const resizedSrc = `${baseSrc}?w=${size}&h=${Math.round(size * getAspectRatioMultiplier())}&fit=crop&auto=format`;
        srcSetParts.push(`${resizedSrc} ${size}w`);
      }
    });
    
    // Add original size
    srcSetParts.push(`${baseSrc} 1920w`);
    
    return srcSetParts.join(', ');
  };

  // Get aspect ratio multiplier
  const getAspectRatioMultiplier = () => {
    switch (aspectRatio) {
      case 'square': return 1;
      case 'video': return 16/9;
      case 'photo': return 4/3;
      case 'wide': return 21/9;
      case 'custom': return customAspectRatio ? parseFloat(customAspectRatio) : 4/3;
      default: return 4/3;
    }
  };

  // Get aspect ratio CSS
  const getAspectRatioCSS = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'photo': return 'aspect-[4/3]';
      case 'wide': return 'aspect-[21/9]';
      case 'custom': return customAspectRatio ? `aspect-[${customAspectRatio}]` : 'aspect-[4/3]';
      default: return 'aspect-[4/3]';
    }
  };

  // Generate picture element with multiple sources
  const PictureElement = () => (
    <picture className={cn('block', getAspectRatioCSS(), className)}>
      {/* WebP format for modern browsers */}
      <source
        type="image/webp"
        srcSet={generateSrcSet(src.replace(/\.[^/.]+$/, '.webp'))}
        sizes={sizes}
      />
      
      {/* JPEG fallback */}
      <source
        type="image/jpeg"
        srcSet={generateSrcSet(src)}
        sizes={sizes}
      />
      
      {/* Fallback image */}
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        priority={priority}
        fallbackSrc={fallbackSrc}
        sizes={sizes}
      />
    </picture>
  );

  // Simple img element for basic usage
  const SimpleImage = () => (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn(getAspectRatioCSS(), 'object-cover', className)}
      priority={priority}
      fallbackSrc={fallbackSrc}
      sizes={sizes}
    />
  );

  // Use picture element for better performance and format support
  return <PictureElement />;
};

export default ResponsiveImage;
