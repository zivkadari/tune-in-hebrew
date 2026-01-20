import { useState, useEffect } from 'react';

interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  hasNotch: boolean;
  safeAreaTop: number;
}

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    hasNotch: false,
    safeAreaTop: 40
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    
    // Check for notch based on screen ratio (iPhone X and later have ratio > 2)
    const screenRatio = window.screen.height / window.screen.width;
    const hasNotch = isIOS && screenRatio > 2;
    
    // Calculate safe area top based on device type
    let safeAreaTop = 40; // Default fallback
    
    if (hasNotch) {
      // iPhone with notch (X, 11, 12, 13, 14, 15, 16)
      safeAreaTop = 59;
    } else if (isIOS) {
      // Older iPhone or iPad
      safeAreaTop = 44;
    } else if (isAndroid) {
      // Android devices
      safeAreaTop = 48;
    }
    
    setDeviceInfo({
      isIOS,
      isAndroid,
      hasNotch,
      safeAreaTop
    });
  }, []);

  return deviceInfo;
}
