/**
 * Parse a hex color string to RGB values.
 * Handles #RGB, #RRGGBB, #RGBA, #RRGGBBAA formats.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')

  // #RGB → #RRGGBB
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    }
  }

  // #RRGGBB or #RRGGBBAA
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    }
  }

  return null
}

/**
 * Calculate relative luminance using the WCAG formula.
 * Returns 0 (darkest) to 1 (lightest).
 */
function calculateLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export interface BlockContrastColors {
  /** Main text color class (title, primary info) */
  textClass: string
  /** Muted/secondary text color class (time, descriptions) */
  mutedTextClass: string
  /** Energy badge styling classes */
  badgeClass: string
}

/**
 * Given a background color string (hex), returns Tailwind classes
 * for text and badge elements that provide sufficient contrast.
 *
 * Falls back to light-on-dark (white text) for unparseable colors
 * like CSS custom properties.
 */
export function getContrastColors(bgColor: string): BlockContrastColors {
  const rgb = hexToRgb(bgColor)

  if (!rgb) {
    // Can't parse — assume dark background (safe fallback)
    return {
      textClass: 'text-white',
      mutedTextClass: 'text-white/80',
      badgeClass: 'bg-white/20 text-white/90',
    }
  }

  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b)

  if (luminance > 0.5) {
    // Light background → dark text
    return {
      textClass: 'text-[#1a1f2e]',
      mutedTextClass: 'text-[#1a1f2e]/70',
      badgeClass: 'bg-black/10 text-[#1a1f2e]/90',
    }
  }

  // Dark background → light text
  return {
    textClass: 'text-white',
    mutedTextClass: 'text-white/80',
    badgeClass: 'bg-white/20 text-white/90',
  }
}
