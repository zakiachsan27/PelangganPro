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
  private readonly DEBOUNCE_MS = 300;

  constructor(callback: ChatChangeCallback) {
    this.callback = callback;
  }

  /**
   * Start observing DOM changes
   */
  start(): void {
    if (this.observer) return;

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

    // Observe the main app container
    const appContainer = document.querySelector('#app');
    if (appContainer) {
      this.observer.observe(appContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-id', 'class', 'aria-label']
      });
    }

    // Also observe URL changes (for SPA navigation)
    this.observeUrlChanges();

    console.log('[PelangganPro] Chat observer started');
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

    console.log('[PelangganPro] Chat observer stopped');
  }

  /**
   * Check if currently in a valid chat
   */
  private checkForChanges(): void {
    const currentPhone = getValidIndividualChat();

    if (currentPhone !== this.lastPhone) {
      this.lastPhone = currentPhone;
      this.callback(currentPhone);
    }
  }

  /**
   * Observe URL changes using history API wrapper
   */
  private observeUrlChanges(): void {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleUrlChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleUrlChange();
    };

    window.addEventListener('popstate', () => {
      this.handleUrlChange();
    });
  }

  /**
   * Handle URL change
   */
  private handleUrlChange(): void {
    // Small delay to let WhatsApp render the new chat
    window.setTimeout(() => {
      this.checkForChanges();
    }, 100);
  }

  /**
   * Get current phone number
   */
  getCurrentPhone(): string | null {
    return this.lastPhone;
  }
}
