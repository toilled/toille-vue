function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 204';
}

export function pageStyleVars(accent: string): Record<string, string> {
  return {
    '--page-accent': accent,
    '--page-accent-rgb': hexToRgb(accent),
  };
}

const ACCENT_CLASSES = ['fullstack', 'ux', 'interactive'] as const;

export function accentClass(index: number): string {
  return ACCENT_CLASSES[index % ACCENT_CLASSES.length];
}
