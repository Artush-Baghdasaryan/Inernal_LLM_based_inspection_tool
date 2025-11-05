/**
 * Centralized SVG icons repository
 * All SVG icons used in the application are defined here
 */

export const SvgIcons = {
    // Close/X icon
    close: (
        width: string | number = 24,
        height: string | number = 24,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
    },

    // Settings/Gear icon
    settings: (
        width: string | number = 24,
        height: string | number = 24,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m16.66-5.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m11.31 0l-4.24-4.24m4.24-4.24l-4.24-4.24"/>
    </svg>`;
    },

    // Logo icon
    logo: (
        width: string | number = 32,
        height: string | number = 32,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 120 120" class="logo-icon">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="55" fill="none" stroke="url(#logoGradient)" stroke-width="2" opacity="0.3"/>
      <path d="M30 60 L50 40 L70 60 L50 80 Z" fill="url(#logoGradient)" opacity="0.8"/>
      <circle cx="60" cy="60" r="15" fill="url(#logoGradient)"/>
      <circle cx="60" cy="60" r="8" fill="#fff" opacity="0.9"/>
    </svg>`;
    },

    // Arrow right icon
    arrowRight: (
        width: string | number = 20,
        height: string | number = 20,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    },

    // Remove/Delete icon
    remove: (
        width: string | number = 16,
        height: string | number = 16,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>`;
    },

    // Chevron down icon
    chevronDown: (
        width: string | number = 16,
        height: string | number = 16,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>`;
    },

    // Chevron right icon
    chevronRight: (
        width: string | number = 16,
        height: string | number = 16,
    ): string => {
        return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>`;
    },
} as const;
