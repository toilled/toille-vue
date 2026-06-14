export function isFirefox(): boolean {
  if (typeof navigator === "undefined") return false;
  return /firefox/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
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
  const ff = isFirefox();
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
    pixelRatioCap: ff ? 1 : Math.min(window.devicePixelRatio, 2),
    shadowMapType: ff ? 1 : 2,
    msaaSamples: ff ? 0 : 4,
    bloomStrength: ff ? 0.8 : 1.2,
    bloomRadius: 0.6,
    bloomThreshold: 0.3,
    starTwinkleEnabled: true,
  };
}
