export function isFirefox(): boolean {
  if (typeof navigator === "undefined") return false;
  return /firefox/i.test(navigator.userAgent);
}

export interface BrowserQuality {
  pixelRatioCap: number;
  shadowMapType: number;
  msaaSamples: number;
}

export function getBrowserQuality(): BrowserQuality {
  const ff = isFirefox();
  return {
    pixelRatioCap: ff ? 1 : Math.min(window.devicePixelRatio, 2),
    shadowMapType: ff ? 1 : 2,
    msaaSamples: ff ? 0 : 4,
  };
}
