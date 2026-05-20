import * as admin from 'firebase-admin';

const serviceAccount = require('../serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const dishes = [
  // ========== STARTERS ==========
  { name: "Paneer Tikka", description: "Marinated cottage cheese cubes grilled in tandoor with bell peppers and onions, served with mint chutney.", price: 299, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Chicken Tikka", description: "Succulent chicken pieces marinated in yogurt and aromatic spices, char-grilled to perfection.", price: 349, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1610057099443-fde6c99db9e1?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Hara Bhara Kebab", description: "Crispy spinach and green pea patties with cashew filling, a vegetarian delight.", price: 249, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Mutton Seekh Kebab", description: "Minced lamb skewers with fresh herbs and spices, cooked over charcoal flame.", price: 399, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Fish Amritsari", description: "Crispy fried fish fillets coated in spiced chickpea batter, Amritsar style.", price: 379, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Dahi Ke Kebab", description: "Soft hung curd kebabs with cashews and raisins, lightly pan-fried.", price: 269, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Tandoori Chicken (Half)", description: "Classic half tandoori chicken marinated overnight in yogurt and traditional spices.", price: 349, category: "Starters", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Chicken Malai Tikka", description: "Creamy and tender chicken tikka with cheese and cream marinade, mildly spiced.", price: 369, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Crispy Corn", description: "Golden fried corn kernels tossed with spices, curry leaves, and a hint of lemon.", price: 229, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Prawn Koliwada", description: "Mumbai-style crispy fried prawns with semolina coating and spicy masala.", price: 449, category: "Starters", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop", isAvailable: true },

  // ========== MAIN COURSE ==========
  { name: "Paneer Butter Masala", description: "Rich and creamy tomato-based gravy with soft paneer cubes, a North Indian classic.", price: 329, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Dal Makhani", description: "Slow-cooked black lentils simmered overnight with butter, cream, and aromatic spices.", price: 279, category: "Main Course", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Palak Paneer", description: "Fresh spinach puree with cubes of cottage cheese, tempered with garlic and cumin.", price: 299, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Malai Kofta", description: "Deep-fried paneer and potato dumplings in a rich, creamy cashew-tomato gravy.", price: 319, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Butter Chicken", description: "Tender tandoori chicken in a velvety tomato-butter sauce, the crown jewel of Indian cuisine.", price: 399, category: "Main Course", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Mutton Rogan Josh", description: "Aromatic Kashmiri-style lamb curry slow-cooked with whole spices and saffron.", price: 499, category: "Main Course", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Chicken Tikka Masala", description: "Grilled chicken tikka pieces simmered in a spiced onion-tomato masala gravy.", price: 389, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Fish Curry", description: "Fresh fish cooked in a tangy coconut-based curry with mustard and curry leaves.", price: 429, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Prawn Masala", description: "Juicy prawns cooked in a rich onion-tomato masala with coastal spices.", price: 499, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1510130113707-d9e1e22a0c31?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Egg Curry", description: "Boiled eggs in a flavorful onion-tomato gravy with garam masala.", price: 249, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Shahi Paneer", description: "Royal paneer curry in a rich cashew-cream sauce with aromatic spices.", price: 329, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Chana Masala", description: "Spiced chickpea curry cooked with onions, tomatoes, and a blend of Indian spices.", price: 249, category: "Main Course", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop", isAvailable: true },

  // ========== BREADS ==========
  { name: "Butter Naan", description: "Soft and fluffy tandoor-baked bread brushed with melted butter.", price: 69, category: "Breads", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Garlic Naan", description: "Aromatic naan bread topped with fresh garlic, coriander, and butter.", price: 89, category: "Breads", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Laccha Paratha", description: "Flaky, multi-layered whole wheat bread cooked in tandoor.", price: 79, category: "Breads", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Cheese Naan", description: "Naan bread stuffed with melted cheese, a crowd favorite.", price: 99, category: "Breads", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Tandoori Roti", description: "Traditional whole wheat bread baked in clay tandoor oven.", price: 49, category: "Breads", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop", isAvailable: true },

  // ========== RICE & BIRYANI ==========
  { name: "Hyderabadi Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken, saffron, and caramelized onions. Dum-cooked.", price: 399, category: "Rice & Biryani", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Mutton Biryani", description: "Tender mutton pieces with aromatic basmati rice, slow-cooked in sealed pot.", price: 449, category: "Rice & Biryani", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Veg Biryani", description: "Aromatic basmati rice with seasonal vegetables, nuts, and whole spices.", price: 299, category: "Rice & Biryani", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Jeera Rice", description: "Fragrant basmati rice tempered with cumin seeds and ghee.", price: 189, category: "Rice & Biryani", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Steamed Basmati Rice", description: "Premium long-grain basmati rice, perfectly steamed.", price: 169, category: "Rice & Biryani", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&auto=format&fit=crop", isAvailable: true },

  // ========== DESSERTS ==========
  { name: "Gulab Jamun", description: "Golden fried milk dumplings soaked in rose-flavored sugar syrup. Served warm.", price: 149, category: "Desserts", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1666190070892-2c0e42f3da02?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Ras Malai", description: "Soft cottage cheese discs in chilled saffron-cardamom flavored milk.", price: 179, category: "Desserts", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Kulfi Falooda", description: "Traditional Indian ice cream with vermicelli, rose syrup, and basil seeds.", price: 199, category: "Desserts", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1571006682645-c14be14b9855?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Gajar Ka Halwa", description: "Slow-cooked grated carrot dessert with milk, ghee, and dry fruits.", price: 169, category: "Desserts", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1643297551195-76e06a8b4e58?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Jalebi with Rabri", description: "Crispy spiral sweets soaked in saffron syrup, served with thick creamy rabri.", price: 159, category: "Desserts", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1601303516-1b077f92af26?w=800&auto=format&fit=crop", isAvailable: true },

  // ========== DRINKS ==========
  { name: "Mango Lassi", description: "Creamy yogurt drink blended with fresh Alphonso mango pulp.", price: 149, category: "Drinks", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Masala Chaas", description: "Refreshing spiced buttermilk with cumin, mint, and a hint of rock salt.", price: 99, category: "Drinks", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Rose Sharbat", description: "Chilled rose petal syrup drink with basil seeds, a royal refreshment.", price: 129, category: "Drinks", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Fresh Lime Soda", description: "Freshly squeezed lime with soda water, available sweet or salted.", price: 99, category: "Drinks", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Virgin Mojito", description: "Refreshing blend of fresh mint, lime, sugar, and sparkling soda.", price: 199, category: "Drinks", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Cold Coffee", description: "Rich and creamy iced coffee blended with vanilla ice cream.", price: 179, category: "Drinks", isSpecial: false, imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop", isAvailable: true },

  // ========== CHEF SPECIALS ==========
  { name: "The Divine Thali (Veg)", description: "A royal vegetarian platter with paneer, dal makhani, 2 sabzi, rice, naan, raita, and dessert.", price: 599, category: "Chef Specials", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "The Divine Thali (Non-Veg)", description: "Grand non-veg platter with butter chicken, seekh kebab, biryani, naan, raita, and dessert.", price: 799, category: "Chef Specials", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Saffron Lamb Shank", description: "Slow-braised lamb shank with saffron reduction, served with truffle mashed potatoes.", price: 899, category: "Chef Specials", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Lobster Tandoori", description: "Whole lobster marinated in tandoori spices and grilled, served with saffron butter.", price: 1299, category: "Chef Specials", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&auto=format&fit=crop", isAvailable: true },
  { name: "Royal Saffron Biryani", description: "Premium biryani with tender lamb, real saffron, rose water, and gold leaf garnish.", price: 699, category: "Chef Specials", isSpecial: true, imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop", isAvailable: true },
];

async function seed() {
  console.log('🍽️  Starting The Divine Kitchen menu seeding...');
  console.log(`📦  ${dishes.length} dishes to add.\n`);

  // First, clear existing menu
  const existing = await db.collection('menu').get();
  const deleteOps = existing.docs.map(doc => doc.ref.delete());
  await Promise.all(deleteOps);
  console.log(`🗑️  Cleared ${existing.size} existing menu items.\n`);

  // Add all dishes
  let count = 0;
  for (const dish of dishes) {
    const data = { ...dish, createdAt: new Date().toISOString() };
    await db.collection('menu').add(data);
    count++;
    console.log(`  ✅ [${count}/${dishes.length}] ${dish.name} — ₹${dish.price}`);
  }

  console.log(`\n🎉  Successfully seeded ${count} dishes!`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
