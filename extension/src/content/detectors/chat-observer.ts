import { getValidIndividualChat } from '../../utils/phone-extractor';

export type ChatChangeCallback = (phone: string | null) => void;

/**
 * Observes WhatsApp Web DOM changes to detect chat switches
 */
export class ChatObserver {
  private observer: MutationObserver | null = null;
  private lastPhone: string | null = null;
  private callback: ChatChangeCallback;
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_MS = 200;
  private checkInterval: number | null = null;

  constructor(callback: ChatChangeCallback) {
    this.callback = callback;
  }

  /**
   * Start observing DOM changes
   */
  start(): void {
    if (this.observer) return;

    console.log('[ChatObserver] Starting...');

    // Initial check
    this.checkForChanges();

    // Create mutation observer
    this.observer = new MutationObserver((mutations) => {
      // Debounce to avoid excessive checks
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        this.checkForChanges();
      }, this.DEBOUNCE_MS);
    });

    // Observe the entire document for changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-id', 'data-testid']
    });

    console.log('[ChatObserver] Observer attached to document.body');

    // Periodic check as fallback (every 1 second)
    this.checkInterval = window.setInterval(() => {
      this.checkForChanges();
    }, 1000);

    console.log('[ChatObserver] Started successfully');
  }

  /**
   * Stop observing
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('[ChatObserver] Stopped');
  }

  /**
   * Check if currently in a valid chat
   */
  private checkForChanges(): void {
    const currentPhone = getValidIndividualChat();

    if (currentPhone !== this.lastPhone) {
      console.log('[ChatObserver] Phone changed:', {
        from: this.lastPhone,
        to: currentPhone
      });
      this.lastPhone = currentPhone;
      this.callback(currentPhone);
    }
  }

  /**
   * Get current phone number
   */
  getCurrentPhone(): string | null {
    return this.lastPhone;
  }
}
