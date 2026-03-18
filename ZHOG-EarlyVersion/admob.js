/**
 * AdMob Integration for Dead Zone: Escape
 * 
 * Handles rewarded ads for hints:
 * - Web/Desktop: Shows simulated countdown
 * - Android: Shows real AdMob rewarded video ads
 * 
 * Before publishing to Play Store, replace the test IDs with your real AdMob IDs!
 */

const AdManager = {
  // Configuration - REPLACE THESE BEFORE PUBLISHING!
  config: {
    // Test IDs (safe for development)
    appId: 'ca-app-pub-3940256099942544~3347511713',           // Test App ID
    rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917', // Test Rewarded Ad
    
    // Set to false for production
    testMode: true,
    
    // Simulated ad duration for web testing
    simulatedAdSeconds: 15
  },

  // State
  isNative: false,
  adLoaded: false,
  admobPlugin: null,

  /**
   * Initialize AdMob (call once at app startup)
   */
  async init() {
    // Check if running in Capacitor (native Android/iOS)
    this.isNative = typeof window !== 'undefined' && 
                    window.Capacitor?.isNativePlatform?.();

    if (!this.isNative) {
      console.log('AdMob: Running in web mode (simulated ads)');
      return true;
    }

    try {
      // Try to load the AdMob plugin
      const { AdMob } = await import('@capacitor-community/admob');
      this.admobPlugin = AdMob;

      await this.admobPlugin.initialize({
        testingDevices: this.config.testMode ? ['YOUR_TEST_DEVICE_ID'] : [],
        initializeForTesting: this.config.testMode,
      });

      // Set up event listeners
      this.admobPlugin.addListener('onRewardedVideoAdLoaded', () => {
        console.log('AdMob: Rewarded ad loaded');
        this.adLoaded = true;
      });

      this.admobPlugin.addListener('onRewardedVideoAdFailedToLoad', (error) => {
        console.error('AdMob: Failed to load rewarded ad', error);
        this.adLoaded = false;
      });

      // Preload first ad
      await this.preloadRewardedAd();
      
      console.log('AdMob: Initialized successfully');
      return true;
    } catch (error) {
      console.error('AdMob: Failed to initialize', error);
      return false;
    }
  },

  /**
   * Preload a rewarded ad
   */
  async preloadRewardedAd() {
    if (!this.isNative || !this.admobPlugin) return;

    try {
      await this.admobPlugin.prepareRewardedVideoAd({
        adId: this.config.rewardedAdUnitId,
      });
    } catch (error) {
      console.error('AdMob: Failed to preload ad', error);
    }
  },

  /**
   * Show a rewarded ad
   * @param {HTMLElement} overlayEl - The ad overlay element (for web simulation)
   * @param {HTMLElement} countdownEl - The countdown display element
   * @returns {Promise<boolean>} - true if user earned the reward
   */
  async showRewardedAd(overlayEl, countdownEl) {
    if (this.isNative && this.admobPlugin) {
      return this.showNativeAd();
    } else {
      return this.showSimulatedAd(overlayEl, countdownEl);
    }
  },

  /**
   * Show native AdMob rewarded ad
   */
  async showNativeAd() {
    return new Promise(async (resolve) => {
      try {
        if (!this.adLoaded) {
          await this.preloadRewardedAd();
          // Wait a moment for ad to load
          await new Promise(r => setTimeout(r, 1000));
        }

        let rewarded = false;

        // Listen for reward
        const rewardListener = this.admobPlugin.addListener(
          'onRewardedVideoAdReward', 
          () => {
            console.log('AdMob: User earned reward!');
            rewarded = true;
          }
        );

        // Listen for close
        const closeListener = this.admobPlugin.addListener(
          'onRewardedVideoAdClosed',
          () => {
            rewardListener.remove();
            closeListener.remove();
            this.adLoaded = false;
            this.preloadRewardedAd(); // Preload next ad
            resolve(rewarded);
          }
        );

        // Show the ad
        await this.admobPlugin.showRewardedVideoAd();
      } catch (error) {
        console.error('AdMob: Error showing ad', error);
        resolve(false);
      }
    });
  },

  /**
   * Show simulated ad for web testing
   */
  showSimulatedAd(overlayEl, countdownEl) {
    return new Promise((resolve) => {
      if (!overlayEl || !countdownEl) {
        console.error('AdMob: Overlay elements not found');
        resolve(false);
        return;
      }

      overlayEl.classList.remove('hidden');
      let seconds = this.config.simulatedAdSeconds;
      countdownEl.textContent = String(seconds);

      const timer = setInterval(() => {
        seconds--;
        countdownEl.textContent = String(seconds);

        if (seconds <= 0) {
          clearInterval(timer);
          overlayEl.classList.add('hidden');
          resolve(true); // User "watched" the ad
        }
      }, 1000);
    });
  },

  /**
   * Check if an ad is ready to show
   */
  isAdReady() {
    if (this.isNative) {
      return this.adLoaded;
    }
    return true; // Simulated ads are always "ready"
  }
};

// Export for use in game
window.AdManager = AdManager;
