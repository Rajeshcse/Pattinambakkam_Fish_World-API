import mongoose from 'mongoose';
import FishProduct from '../models/FishProduct.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migratePricingTo500g() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await FishProduct.find({});
    console.log(`📦 Found ${products.length} products to migrate\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Nothing to migrate.');
      await mongoose.connection.close();
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    console.log('Starting migration...\n');

    for (const product of products) {
      try {
        const oldPrice = product.price;
        const oldStock = product.stock;

        const newPrice = parseFloat((oldPrice / 2).toFixed(2));

        const newStock = oldStock * 2;

        product.price = newPrice;
        product.stock = newStock;
        await product.save();

        console.log(`✅ ${product.name}`);
        console.log(`   Price: ₹${oldPrice}/kg → ₹${newPrice}/500g`);
        console.log(
          `   Stock: ${oldStock} (was kg) → ${newStock} units (500g each, displays as ${oldStock}kg in admin)`
        );
        console.log('');

        successCount++;
      } catch (error) {
        console.error(`❌ Error migrating ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} products`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} products`);
    }
    console.log('='.repeat(60) + '\n');

    await mongoose.connection.close();
    console.log('✅ Migration completed. Database connection closed.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migratePricingTo500g();
