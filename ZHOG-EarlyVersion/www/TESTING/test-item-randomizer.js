// test-item-randomizer.js
// Node.js script to test item randomization logic for all categories
// Place this file in www/TESTING and run with: node test-item-randomizer.js

const ITEM_POOL = {
  weapons: [
    { name: 'Chainsaw', rarity: 0.25 },
    { name: 'Fire Axe', rarity: 0.5 },
    { name: 'Pistol', rarity: 0.5 },
    { name: 'Crossbow', rarity: 0.6 },
    { name: 'Combat Knife', rarity: 0.8 },
    { name: 'Combat Axe', rarity: 0.6 },
    { name: 'Broom', rarity: 1.0 },
    { name: 'Bow', rarity: 0.7 },
    { name: 'Bomb', rarity: 0.25 },
    { name: 'Rifle', rarity: 0.4 },
    { name: 'Sledgehammer', rarity: 0.7 },
    { name: 'Scissors', rarity: 1.0 },
    { name: 'Revolver', rarity: 0.5 },
    { name: 'Kitchen Knife', rarity: 0.9 }
  ],
  food: [
    { name: 'Bacon', rarity: 0.6 },
    { name: 'Grill', rarity: 0.4 },
    { name: 'Hamburger', rarity: 0.8 }
  ],
  water: [
    { name: 'Canteen', rarity: 0.6 },
    { name: 'Water Bottle', rarity: 0.8 },
    { name: 'Coffee', rarity: 0.7 },
    { name: 'Espresso', rarity: 0.5 },
    { name: 'Dirty Water', rarity: 1.0 }
  ],
  supplies: [
    { name: 'Binoculars', rarity: 0.6 },
    { name: 'Body Armor', rarity: 0.3 },
    { name: 'Books', rarity: 1.0 },
    { name: 'Brick', rarity: 1.0 },
    { name: 'Cement', rarity: 0.5 },
    { name: 'Flashlight', rarity: 0.7 },
    { name: 'Hammer', rarity: 0.8 },
    { name: 'Hammock', rarity: 0.4 },
    { name: 'Health Kit', rarity: 0.4 },
    { name: 'Ladder', rarity: 0.5 },
    { name: 'Lantern', rarity: 0.6 },
    { name: 'Backpack', rarity: 0.4 },
    { name: 'Lighter', rarity: 0.8 },
    { name: 'Light Bulb', rarity: 1.0 },
    { name: 'Magazine', rarity: 1.0 },
    { name: 'Nails', rarity: 0.8 },
    { name: 'Pallet', rarity: 0.7 },
    { name: 'Drill', rarity: 0.5 },
    { name: 'Screws', rarity: 0.9 },
    { name: 'Skill Book', rarity: 0.2 },
    { name: 'Sleeping Bag', rarity: 0.5 },
    { name: 'Soap', rarity: 1.0 },
    { name: 'Strong Lock', rarity: 0.4 },
    { name: 'Walkie Talkie', rarity: 0.3 },
    { name: 'Weak Lock', rarity: 0.8 },
    { name: 'Wood Planks', rarity: 0.7 },
    { name: 'Work Boots', rarity: 0.6 }
  ]
};

function pickItemsWithRarity(pool, count) {
  const items = [...pool];
  const picked = [];
  while (picked.length < count && items.length > 0) {
    const idx = Math.floor(Math.random() * items.length);
    if (Math.random() < items[idx].rarity) {
      picked.push(items[idx].name);
    }
    items.splice(idx, 1);
  }
  return picked;
}

function runTest(category, pickCount = 5, runs = 100) {
  const counts = {};
  for (let i = 0; i < runs; i++) {
    const result = pickItemsWithRarity(ITEM_POOL[category], pickCount);
    result.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
  }
  console.log(`\nResults for ${category} (picked ${pickCount} per run, ${runs} runs):`);
  console.table(counts);
}

// Run tests for all categories
typeof console.clear === 'function' && console.clear();
runTest('weapons', 5, 100);
runTest('food', 2, 100);
runTest('water', 2, 100);
runTest('supplies', 5, 100);

console.log('\nAdjust pickCount or runs in the script as needed.');
