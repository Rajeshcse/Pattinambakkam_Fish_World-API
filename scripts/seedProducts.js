import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FishProduct from '../models/FishProduct.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Seer Fish (Vanjaram)',
    category: 'Fish',
    price: 650,
    stock: 25,
    description:
      'Premium king fish, வஞ்சரம் - Rich in omega-3, perfect for fry or curry. Fresh catch from Pattinambakkam.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'White Pomfret (Vellai Vaval)',
    category: 'Fish',
    price: 800,
    stock: 15,
    description:
      'வெள்ளை வாவல் - Soft, delicate white meat. Best for frying. Highly sought after premium fish.',
    images: ['https://images.unsplash.com/photo-1559717201-fbb671ff56b7?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Tiger Prawns (Eral)',
    category: 'Prawn',
    price: 550,
    stock: 30,
    description:
      'இறால் - Jumbo size tiger prawns. Perfect for biryani, fry, or curry. Fresh and meaty.',
    images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Sea Crab (Nandu)',
    category: 'Crab',
    price: 450,
    stock: 20,
    description: 'நண்டு - Fresh, meaty sea crabs. Perfect for crab masala and curry. Rich flavor.',
    images: ['https://images.unsplash.com/photo-1580822432022-cfa9f0a84d83?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Squid (Kanava)',
    category: 'Squid',
    price: 400,
    stock: 18,
    description: 'கணவா - Fresh squid rings. Perfect for frying and gravy. Tender and delicious.',
    images: ['https://images.unsplash.com/photo-1559717201-fbb671ff56b7?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Red Snapper (Sankara)',
    category: 'Fish',
    price: 550,
    stock: 20,
    description: 'சங்கரா - Premium fish with firm texture. Great for grilling, frying, and curry.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Mackerel (Ayla)',
    category: 'Fish',
    price: 280,
    stock: 40,
    description: 'ஐலா - Budget-friendly, tasty fish. Perfect for fry and curry. High in omega-3.',
    images: ['https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Sardine (Mathi)',
    category: 'Fish',
    price: 200,
    stock: 50,
    description:
      'மத்தி - Small, delicious fish. Perfect for frying. Very affordable and nutritious.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Black Pomfret (Karuppu Vaval)',
    category: 'Fish',
    price: 600,
    stock: 12,
    description: 'கருப்பு வாவல் - Premium quality with rich flavor. Excellent for frying.',
    images: ['https://images.unsplash.com/photo-1559717201-fbb671ff56b7?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Tuna (Soorai)',
    category: 'Fish',
    price: 500,
    stock: 15,
    description: 'சூரை - Meaty fish perfect for steaks and curry. Rich in protein.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Jumbo Prawns',
    category: 'Prawn',
    price: 750,
    stock: 10,
    description: 'Extra large prawns. Perfect for special occasions. Very meaty and delicious.',
    images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  },
  {
    name: 'Mud Crab',
    category: 'Crab',
    price: 650,
    stock: 8,
    description: 'Premium mud crab with sweet meat. Best for crab curry and masala.',
    images: ['https://images.unsplash.com/photo-1580822432022-cfa9f0a84d83?w=500'],
    createdBy: 'admin@example.com',
    isAvailable: true
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing products
    await FishProduct.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const products = await FishProduct.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${products.length} products!`);

    console.log('\n📦 Products Created:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price}/kg (Stock: ${product.stock})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
