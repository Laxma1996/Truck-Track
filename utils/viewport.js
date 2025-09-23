// Viewport configuration for better mobile experience
export const viewportConfig = {
  // Set viewport meta tag for proper mobile rendering
  setViewportMeta: () => {
    if (typeof document !== 'undefined') {
      // Remove existing viewport meta tag if it exists
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (existingViewport) {
        existingViewport.remove();
      }

      // Create new viewport meta tag
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewport);
    }
  },

  // Prevent zoom on input focus (iOS Safari)
  preventZoomOnFocus: () => {
    if (typeof document !== 'undefined') {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          }
        });
        
        input.addEventListener('blur', () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
          }
        });
      });
    }
  },

  // Handle orientation changes
  handleOrientationChange: (callback) => {
    if (typeof window !== 'undefined') {
      const handleOrientationChange = () => {
        // Small delay to ensure the orientation change is complete
        setTimeout(() => {
          if (callback) {
            callback();
          }
        }, 100);
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    }
  },

  // Get current viewport dimensions
  getViewportDimensions: () => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      };
    }
    return { width: 0, height: 0, devicePixelRatio: 1 };
  },

  // Check if device is mobile
  isMobileDevice: () => {
    if (typeof window !== 'undefined') {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             window.innerWidth <= 768;
    }
    return false;
  },

  // Check if device supports touch
  isTouchDevice: () => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  },

  // Prevent double-tap zoom on mobile
  preventDoubleTapZoom: () => {
    if (typeof document !== 'undefined') {
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
    }
  },

  // Initialize all viewport optimizations
  initialize: () => {
    viewportConfig.setViewportMeta();
    viewportConfig.preventZoomOnFocus();
    viewportConfig.preventDoubleTapZoom();
  }
};

export default viewportConfig;
