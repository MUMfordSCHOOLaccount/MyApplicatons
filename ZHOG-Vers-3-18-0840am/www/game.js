/**
 * Dead Zone: Escape - A Zombie Hidden Object Game
 * 
 * Find hidden objects, manage your supplies, and survive the zombie apocalypse!
 * 
 * Features:
 * - 10 levels with story progression
 * - Touch + mouse support for mobile/desktop
 * - Backpack inventory system
 * - Encounters that require specific items
 * - Cutscenes between levels
 * - Hint system with ad support (simulated/AdMob)
 */

(async function() {
  'use strict';

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const elements = {
    itemList: document.getElementById('itemList'),
    backpackUI: document.getElementById('backpackUI'),
    hintBtn: document.getElementById('hintBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    proceedBtn: document.getElementById('proceedBtn'),
    adOverlay: document.getElementById('adOverlay'),
    adCountdown: document.getElementById('adCountdown'),
    completeOverlay: document.getElementById('completeOverlay'),
    introOverlay: document.getElementById('introOverlay'),
    introImage: document.getElementById('introImage'),
    introText: document.getElementById('introText'),
    skipIntroBtn: document.getElementById('skipIntroBtn'),
    continueIntroBtn: document.getElementById('continueIntroBtn'),
    deathOverlay: document.getElementById('deathOverlay'),
    deathReason: document.getElementById('deathReason'),
    restartFromDeathBtn: document.getElementById('restartFromDeathBtn'),
    devOverlay: document.getElementById('devOverlay'),
    devMenuBtn: document.getElementById('devMenuBtn'),
    closeDevBtn: document.getElementById('closeDevBtn'),
    revealAllBtn: document.getElementById('revealAllBtn'),
    levelButtons: document.getElementById('levelButtons'),
    levelTitle: document.getElementById('levelTitle')
  };

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    // Device detection
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isCapacitor: typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.(),
    DPR: Math.max(1, window.devicePixelRatio || 1),

    // Gameplay settings
    CLICK_TOLERANCE: 0, // Set dynamically based on device
    ITEM_MIN_DISTANCE: 0,
    HINT_DURATION_MS: 5000,
    AD_SECONDS: 15,

    // Display
    SHOW_INTRO: true,
    DEBUG_MODE: false
  };

  // Adjust for mobile - slightly larger touch targets
  CONFIG.CLICK_TOLERANCE = CONFIG.isMobile ? 28 : 20;
  CONFIG.ITEM_MIN_DISTANCE = CONFIG.isMobile ? 40 : 35;

  // ============================================
  // GAME STATE
  // ============================================
  const state = {
    level: 1,
    items: [],
    foundCount: 0,
    levelSeed: 0,
    running: false,
    adPlaying: false,
    bgImage: null,
    levelConfigs: null,
    backpack: {
      Weapon: [],
      Food: [],
      Water: [],
      Supplies: [],
      Misc: []
    },
    devModeVisible: false,
    introCancelled: false
    ,
    backpackCapacity: 12
  };

  // Persistent items across playthroughs (names)
  state.persistentItems = new Set();

  // ============================================
  // CATEGORIES
  // ============================================
  const CATEGORY = {
    WEAPON: 'Weapon',
    FOOD: 'Food',
    WATER: 'Water',
    SUPPLIES: 'Supplies',
    MISC: 'Misc'
  };

  // ============================================
  // ITEM DEFINITIONS
  // ============================================
  const ITEM_POOL = {
    weapons: [
      { name: 'Chainsaw', iconPath: 'assets/secrets/secretitems/ChainSaw.png', category: CATEGORY.WEAPON, rarity: 0.25, size: 2 },
      { name: 'Fire Axe', iconPath: 'assets/icons/WeaponObjects/FiremansAxe.png', category: CATEGORY.WEAPON, rarity: 0.5 },
      { name: 'Pistol', iconPath: 'assets/icons/WeaponObjects/glock.png', category: CATEGORY.WEAPON, rarity: 0.5 },
      { name: 'Crossbow', iconPath: 'assets/icons/WeaponObjects/crossbow.png', category: CATEGORY.WEAPON, rarity: 0.6 },
      { name: 'Combat Knife', iconPath: 'assets/icons/WeaponObjects/combatknife.png', category: CATEGORY.WEAPON, rarity: 0.8 },
      { name: 'Combat Axe', iconPath: 'assets/icons/WeaponObjects/CombatAxe.png', category: CATEGORY.WEAPON, rarity: 0.6 },
      { name: 'Broom', iconPath: 'assets/icons/WeaponObjects/Broom.png', category: CATEGORY.WEAPON, rarity: 1.0 },
      { name: 'Bow', iconPath: 'assets/icons/WeaponObjects/Bow.png', category: CATEGORY.WEAPON, rarity: 0.7 },
      { name: 'Bomb', iconPath: 'assets/icons/WeaponObjects/Bomb.png', category: CATEGORY.WEAPON, rarity: 0.25 },
      { name: 'Rifle', iconPath: 'assets/icons/WeaponObjects/WW2Rifle.png', category: CATEGORY.WEAPON, rarity: 0.4 },
      { name: 'Sledgehammer', iconPath: 'assets/icons/WeaponObjects/Sledge.png', category: CATEGORY.WEAPON, rarity: 0.7 },
      { name: 'Scissors', iconPath: 'assets/icons/WeaponObjects/scissors.png', category: CATEGORY.WEAPON, rarity: 1.0 },
      { name: 'Revolver', iconPath: 'assets/icons/WeaponObjects/Revolver.png', category: CATEGORY.WEAPON, rarity: 0.5 },
      { name: 'Kitchen Knife', iconPath: 'assets/icons/WeaponObjects/kitchenknife.png', category: CATEGORY.WEAPON, rarity: 0.9 }
    ],
    food: [
      { name: 'Bacon', iconPath: 'assets/icons/FoodObjects/Bacon.png', category: CATEGORY.FOOD, rarity: 0.6 },
      { name: 'Grill', iconPath: 'assets/icons/FoodObjects/Grill.png', category: CATEGORY.FOOD, rarity: 0.4 },
      { name: 'Hamburger', iconPath: 'assets/icons/FoodObjects/hamburger.png', category: CATEGORY.FOOD, rarity: 0.8 }
    ],
    water: [
      { name: 'Canteen', iconPath: 'assets/icons/WaterObjects/canteen.png', category: CATEGORY.WATER, rarity: 0.6 },
      { name: 'Water Bottle', iconPath: 'assets/icons/WaterObjects/BottleWaterr.png', category: CATEGORY.WATER, rarity: 0.8 },
      { name: 'Coffee', iconPath: 'assets/icons/WaterObjects/Coffee.png', category: CATEGORY.WATER, rarity: 0.7 },
      { name: 'Espresso', iconPath: 'assets/icons/WaterObjects/Expresso.png', category: CATEGORY.WATER, rarity: 0.5 },
      { name: 'Dirty Water', iconPath: 'assets/icons/WaterObjects/DirtyWater.png', category: CATEGORY.WATER, rarity: 1.0 }
    ],
    supplies: [
      { name: 'Binoculars', iconPath: 'assets/icons/RandomObjects/Binos.png', category: CATEGORY.SUPPLIES, rarity: 0.6 },
      { name: 'Body Armor', iconPath: 'assets/icons/RandomObjects/BodyArmor.png', category: CATEGORY.SUPPLIES, rarity: 0.3 },
      { name: 'Books', iconPath: 'assets/icons/RandomObjects/Books.png', category: CATEGORY.SUPPLIES, rarity: 1.0 },
      { name: 'Brick', iconPath: 'assets/icons/RandomObjects/Brick.png', category: CATEGORY.SUPPLIES, rarity: 1.0 },
      { name: 'Cement', iconPath: 'assets/icons/RandomObjects/Cement.png', category: CATEGORY.SUPPLIES, rarity: 0.5 },
      { name: 'Flashlight', iconPath: 'assets/icons/RandomObjects/Flashlight.png', category: CATEGORY.SUPPLIES, rarity: 0.7 },
      { name: 'Hammer', iconPath: 'assets/icons/RandomObjects/Hammer.png', category: CATEGORY.SUPPLIES, rarity: 0.8 },
      { name: 'Hammock', iconPath: 'assets/icons/RandomObjects/Hammock.png', category: CATEGORY.SUPPLIES, rarity: 0.4 },
      { name: 'Health Kit', iconPath: 'assets/icons/RandomObjects/HealthKit.png', category: CATEGORY.SUPPLIES, rarity: 0.4 },
      { name: 'Ladder', iconPath: 'assets/icons/RandomObjects/Ladder.png', category: CATEGORY.SUPPLIES, rarity: 0.5 },
      { name: 'Lantern', iconPath: 'assets/icons/RandomObjects/Lantern.png', category: CATEGORY.SUPPLIES, rarity: 0.6 },
      { name: 'Backpack', iconPath: 'assets/icons/RandomObjects/LargePack.png', category: CATEGORY.SUPPLIES, rarity: 0.4 },
      { name: 'Lighter', iconPath: 'assets/icons/RandomObjects/Lighter.png', category: CATEGORY.SUPPLIES, rarity: 0.8 },
      { name: 'Light Bulb', iconPath: 'assets/icons/RandomObjects/LightBulb.png', category: CATEGORY.SUPPLIES, rarity: 1.0 },
      { name: 'Magazine', iconPath: 'assets/icons/RandomObjects/Magizine.png', category: CATEGORY.SUPPLIES, rarity: 1.0 },
      { name: 'Nails', iconPath: 'assets/icons/RandomObjects/Nails.png', category: CATEGORY.SUPPLIES, rarity: 0.8, stackable: true },
      { name: 'Pallet', iconPath: 'assets/icons/RandomObjects/Pallett.png', category: CATEGORY.SUPPLIES, rarity: 0.7 },
      { name: 'Drill', iconPath: 'assets/icons/RandomObjects/Screwgun.png', category: CATEGORY.SUPPLIES, rarity: 0.5 },
      { name: 'Screws', iconPath: 'assets/icons/RandomObjects/Screws.png', category: CATEGORY.SUPPLIES, rarity: 0.9, stackable: true },
      { name: 'Skill Book', iconPath: 'assets/icons/RandomObjects/SkillBook.png', category: CATEGORY.SUPPLIES, rarity: 0.2 },
      { name: 'Sleeping Bag', iconPath: 'assets/icons/RandomObjects/SleepingBag.png', category: CATEGORY.SUPPLIES, rarity: 0.5 },
      { name: 'Soap', iconPath: 'assets/icons/RandomObjects/Soap.png', category: CATEGORY.SUPPLIES, rarity: 1.0 },
      { name: 'Strong Lock', iconPath: 'assets/icons/RandomObjects/StrongLock.png', category: CATEGORY.SUPPLIES, rarity: 0.4 },
      { name: 'Walkie Talkie', iconPath: 'assets/icons/RandomObjects/Walkie.png', category: CATEGORY.SUPPLIES, rarity: 0.3 },
      { name: 'Weak Lock', iconPath: 'assets/icons/RandomObjects/WeakLock.png', category: CATEGORY.SUPPLIES, rarity: 0.8 },
      { name: 'Wood Planks', iconPath: 'assets/icons/RandomObjects/WoodPlanks.png', category: CATEGORY.SUPPLIES, rarity: 0.7, stackable: true },
      { name: 'Work Boots', iconPath: 'assets/icons/RandomObjects/WorkBoots.png', category: CATEGORY.SUPPLIES, rarity: 0.6 }
    ]
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  // Seeded random number generator for reproducible results
  function seededRNG(seed) {
    return function() {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Get base path for assets (different for web vs Capacitor)
  function getBasePath() {
    return CONFIG.isCapacitor ? '' : '';
  }

  // ============================================
  // CANVAS & DISPLAY
  // ============================================

  // Pinch-zoom/pan state
  let view = {
    scale: 1,
    minScale: 1,
    maxScale: 3,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    panning: false,
    pinchDist: 0,
    pinchStartScale: 1
  };

  function resizeCanvas() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = window.innerHeight - 100;

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * CONFIG.DPR);
    canvas.height = Math.floor(height * CONFIG.DPR);
    ctx.setTransform(CONFIG.DPR, 0, 0, CONFIG.DPR, 0, 0);

    // Update minScale so image always fills screen
    if (state.bgImage?.naturalWidth && state.bgImage?.naturalHeight) {
      const w = canvas.width / CONFIG.DPR;
      const h = canvas.height / CONFIG.DPR;
      const iw = state.bgImage.naturalWidth;
      const ih = state.bgImage.naturalHeight;
      view.minScale = Math.max(w / iw, h / ih);
      if (view.scale < view.minScale) view.scale = view.minScale;
    }
  }

  function drawBackground() {
    const w = canvas.width / CONFIG.DPR;
    const h = canvas.height / CONFIG.DPR;
    if (state.bgImage?.complete) {
      const iw = state.bgImage.naturalWidth;
      const ih = state.bgImage.naturalHeight;
      // Center image with current zoom/pan
      const scale = view.scale;
      const dw = iw * scale;
      const dh = ih * scale;
      // Clamp pan so image always covers screen
      const minX = Math.min(0, w - dw);
      const minY = Math.min(0, h - dh);
      if (view.offsetX > 0) view.offsetX = 0;
      if (view.offsetY > 0) view.offsetY = 0;
      if (view.offsetX < minX) view.offsetX = minX;
      if (view.offsetY < minY) view.offsetY = minY;
      ctx.save();
      ctx.translate(view.offsetX + (w - dw) / 2, view.offsetY + (h - dh) / 2);
      ctx.drawImage(state.bgImage, 0, 0, dw, dh);
      ctx.restore();
    } else {
      // Fallback gradient
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Pinch-zoom and pan handlers
  canvas.addEventListener('mousedown', e => {
    view.panning = true;
    view.lastX = e.clientX;
    view.lastY = e.clientY;
  });
  window.addEventListener('mousemove', e => {
    if (view.panning) {
      view.offsetX += e.clientX - view.lastX;
      view.offsetY += e.clientY - view.lastY;
      view.lastX = e.clientX;
      view.lastY = e.clientY;
      render();
    }
  });
  window.addEventListener('mouseup', () => { view.panning = false; });

  // Touch events for pan and pinch-zoom
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      view.panning = true;
      view.lastX = e.touches[0].clientX;
      view.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      view.panning = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      view.pinchDist = Math.sqrt(dx * dx + dy * dy);
      view.pinchStartScale = view.scale;
    }
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && view.panning) {
      view.offsetX += e.touches[0].clientX - view.lastX;
      view.offsetY += e.touches[0].clientY - view.lastY;
      view.lastX = e.touches[0].clientX;
      view.lastY = e.touches[0].clientY;
      render();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let newScale = view.pinchStartScale * (dist / view.pinchDist);
      if (newScale < view.minScale) newScale = view.minScale;
      if (newScale > view.maxScale) newScale = view.maxScale;
      view.scale = newScale;
      render();
    }
  }, { passive: false });
  window.addEventListener('touchend', e => { view.panning = false; });

  // Prevent zoom out below minScale
  canvas.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      let newScale = view.scale + (e.deltaY < 0 ? 0.1 : -0.1);
      if (newScale < view.minScale) newScale = view.minScale;
      if (newScale > view.maxScale) newScale = view.maxScale;
      view.scale = newScale;
      render();
    }
  }, { passive: false });

  // ============================================
  // ITEM MANAGEMENT
  // ============================================
  
  const iconCache = new Map();

  async function loadIcon(iconPath) {
    if (iconCache.has(iconPath)) {
      return iconCache.get(iconPath);
    }
    
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // Process to remove white/light backgrounds while keeping colors
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate brightness and saturation
          const brightness = (r + g + b) / 3;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          
          // Make white/very light pixels transparent (background removal)
          // Only remove if VERY white/light AND low saturation (not colored)
          if (brightness > 245 && saturation < 0.1) {
            data[i + 3] = 0; // Fully transparent
          } else if (brightness > 230 && saturation < 0.15) {
            // Partially transparent for near-white
            data[i + 3] = Math.floor(data[i + 3] * 0.3);
          }
          // Keep all colored pixels at full opacity
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        iconCache.set(iconPath, tempCanvas);
        resolve(tempCanvas);
      };
      img.onerror = () => {
        // create a visible placeholder canvas for missing/0kb images
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 64;
        tempCanvas.height = 64;
        const tctx = tempCanvas.getContext('2d');
        tctx.fillStyle = '#222';
        tctx.fillRect(0,0,64,64);
        tctx.fillStyle = '#fff';
        tctx.font = '12px sans-serif';
        tctx.textAlign = 'center';
        tctx.fillText('Placeholder', 32, 34);
        iconCache.set(iconPath, tempCanvas);
        resolve(tempCanvas);
      };
      img.src = getBasePath() + iconPath;
    });
  }

  function pickItemsWithRarity(pool, rng, count) {
    const items = [];
    const available = [...pool];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      // Weight by rarity
      const totalWeight = available.reduce((sum, item) => sum + (item.rarity || 1), 0);
      let pick = rng() * totalWeight;
      
      for (let j = 0; j < available.length; j++) {
        pick -= (available[j].rarity || 1);
        if (pick <= 0) {
          items.push(available.splice(j, 1)[0]);
          break;
        }
      }
    }
    
    return items;
  }

  async function generateItems(rng, levelConfig) {
    // New behavior: single weighted pool, allow repeats, simpler limits
    const displayLimit = levelConfig?.displayLimit || 15; // number of items shown

    // Build weighted pools with desired overall probabilities
    const pool = [];

    // Supplies are very common; make many supply entries
    for (const s of ITEM_POOL.supplies) {
      const weight = s.name === 'Health Kit' ? 0.04 : 1.0; // health kit ~4%
      const copies = Math.max(1, Math.round(weight * 100));
      for (let i = 0; i < copies; i++) pool.push(s);
    }

    // Weapons are rare overall (approx 10% of pool)
    for (const w of ITEM_POOL.weapons) {
      const weight = 0.1 * (w.rarity || 1);
      const copies = Math.max(1, Math.round(weight * 10));
      for (let i = 0; i < copies; i++) pool.push(w);
    }

    // Food and water moderate
    for (const f of ITEM_POOL.food) {
      const copies = Math.max(1, Math.round((f.rarity || 0.5) * 10));
      for (let i = 0; i < copies; i++) pool.push(f);
    }
    for (const w of ITEM_POOL.water) {
      const copies = Math.max(1, Math.round((w.rarity || 0.5) * 10));
      for (let i = 0; i < copies; i++) pool.push(w);
    }

    // Pick displayLimit items allowing repeats
    const picked = [];
    for (let i = 0; i < displayLimit; i++) {
      const idx = Math.floor(rng() * pool.length);
      picked.push(pool[idx]);
    }

    return picked;
  }

  async function placeItems(rng, pickedItems) {
    // Place items in image coordinates (relative to bg image)
    const iw = state.bgImage?.naturalWidth || 1920;
    const ih = state.bgImage?.naturalHeight || 1080;
    const placed = [];
    function overlaps(ix, iy, r) {
      return placed.some(p => {
        const dx = p.ix - ix;
        const dy = p.iy - iy;
        return Math.sqrt(dx*dx + dy*dy) < (p.r + r + CONFIG.ITEM_MIN_DISTANCE);
      });
    }
    for (const item of pickedItems) {
      const r = 12 + Math.floor(rng() * 8);
      let ix, iy, attempts = 0;
      do {
        // Place items more towards edges and corners
        const edgeBias = rng() < 0.4;
        if (edgeBias) {
          if (rng() < 0.5) {
            ix = rng() < 0.5 ? 30 + rng() * 80 : iw - 30 - rng() * 80;
            iy = 40 + rng() * (ih - 80);
          } else {
            ix = 40 + rng() * (iw - 80);
            iy = rng() < 0.5 ? 30 + rng() * 80 : ih - 30 - rng() * 80;
          }
        } else {
          ix = 40 + rng() * (iw - 80);
          iy = 40 + rng() * (ih - 80);
        }
        attempts++;
      } while (overlaps(ix, iy, r) && attempts < 500);
      const placedItem = {
        id: crypto.randomUUID(),
        ...item,
        ix, iy, r,
        rot: rng() * Math.PI * 2,
        found: false,
        hint: false,
        icon: await loadIcon(item.iconPath)
      };
      placed.push(placedItem);
    }
    return placed;
  }

  function drawItem(item) {
    if (item.found && !state.devModeVisible) return;
    // Convert image coords to canvas coords
    const w = canvas.width / CONFIG.DPR;
    const h = canvas.height / CONFIG.DPR;
    const iw = state.bgImage?.naturalWidth || 1920;
    const ih = state.bgImage?.naturalHeight || 1080;
    const scale = view.scale;
    const dw = iw * scale;
    const dh = ih * scale;
    const minX = Math.min(0, w - dw);
    const minY = Math.min(0, h - dh);
    let ox = view.offsetX;
    let oy = view.offsetY;
    if (ox > 0) ox = 0;
    if (oy > 0) oy = 0;
    if (ox < minX) ox = minX;
    if (oy < minY) oy = minY;
    const cx = (w - dw) / 2 + ox + item.ix * scale;
    const cy = (h - dh) / 2 + oy + item.iy * scale;
    // Draw item
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(item.rot);
    ctx.globalAlpha = item.found ? 0.2 : 0.55;
    const size = 28; // Fixed size for all objects
    if (item.icon) {
      ctx.filter = 'brightness(0.85) contrast(1.1)';
      ctx.drawImage(item.icon, -size/2, -size/2, size, size);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Hint highlight
    if (item.hint && !item.found) {
      const pulse = 1 + 0.2 * Math.sin(Date.now() / 300);
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.75 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ============================================
  // INPUT HANDLING
  // ============================================
  
  function getCanvasCoords(evt) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (evt.touches?.length > 0) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else if (evt.changedTouches?.length > 0) {
      clientX = evt.changedTouches[0].clientX;
      clientY = evt.changedTouches[0].clientY;
    } else {
      clientX = evt.clientX;
      clientY = evt.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handleClick(evt) {
    if (!state.running || state.adPlaying) return;
    if (evt.type === 'touchend') evt.preventDefault();
    
    const { x, y } = getCanvasCoords(evt);
    
    // Find nearest unfound item within tolerance
    let target = null;
    let minDist = Infinity;
    
    for (const item of state.items) {
      if (item.found) continue;
      const dx = item.x - x;
      const dy = item.y - y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist <= CONFIG.CLICK_TOLERANCE && dist < minDist) {
        minDist = dist;
        target = item;
      }
    }
    
    if (target) {
      target.found = true;
      target.hint = false;
      state.foundCount++;
      addToBackpack(target);
      renderItemList();
      renderBackpack();
      checkLevelProgress();
    }
  }

  // ============================================
  // BACKPACK SYSTEM
  // ============================================
  
  // Add item to backpack, respecting item size and total capacity
  function addToBackpack(item) {
    const cat = item.category || CATEGORY.MISC;
    if (!state.backpack[cat]) state.backpack[cat] = [];
    // compute size usage and enforce capacity
    const itemSize = item.size || 1;
   const backpackCapacity = state.backpackCapacity || 12;
    function backpackUsed() {
      let used = 0;
      for (const c of Object.values(state.backpack)) {
        for (const it of c) used += (it.size || 1) * (it.count || 1);
      }
      return used;
    }

    if (backpackUsed() + itemSize > (state.backpackCapacity || 12)) {
      // cannot add, maybe show a brief flash or console
      console.warn('Cannot add to backpack, not enough capacity');
      return false;
    }

    if (item.stackable) {
      const existing = state.backpack[cat].find(e => e.name === item.name);
      if (existing) {
        existing.count = (existing.count || 1) + 1;
      } else {
        // store size info for capacity tracking
        state.backpack[cat].push({ name: item.name, count: 1, size: item.size || 1 });
      }
    } else {
      state.backpack[cat].push({ name: item.name, count: 1, size: item.size || 1 });
      state.backpackCapacity = 12; // Ensure backpack capacity is present
    }
    
    saveGame();
    return true;
  }

  function countInBackpack(category) {
    const arr = state.backpack[category] || [];
    return arr.reduce((sum, item) => sum + (item.count || 1), 0);
  }

  function consumeFromBackpack(category, amount) {
    const arr = state.backpack[category] || [];
    let remaining = amount;
    
    for (let i = arr.length - 1; i >= 0 && remaining > 0; i--) {
      const item = arr[i];
      const count = item.count || 1;
      
      if (count <= remaining) {
        remaining -= count;
        arr.splice(i, 1);
      } else {
        item.count = count - remaining;
        remaining = 0;
      }
    }
    
    state.backpack[category] = arr;
    saveGame();
  }

  function renderBackpack() {
    if (!elements.backpackUI) return;
    
    const categories = [
      { key: CATEGORY.WEAPON, icon: '??', label: 'Weapons' },
      { key: CATEGORY.FOOD, icon: '??', label: 'Food' },
      { key: CATEGORY.WATER, icon: '??', label: 'Water' },
      { key: CATEGORY.SUPPLIES, icon: '??', label: 'Supplies' }
    ];
    
    let html = '<div class="backpack-panel">';
    
    for (const cat of categories) {
      const items = state.backpack[cat.key] || [];
      const count = items.reduce((sum, i) => sum + (i.count || 1), 0);
      
      html += `<div class="bp-row">
        <span class="bp-label">${cat.icon} ${cat.label}: ${count}</span>
      </div>`;
    }
    
    html += '</div>';

    // show capacity used / total
    const used = Object.values(state.backpack).flat().reduce((s, it) => s + ((it.size || 1) * (it.count || 1)), 0);
    html += `<div class="bp-row" style="margin-top:8px; font-size:12px;"><span class="bp-label">Capacity: ${used}/${state.backpackCapacity || 12}</span></div>`;

    elements.backpackUI.innerHTML = html;
  }

  // Check for specific item in backpack
  function backpackHasItem(category, itemName) {
    const arr = state.backpack[category] || [];
    return arr.some(i => i.name === itemName && (i.count || 1) > 0);
  }

  // Consume a specific named item from backpack (e.g., Health Kit)
  function consumeSpecificItem(category, itemName, amount = 1) {
    const arr = state.backpack[category] || [];
    let remaining = amount;
    for (let i = arr.length - 1; i >= 0 && remaining > 0; i--) {
      const item = arr[i];
      if (item.name !== itemName) continue;
      const count = item.count || 1;
      if (count <= remaining) {
        remaining -= count;
        arr.splice(i, 1);
      } else {
        item.count = count - remaining;
        remaining = 0;
      }
    }
    state.backpack[category] = arr;
    saveGame();
  }

  // Present branching choice UI for cutscene branches
  function presentChoicesDialog(options) {
    return new Promise(resolve => {
      // Ensure overlay is visible
      elements.introOverlay?.classList.remove('hidden');
      // Create container for choices
      let container = document.getElementById('choiceContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'choiceContainer';
        container.className = 'choice-container';
        elements.introOverlay?.appendChild(container);
      }
      container.innerHTML = '';

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', async () => {
          // Clean up UI
          container.innerHTML = '';
          elements.introOverlay?.classList.add('hidden');

          // Apply effects
          if (opt.consumeSpecific) {
            consumeSpecificItem(opt.consumeSpecific.category, opt.consumeSpecific.name, opt.consumeSpecific.amount || 1);
          }
          if (opt.consume) {
            for (const [cat, amt] of Object.entries(opt.consume)) {
              consumeFromBackpack(cat, amt);
            }
          }
          if (opt.addItem) {
            // addItem expected { category, name }
            // find full item definition so size and other properties are preserved
            const allPool = [...ITEM_POOL.weapons, ...ITEM_POOL.food, ...ITEM_POOL.water, ...ITEM_POOL.supplies];
            const def = allPool.find(i => i.name === opt.addItem.name);
            if (def) {
              addToBackpack(def);
              if (def.name === 'Chainsaw' || def.name === 'Health Kit') state.persistentItems.add(def.name);
            } else {
              addToBackpack({ name: opt.addItem.name, category: opt.addItem.category, size: opt.addItem.size || 1 });
              if (opt.addItem.name === 'Chainsaw' || opt.addItem.name === 'Health Kit') state.persistentItems.add(opt.addItem.name);
            }
          }

          // Play any cutscenes for this branch
          if (opt.cutsceneAfter?.length > 0) {
            await showCutscenes(opt.cutsceneAfter);
          }

          // Handle death option (choice causes player to die)
          if (opt.die) {
            showDeath(opt.deathReason || 'You were left to die.');
            resolve(opt.id);
            return;
          }

          // Move to next level if specified (or stay)
          if (opt.nextLevel) {
            state.level = opt.nextLevel;
            saveGame();
            await startLevel();
          }

          resolve(opt.id);
        });
        container.appendChild(btn);
      });
    });
  }

  // ============================================
  // UI RENDERING
  // ============================================
  
  function renderItemList() {
    if (!elements.itemList) return;
    
    elements.itemList.innerHTML = '';
    
    for (const item of state.items) {
      const li = document.createElement('li');
      li.className = item.found ? 'item-found' : '';
      
      if (item.icon) {
        const img = document.createElement('img');
        img.src = item.icon.toDataURL?.() || '';
        img.className = 'item-icon';
        li.appendChild(img);
      }
      
      const name = document.createElement('span');
      name.textContent = item.name;
      name.className = 'item-name';
      li.appendChild(name);
      
      elements.itemList.appendChild(li);
    }
  }

  function updateLevelTitle() {
    const cfg = getLevelConfig(state.level);
    if (elements.levelTitle && cfg) {
      elements.levelTitle.textContent = `Level ${state.level}: ${cfg.name}`;
    }
  }

  // ============================================
  // LEVEL SYSTEM
  // ============================================
  
  async function loadLevelConfigs() {
    try {
      const res = await fetch(getBasePath() + 'assets/levels.json');
      const data = await res.json();
      state.levelConfigs = data;
      console.log('Loaded level configs:', data.levels?.length || 0, 'levels');
    } catch (e) {
      console.error('Failed to load levels.json:', e);
      state.levelConfigs = { levels: [] };
    }
  }

  function getLevelConfig(levelNum) {
    return state.levelConfigs?.levels?.find(l => l.id === levelNum) || null;
  }

  function checkLevelProgress() {
    const cfg = getLevelConfig(state.level);
    if (!cfg) return;
    
    const req = cfg.proceedRequirements || {};
    const minFound = req.minFound || 0;
    const invReq = req.inventory || {};
    
    // Check if found enough items
    if (state.foundCount < minFound) {
      elements.proceedBtn?.classList.add('hidden');
      return;
    }
    
    // Check inventory requirements
    for (const [cat, needed] of Object.entries(invReq)) {
      if (countInBackpack(cat) < needed) {
        elements.proceedBtn?.classList.add('hidden');
        return;
      }
    }
    
    // Can proceed!
    elements.proceedBtn?.classList.remove('hidden');
    const pct = Math.round((state.foundCount / cfg.totalItems) * 100);
    elements.proceedBtn.textContent = `${pct}% - Proceed to Level ${state.level + 1}`;
  }

  async function proceedToNextLevel() {
    const cfg = getLevelConfig(state.level);
    // Handle encounter
    if (cfg?.encounter) {
      const enc = cfg.encounter;
      // Check requirements
      if (enc.requires) {
        for (const [cat, needed] of Object.entries(enc.requires)) {
          if (countInBackpack(cat) < needed) {
            showDeath(enc.failReason || 'You did not have the required items to survive.');
            return;
          }
        }
      }
      // Consume items
      if (enc.consume) {
        for (const [cat, amount] of Object.entries(enc.consume)) {
          consumeFromBackpack(cat, amount);
        }
      }
      // Check for game end
      if (enc.successEnding && state.level >= 10) {
        // Play FinishedEnding cutscene, then Good Ending
        const finishedEnding = state.levelConfigs?.endings?.finished;
        if (finishedEnding?.images?.length > 0) {
          const scenes = finishedEnding.images.map((img, i) => ({
            image: img,
            text: finishedEnding.text?.[i] || ''
          }));
          await showCutscenes(scenes);
        }
        showEnding('good');
        return;
      }
    }
    // Show after cutscene if exists
    if (cfg?.cutsceneAfter?.length > 0) {
      await showCutscenes(cfg.cutsceneAfter);
    }
    state.level++;
    saveGame();
    await startLevel();
  }

  // ============================================
  // CUTSCENES
  // ============================================
  
  async function showCutscenes(scenes) {
    if (!scenes?.length) return;
    
    state.introCancelled = false;
    elements.introOverlay?.classList.remove('hidden');
    
    for (let i = 0; i < scenes.length && !state.introCancelled; i++) {
      const scene = scenes[i];
      
      // Set image
      if (elements.introImage) {
        elements.introImage.style.backgroundImage = `url('${getBasePath()}${scene.image}')`;
        elements.introImage.classList.add('fade-in');
      }
      
      // Set text
      if (elements.introText) {
        elements.introText.textContent = scene.text || '';
        elements.introText.classList.add('fade-in');
      }
      
      // Wait for user to continue
      await new Promise(resolve => {
        const handler = () => {
          elements.continueIntroBtn?.removeEventListener('click', handler);
          resolve();
        };
        elements.continueIntroBtn?.addEventListener('click', handler);
        
        // Also handle skip
        const skipHandler = () => {
          state.introCancelled = true;
          elements.skipIntroBtn?.removeEventListener('click', skipHandler);
          resolve();
        };
        elements.skipIntroBtn?.addEventListener('click', skipHandler);
      });
      
      // Fade out
      elements.introImage?.classList.remove('fade-in');
      elements.introText?.classList.remove('fade-in');
      await new Promise(r => setTimeout(r, 300));
    }
    
    elements.introOverlay?.classList.add('hidden');
  }

  // ============================================
  // GAME FLOW
  // ============================================
  
  async function startLevel() {
    const cfg = getLevelConfig(state.level);
    
    // Show before cutscene
    if (cfg?.cutsceneBefore?.length > 0 && CONFIG.SHOW_INTRO) {
      await showCutscenes(cfg.cutsceneBefore);
    }
    
    // Load background image
    if (cfg?.photo) {
      await loadBackgroundImage(cfg.photo);
    }
    
    resizeCanvas();
    
    // Generate items
    state.levelSeed = Math.floor(Math.random() * 0xffffffff);
    const rng = seededRNG(state.levelSeed);
    const pickedItems = await generateItems(rng, cfg);
    state.items = await placeItems(rng, pickedItems);
    state.foundCount = 0;
    
    // Dice roll event: very small chance (1/100) to trigger secret walkie event in level 3
    if (state.level === 3) {
      const roll = Math.floor(rng() * 100) + 1; // 1-100
      if (roll === 1) {
        // Trigger secret branch: find walkie
        const scenes = [
          { image: 'assets/cutscenes/Level3/Level3Part3a.png', text: 'You find a small walkie talkie lying on the muddy road.' },
          { image: 'assets/cutscenes/Secret/SecretCutScene/Scene1/1.png', text: 'You pick it up and it crackles to life. A muffled voice asks for help.' }
        ];
        // Show immediate cutscene and present choices based on inventory
        await showCutscenes(scenes);

        // Prepare choice options
        const options = [];
        const hasMed = backpackHasItem(CATEGORY.SUPPLIES, 'Health Kit') || backpackHasItem(CATEGORY.SUPPLIES, 'First Aid Kit');

        if (hasMed) {
          // Neutral choice texts so player doesn't know consequences
          options.push({ id: 'help', text: 'Offer assistance', consumeSpecific: { category: CATEGORY.SUPPLIES, name: 'Health Kit', amount: 1 }, addItem: { category: CATEGORY.WEAPON, name: 'Chainsaw' }, cutsceneAfter: [ { image: 'assets/cutscenes/Secret/SecretCutScene/Scene1/7.png', text: 'You bandage the man. He thanks you.' } ], nextLevel: state.level });
          options.push({ id: 'lie', text: 'Move on', die: true, deathReason: 'You lied and left the injured man. Later events led to your demise.', cutsceneAfter: [ { image: 'assets/cutscenes/Secret/SecretCutScene/Scene1/9c.png', text: 'You move on without helping.' } ], nextLevel: state.level });
        } else {
          options.push({ id: 'sit', text: 'Stay nearby', cutsceneAfter: [ { image: 'assets/cutscenes/Secret/SecretCutScene/Scene1/8.png', text: 'You sit with him. After he passes you find a yellow chainsaw.' }, { image: 'assets/cutscenes/Secret/SecretCutScene/Scene1/9b.png', text: 'You pick up the chainsaw.' } ], addItem: { category: CATEGORY.WEAPON, name: 'Chainsaw' }, nextLevel: state.level });
        }

        // Present choices and await result
        const choice = await presentChoicesDialog(options);
        console.log('Secret branch chosen:', choice);
        // Handle outcome effects beyond inventory changes
        if (choice === 'help') {
          state.savedByMan = true;
          saveGame();
        }
      }
    }

    // Update UI
    renderItemList();
    renderBackpack();
    updateLevelTitle();
    elements.proceedBtn?.classList.add('hidden');
    elements.completeOverlay?.classList.add('hidden');
    elements.deathOverlay?.classList.add('hidden');
    
    state.running = true;
  }

  async function loadBackgroundImage(path) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        state.bgImage = img;
        resolve();
      };
      img.onerror = () => {
        state.bgImage = null;
        resolve();
      };
      img.src = getBasePath() + path;
    });
  }

  function showDeath(reason) {
    state.running = false;
    if (elements.deathReason) {
      elements.deathReason.textContent = reason;
    }
    elements.deathOverlay?.classList.remove('hidden');
  }

  async function showEnding(type) {
    state.running = false;
    const ending = state.levelConfigs?.endings?.[type];
    
    if (ending?.images?.length > 0) {
      const scenes = ending.images.map((img, i) => ({
        image: img,
        text: ending.text?.[i] || ''
      }));
      await showCutscenes(scenes);
    }
    
    // Show restart option
    elements.completeOverlay?.classList.remove('hidden');
    if (elements.playAgainBtn) {
      elements.playAgainBtn.textContent = 'Play Again';
    }
  }

  async function restartGame() {
    state.level = 1;
    state.backpack = { Weapon: [], Food: [], Water: [], Supplies: [], Misc: [] };
    saveGame();
    await startLevel();
  }

  // ============================================
  // HINT SYSTEM (with AdMob integration)
  // ============================================
  
  async function requestHint() {
    if (!state.running || state.adPlaying) return;
    
    const remaining = state.items.filter(i => !i.found);
    if (remaining.length === 0) return;
    
    state.adPlaying = true;
    
    // Use AdManager if available (supports both web and native ads)
    let rewarded = false;
    if (window.AdManager) {
      rewarded = await window.AdManager.showRewardedAd(
        elements.adOverlay, 
        elements.adCountdown
      );
    } else {
      // Fallback: simple countdown
      elements.adOverlay?.classList.remove('hidden');
      let seconds = CONFIG.AD_SECONDS;
      elements.adCountdown.textContent = String(seconds);
      
      await new Promise(resolve => {
        const timer = setInterval(() => {
          seconds--;
          elements.adCountdown.textContent = String(seconds);
          if (seconds <= 0) {
            clearInterval(timer);
            resolve();
          }
        }, 1000);
      });
      
      elements.adOverlay?.classList.add('hidden');
      rewarded = true;
    }
    
    state.adPlaying = false;
    
    // Only give hint if user watched the ad
    if (rewarded) {
      const item = remaining[Math.floor(Math.random() * remaining.length)];
      item.hint = true;
      setTimeout(() => { item.hint = false; }, CONFIG.HINT_DURATION_MS);
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================
  
  function saveGame() {
    try {
      const data = {
        level: state.level,
        backpack: state.backpack
      };
      data.persistent = Array.from(state.persistentItems || []);
      localStorage.setItem('zombieHOG_save', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('zombieHOG_save');
      if (raw) {
        const data = JSON.parse(raw);
        state.level = data.level || 1;
        state.backpack = data.backpack || state.backpack;
        if (Array.isArray(data.persistent)) {
          state.persistentItems = new Set(data.persistent);
          // If persistent includes Chainsaw or Health Kit, ensure they exist in backpack
          if (state.persistentItems.has('Chainsaw')) {
            addToBackpack({ name: 'Chainsaw', category: CATEGORY.WEAPON, size: 2 });
          }
          if (state.persistentItems.has('Health Kit')) {
            addToBackpack({ name: 'Health Kit', category: CATEGORY.SUPPLIES, size: 1 });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
  }

  // ============================================
  // DEV MENU
  // ============================================
  
  function showDevMenu() {
    if (!elements.levelButtons) return;
    
    elements.levelButtons.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = `Level ${i}`;
      btn.onclick = () => {
        state.level = i;
        elements.devOverlay?.classList.add('hidden');
        startLevel();
      };
      elements.levelButtons.appendChild(btn);
    }
    
    elements.devOverlay?.classList.remove('hidden');
  }

  // ============================================
  // GAME LOOP
  // ============================================
  
  function gameLoop() {
    if (!state.running) {
      requestAnimationFrame(gameLoop);
      return;
    }
    
    drawBackground();
    for (const item of state.items) {
      drawItem(item);
    }
    
    requestAnimationFrame(gameLoop);
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  async function init() {
    // Initialize AdMob (for rewarded hint ads)
    if (window.AdManager) {
      await window.AdManager.init();
    }
    
    // Load level configs
    await loadLevelConfigs();
    
    // Load saved game
    loadGame();
    
    // Set up event listeners
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchend', handleClick, { passive: false });
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    
    window.addEventListener('resize', resizeCanvas);
    
    elements.hintBtn?.addEventListener('click', requestHint);
    elements.restartBtn?.addEventListener('click', restartGame);
    elements.playAgainBtn?.addEventListener('click', restartGame);
    elements.proceedBtn?.addEventListener('click', proceedToNextLevel);
    elements.restartFromDeathBtn?.addEventListener('click', restartGame);
    elements.devMenuBtn?.addEventListener('click', showDevMenu);
    elements.closeDevBtn?.addEventListener('click', () => elements.devOverlay?.classList.add('hidden'));
    elements.revealAllBtn?.addEventListener('click', () => {
      state.items.forEach(i => { i.found = true; });
      state.foundCount = state.items.length;
      renderItemList();
      checkLevelProgress();
    });
    elements.skipIntroBtn?.addEventListener('click', () => { state.introCancelled = true; });
    
    // Start game
    resizeCanvas();
    await startLevel();
    gameLoop();
  }

  // Start!
  init().catch(console.error);
})();
