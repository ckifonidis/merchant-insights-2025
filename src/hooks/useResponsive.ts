import { useState, useEffect } from 'react';
import { UseResponsiveReturn } from '../types/hooks';

export const useResponsive = (): UseResponsiveReturn => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const checkScreenSize = (): void => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      setWidth(windowWidth);
      setHeight(windowHeight);
      setIsMobile(windowWidth < 768);
      setIsTablet(windowWidth >= 768 && windowWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    width,
    height
  };
};
