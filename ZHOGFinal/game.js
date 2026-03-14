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
  };

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
      { name: 'Chainsaw', iconPath: 'assets/icons/WeaponObjects/ChainSaw.png', category: CATEGORY.WEAPON, rarity: 0.25 },
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
  
  function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = container.clientWidth;
    const maxHeight = window.innerHeight - 100;
    
    let aspect = 16 / 9;
    if (state.bgImage?.naturalWidth && state.bgImage?.naturalHeight) {
      aspect = state.bgImage.naturalWidth / state.bgImage.naturalHeight;
    }
    
    let width = maxWidth;
    let height = Math.round(width / aspect);
    
    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspect);
    }
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * CONFIG.DPR);
    canvas.height = Math.floor(height * CONFIG.DPR);
    ctx.setTransform(CONFIG.DPR, 0, 0, CONFIG.DPR, 0, 0);
  }

  function drawBackground() {
    const w = canvas.width / CONFIG.DPR;
    const h = canvas.height / CONFIG.DPR;
    
    if (state.bgImage?.complete) {
      const iw = state.bgImage.naturalWidth;
      const ih = state.bgImage.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(state.bgImage, dx, dy, dw, dh);
    } else {
      // Fallback gradient
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
  }

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
        iconCache.set(iconPath, null);
        resolve(null);
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
    const totalItems = levelConfig?.totalItems || 15;
    const quota = levelConfig?.quota || { Weapon: 2, Food: 2, Water: 2, Supplies: 5 };
    
    const selectedItems = [];
    
    // Pick items by category quota
    if (quota.Weapon) {
      selectedItems.push(...pickItemsWithRarity(ITEM_POOL.weapons, rng, quota.Weapon));
    }
    if (quota.Food) {
      selectedItems.push(...pickItemsWithRarity(ITEM_POOL.food, rng, quota.Food));
    }
    if (quota.Water) {
      selectedItems.push(...pickItemsWithRarity(ITEM_POOL.water, rng, quota.Water));
    }
    if (quota.Supplies || quota.Misc) {
      const supplyCount = (quota.Supplies || 0) + (quota.Misc || 0);
      selectedItems.push(...pickItemsWithRarity(ITEM_POOL.supplies, rng, supplyCount));
    }
    
    // Fill remaining slots with random items
    const allItems = [...ITEM_POOL.weapons, ...ITEM_POOL.food, ...ITEM_POOL.water, ...ITEM_POOL.supplies];
    while (selectedItems.length < totalItems) {
      const remaining = allItems.filter(item => 
        !selectedItems.some(s => s.name === item.name)
      );
      if (remaining.length === 0) break;
      selectedItems.push(...pickItemsWithRarity(remaining, rng, 1));
    }
    
    return selectedItems;
  }

  async function placeItems(rng, pickedItems) {
    const w = canvas.width / CONFIG.DPR;
    const h = canvas.height / CONFIG.DPR;
    const placed = [];
    
    function overlaps(x, y, r) {
      return placed.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx*dx + dy*dy) < (p.r + r + CONFIG.ITEM_MIN_DISTANCE);
      });
    }
    
    for (const item of pickedItems) {
      const r = 12 + Math.floor(rng() * 8); // Smaller collision radius
      let x, y, attempts = 0;
      
      do {
        // Place items more towards edges and corners where they're harder to spot
        const edgeBias = rng() < 0.4; // 40% chance to be near edge
        if (edgeBias) {
          // Near edges
          if (rng() < 0.5) {
            x = rng() < 0.5 ? 30 + rng() * 80 : w - 30 - rng() * 80;
            y = 40 + rng() * (h - 80);
          } else {
            x = 40 + rng() * (w - 80);
            y = rng() < 0.5 ? 30 + rng() * 80 : h - 30 - rng() * 80;
          }
        } else {
          // Random placement
          x = 40 + rng() * (w - 80);
          y = 40 + rng() * (h - 80);
        }
        attempts++;
      } while (overlaps(x, y, r) && attempts < 500);
      
      const placedItem = {
        id: crypto.randomUUID(),
        ...item,
        x, y, r,
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
    
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);
    
    // Make items semi-transparent to blend with background
    // Found items are very faded, unfound items are partially hidden
    ctx.globalAlpha = item.found ? 0.2 : 0.55;
    
    if (item.icon) {
      // Smaller size to make them harder to find
      // Base size around 24-32 pixels depending on screen
      const baseSize = Math.max(18, Math.min(28, canvas.width / CONFIG.DPR / 50));
      const size = baseSize + (item.r - 20) * 0.3; // Slight variation
      
      // Add slight darkening to blend with darker backgrounds
      ctx.filter = 'brightness(0.85) contrast(1.1)';
      ctx.drawImage(item.icon, -size/2, -size/2, size, size);
      ctx.filter = 'none';
    } else {
      // Fallback shape
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(0, 0, item.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Hint highlight - make it obvious when hinted
    if (item.hint && !item.found) {
      const pulse = 1 + 0.2 * Math.sin(Date.now() / 300);
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.r * 1.5 * pulse, 0, Math.PI * 2);
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
  
  function addToBackpack(item) {
    const cat = item.category || CATEGORY.MISC;
    if (!state.backpack[cat]) state.backpack[cat] = [];
    
    if (item.stackable) {
      const existing = state.backpack[cat].find(e => e.name === item.name);
      if (existing) {
        existing.count = (existing.count || 1) + 1;
      } else {
        state.backpack[cat].push({ name: item.name, count: 1 });
      }
    } else {
      state.backpack[cat].push({ name: item.name, count: 1 });
    }
    
    saveGame();
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
    elements.backpackUI.innerHTML = html;
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
