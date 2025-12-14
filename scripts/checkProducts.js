import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FishProduct from '../models/FishProduct.js';

dotenv.config();

const checkProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const products = await FishProduct.find().select('_id name price stock');

    console.log(`📦 Found ${products.length} products:\n`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: ₹${product.price}/kg`);
      console.log(`   Stock: ${product.stock}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProducts();
