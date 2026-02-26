import type { ExtractedPhone } from '../types';

function log(...args: any[]) {
  console.log('[PhoneExtractor]', ...args);
}

/**
 * Extract from profile drawer/left panel
 * This opens when clicking contact info in WhatsApp Web
 */
function extractFromProfileDrawer(): ExtractedPhone | null {
  // Look for profile drawer on the left
  const drawer = document.querySelector('[data-testid="drawer-left"]');
  if (!drawer) return null;
  
  log('Profile drawer found');
  
  // Look for phone number in the drawer
  // Usually it's in a span or div with phone text
  const textElements = drawer.querySelectorAll('span, div');
  
  for (const el of textElements) {
    const text = el.textContent || '';
    
    // Match phone patterns: +62, 62, 08, etc.
    const phoneMatch = text.match(/[\+]?62[\d\s\-\(\)]{8,15}/) || 
                       text.match(/0[8][\d\s\-\(\)]{8,12}/);
    
    if (phoneMatch) {
      const raw = phoneMatch[0].replace(/\D/g, '');
      if (raw.length >= 10 && raw.length <= 15) {
        log('Found phone in profile drawer:', raw);
        return {
          raw,
          normalized: normalizePhone(raw),
          source: 'profile-drawer'
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract from data-id attributes
 */
function extractFromDataId(): ExtractedPhone | null {
  // Find all elements with data-id
  const elements = document.querySelectorAll('[data-id]');
  
  for (const el of elements) {
    const dataId = el.getAttribute('data-id');
    if (!dataId) continue;
    
    // Individual chat format: "6281234567890@c.us"
    if (dataId.includes('@c.us')) {
      const match = dataId.match(/(\d+)@c\.us/);
      if (match) {
        const raw = match[1];
        log('Found phone in data-id:', raw);
        return {
          raw,
          normalized: normalizePhone(raw),
          source: 'data-id'
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract from header/subtitle
 */
function extractFromHeader(): ExtractedPhone | null {
  const header = document.querySelector('header');
  if (!header) return null;
  
  const text = header.textContent || '';
  
  // Look for phone patterns
  const patterns = [
    /[+]62\s*[\d\s\-]{8,15}/,
    /62[\d\s\-]{9,13}/,
    /0[8][\d\s\-]{8,11}/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[0].replace(/\D/g, '');
      if (raw.length >= 10 && raw.length <= 15) {
        log('Found phone in header:', raw);
        return {
          raw,
          normalized: normalizePhone(raw),
          source: 'header-text'
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract from active chat in sidebar
 */
function extractFromActiveChat(): ExtractedPhone | null {
  const chatItems = document.querySelectorAll('[data-testid="cell-frame-container"]');
  
  for (const item of chatItems) {
    // Check if active/selected
    const isSelected = item.getAttribute('aria-selected') === 'true';
    const hasBackground = window.getComputedStyle(item).backgroundColor !== 'rgba(0, 0, 0, 0)';
    
    if (isSelected || hasBackground) {
      const dataId = item.getAttribute('data-id');
      if (dataId && dataId.includes('@c.us')) {
        const match = dataId.match(/(\d+)@c\.us/);
        if (match) {
          log('Found phone in active chat:', match[1]);
          return {
            raw: match[1],
            normalized: normalizePhone(match[1]),
            source: 'active-chat'
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Normalize phone number
 */
export function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

/**
 * Main extract function
 */
export function extractPhone(): ExtractedPhone | null {
  log('Starting extraction...');
  
  // Try profile drawer first (most reliable when open)
  let result = extractFromProfileDrawer();
  if (result) return result;
  
  // Try data-id
  result = extractFromDataId();
  if (result) return result;
  
  // Try header
  result = extractFromHeader();
  if (result) return result;
  
  // Try active chat
  result = extractFromActiveChat();
  if (result) return result;
  
  log('All methods failed');
  return null;
}

/**
 * Check if valid individual chat
 */
export function getValidIndividualChat(): string | null {
  const phone = extractPhone();
  
  if (!phone) return null;
  
  // Check if it's a group
  const groupElements = document.querySelectorAll('[data-id*="@g.us"]');
  for (const el of groupElements) {
    const dataId = el.getAttribute('data-id');
    if (dataId) {
      const match = dataId.match(/(\d+)/);
      if (match && match[1] === phone.raw) {
        log('Rejected: is a group chat');
        return null;
      }
    }
  }
  
  if (phone.normalized.length > 15) {
    log('Rejected: too long');
    return null;
  }
  
  return phone.normalized;
}
