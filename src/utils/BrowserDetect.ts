export function isFirefox(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /firefox/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  return /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

export interface BrowserQuality {
  pixelRatioCap: number;
  shadowMapType: number;
  msaaSamples: number;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  starTwinkleEnabled: boolean;
}

export function getBrowserQuality(): BrowserQuality {
  const mobile = isMobile();
  if (mobile) {
    return {
      pixelRatioCap: Math.min(window.devicePixelRatio, 1),
      shadowMapType: 1,
      msaaSamples: 0,
      bloomStrength: 0.3,
      bloomRadius: 0.3,
      bloomThreshold: 0.4,
      starTwinkleEnabled: false,
    };
  }
  return {
    pixelRatioCap: Math.min(window.devicePixelRatio, 1.5),
    shadowMapType: 1,
    msaaSamples: 0,
    bloomStrength: 0.4,
    bloomRadius: 0.3,
    bloomThreshold: 0.3,
    starTwinkleEnabled: false,
  };
}
