/**
 * Device Detection Utilities
 * Browser and device detection utilities for responsive design
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  browser: string;
  os: string;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  touchSupported: boolean;
  retina: boolean;
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
}

/**
 * Get comprehensive device information
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  
  // Device type detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth < 768;
  const isTablet = /iPad|Android.*(?!.*Mobile)/i.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024);
  const isDesktop = !isMobile && !isTablet;
  
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) type = 'mobile';
  else if (isTablet) type = 'tablet';
  
  // Browser detection
  const browser = getBrowserName();
  
  // OS detection
  const os = getOperatingSystem();
  
  // Screen size
  const screenSize = getScreenSize();
  
  // Touch support
  const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Retina display
  const retina = window.devicePixelRatio > 1;
  
  return {
    type,
    isMobile,
    isTablet,
    isDesktop,
    browser,
    os,
    screenSize,
    touchSupported,
    retina
  };
}

/**
 * Detect browser name
 */
export function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Trident') || userAgent.includes('MSIE')) return 'Internet Explorer';
  
  return 'Unknown';
}

/**
 * Get detailed browser information
 */
export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  let engine = 'Unknown';
  
  // Browser detection with version
  if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Gecko';
  } else if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'WebKit';
  } else if (userAgent.includes('Edge')) {
    name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'EdgeHTML';
  }
  
  return { name, version, engine };
}

/**
 * Detect operating system
 */
export function getOperatingSystem(): string {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  if (/Win/i.test(platform)) return 'Windows';
  if (/Mac/i.test(platform)) return 'macOS';
  if (/Linux/i.test(platform)) return 'Linux';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  
  return 'Unknown';
}

/**
 * Get screen size category
 */
export function getScreenSize(): 'small' | 'medium' | 'large' | 'xlarge' {
  const width = window.screen.width;
  
  if (width < 640) return 'small';    // sm
  if (width < 1024) return 'medium';  // md
  if (width < 1440) return 'large';   // lg
  return 'xlarge';                    // xl
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is tablet
 */
export function isTabletDevice(): boolean {
  return /iPad|Android.*(?!.*Mobile)/i.test(navigator.userAgent);
}

/**
 * Check if device is desktop
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice() && !isTabletDevice();
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if device has retina display
 */
export function isRetinaDisplay(): boolean {
  return window.devicePixelRatio > 1;
}

/**
 * Get viewport dimensions
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * Get screen dimensions
 */
export function getScreenDimensions(): { width: number; height: number } {
  return {
    width: window.screen.width,
    height: window.screen.height
  };
}

/**
 * Check if device is in portrait orientation
 */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

/**
 * Get device orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  return isPortrait() ? 'portrait' : 'landscape';
}

/**
 * Check if browser supports a specific feature
 */
export function supportsFeature(feature: string): boolean {
  switch (feature.toLowerCase()) {
    case 'webgl':
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    
    case 'websocket':
      return 'WebSocket' in window;
    
    case 'localstorage':
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch {
        return false;
      }
    
    case 'sessionstorage':
      try {
        return 'sessionStorage' in window && window.sessionStorage !== null;
      } catch {
        return false;
      }
    
    case 'indexeddb':
      return 'indexedDB' in window;
    
    case 'serviceworker':
      return 'serviceWorker' in navigator;
    
    case 'geolocation':
      return 'geolocation' in navigator;
    
    case 'camera':
      return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    
    case 'notifications':
      return 'Notification' in window;
    
    case 'clipboard':
      return 'clipboard' in navigator;
    
    default:
      return false;
  }
}

/**
 * Get network connection information
 */
export function getNetworkInfo(): {
  online: boolean;
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  return {
    online: navigator.onLine,
    type: connection?.type,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt
  };
}

/**
 * Detect if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get battery information (if supported)
 */
export async function getBatteryInfo(): Promise<{
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
} | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const battery = await nav.getBattery?.();
    if (battery) {
      return {
        charging: battery.charging,
        level: battery.level,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    }
  } catch {
    // Battery API not supported
  }
  return null;
}

/**
 * Device detection utilities object
 */
export const device = {
  info: getDeviceInfo,
  isMobile: isMobileDevice,
  isTablet: isTabletDevice,
  isDesktop: isDesktopDevice,
  isTouch: isTouchDevice,
  isRetina: isRetinaDisplay,
  browser: getBrowserInfo,
  os: getOperatingSystem,
  viewport: getViewportSize,
  screen: getScreenDimensions,
  orientation: getOrientation,
  supports: supportsFeature,
  network: getNetworkInfo,
  darkMode: prefersDarkMode,
  reducedMotion: prefersReducedMotion,
  battery: getBatteryInfo
};

// Alias exports for compatibility
export const isMobile = isMobileDevice;
export const isTablet = isTabletDevice;
export const isDesktop = isDesktopDevice;

// Export default
const deviceDetection = {
  getDeviceInfo,
  getBrowserName,
  getBrowserInfo,
  getOperatingSystem,
  getScreenSize,
  isMobileDevice,
  isTabletDevice,
  isDesktopDevice,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  isRetinaDisplay,
  getViewportSize,
  getScreenDimensions,
  isPortrait,
  isLandscape,
  getOrientation,
  supportsFeature,
  getNetworkInfo,
  prefersDarkMode,
  prefersReducedMotion,
  getBatteryInfo,
  device
};

export default deviceDetection;
