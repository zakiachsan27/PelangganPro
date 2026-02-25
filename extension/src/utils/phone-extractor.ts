import type { ExtractedPhone } from '../types';

// Multiple strategies to extract phone number from WhatsApp Web
// WhatsApp DOM changes often, so we use multiple fallback strategies

const STRATEGIES = [
  // Strategy 1: From URL pathname (most reliable)
  // URL pattern: https://web.whatsapp.com/send?phone=6281234567890
  // or: https://web.whatsapp.com/c/6281234567890
  (): ExtractedPhone | null => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Try query param first
    const phoneMatch = search.match(/[?&]phone=(\d+)/);
    if (phoneMatch) {
      const raw = phoneMatch[1];
      return {
        raw,
        normalized: normalizePhone(raw),
        source: 'url'
      };
    }
    
    // Try pathname pattern /c/{phone}
    const pathMatch = pathname.match(/\/c\/(\d+)/);
    if (pathMatch) {
      const raw = pathMatch[1];
      return {
        raw,
        normalized: normalizePhone(raw),
        source: 'url'
      };
    }
    
    return null;
  },

  // Strategy 2: From header data-id or data-chat-id attribute
  (): ExtractedPhone | null => {
    const selectors = [
      '[data-testid="conversation-header"] [data-id]',
      '[data-testid="conversation-info-header"] [data-id]',
      '[data-icon="default-user"]',
      'header [data-id]'
    ];
    
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const dataId = el?.getAttribute('data-id') || el?.parentElement?.getAttribute('data-id');
      
      if (dataId) {
        // data-id format: "6281234567890@c.us" or just "6281234567890"
        const match = dataId.match(/(\d+)/);
        if (match) {
          const raw = match[1];
          return {
            raw,
            normalized: normalizePhone(raw),
            source: 'header'
          };
        }
      }
    }
    
    return null;
  },

  // Strategy 3: From aria-label containing phone number
  (): ExtractedPhone | null => {
    const selectors = [
      '[aria-label*="+"]',
      '[aria-label*="62"]',
      '[title*="+"]',
      '[title*="62"]'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const el of elements) {
        const text = el.getAttribute('aria-label') || el.getAttribute('title') || '';
        // Match phone patterns: +62, 62, 08, etc
        const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]+/);
        
        if (phoneMatch) {
          const raw = phoneMatch[0].replace(/\D/g, '');
          if (raw.length >= 10) { // Minimum phone length
            return {
              raw,
              normalized: normalizePhone(raw),
              source: 'aria-label'
            };
          }
        }
      }
    }
    
    return null;
  },

  // Strategy 4: From profile drawer/info panel
  (): ExtractedPhone | null => {
    const phoneElements = document.querySelectorAll(
      '[data-testid="drawer-left"] span, [data-testid="contact-info"] span'
    );
    
    for (const el of phoneElements) {
      const text = el.textContent || '';
      const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]+/);
      
      if (phoneMatch) {
        const raw = phoneMatch[0].replace(/\D/g, '');
        if (raw.length >= 10 && raw.length <= 15) {
          return {
            raw,
            normalized: normalizePhone(raw),
            source: 'header'
          };
        }
      }
    }
    
    return null;
  }
];

/**
 * Normalize phone number to standard format (62xxxxxxxxxxx)
 */
export function normalizePhone(raw: string): string {
  // Remove all non-digits
  let cleaned = raw.replace(/\D/g, '');
  
  // Handle Indonesian phone formats
  if (cleaned.startsWith('0')) {
    // 08123456789 -> 628123456789
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    // 8123456789 -> 628123456789
    cleaned = '62' + cleaned;
  } else if (cleaned.startsWith('62')) {
    // Already correct format
    cleaned = cleaned;
  }
  
  return cleaned;
}

/**
 * Extract phone number from current WhatsApp Web page
 */
export function extractPhone(): ExtractedPhone | null {
  for (const strategy of STRATEGIES) {
    try {
      const result = strategy();
      if (result) {
        return result;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }
  
  return null;
}

/**
 * Check if current page is a valid chat (not status, not group)
 * Returns phone number if valid individual chat
 */
export function getValidIndividualChat(): string | null {
  const phone = extractPhone();
  
  if (!phone) return null;
  
  // Check if it's a group (group IDs usually contain a hyphen or are longer)
  // WhatsApp group IDs: xxxxxx-xxxxx@g.us
  if (phone.normalized.length > 15) {
    return null;
  }
  
  // Check for status broadcast
  if (window.location.pathname.includes('status')) {
    return null;
  }
  
  return phone.normalized;
}
