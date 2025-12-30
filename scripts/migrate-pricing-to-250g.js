import mongoose from 'mongoose';
import FishProduct from '../models/FishProduct.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Migration Script: Convert pricing from per kg to per 500g
 *
 * This script:
 * 1. Divides all product prices by 2 (₹400/kg → ₹200/500g)
 * 2. Converts stock from kg to internal units (10kg → 20 units of 500g)
 *
 * Note: Admins still enter stock in kg in the UI, but internally it's stored as 500g units
 *
 * Example:
 * Before: Price: ₹400/kg, Stock: 10 (stored as 10, displayed as 10kg)
 * After:  Price: ₹200/500g, Stock: 20 (stored as 20 units, displayed as 10kg in admin form)
 */

async function migratePricingTo500g() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 MIGRATION: Converting Pricing from /kg to /500g');
    console.log('='.repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
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

        // Convert price: divide by 2 (₹400/kg → ₹200/500g)
        const newPrice = parseFloat((oldPrice / 2).toFixed(2));

        // Convert stock: multiply by 2 (10kg → 20 units of 500g)
        const newStock = oldStock * 2;

        // Update the product
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

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Migration completed. Database connection closed.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migratePricingTo500g();
