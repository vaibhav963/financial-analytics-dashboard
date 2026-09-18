import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { seedDatabase } from '../seeds/seed.js';

async function main() {
  try {
    const uri = await connectDB();
    await seedDatabase();

    console.log('\n========================================');
    console.log(` MongoDB Connection: ${uri}`);
    console.log('========================================\n');

    // 1. Users Collection
    const users = await User.find().lean();
    console.log(`US-1. USERS COLLECTION (${users.length} documents):`);
    console.table(
      users.map((u: any) => ({
        ID: u._id.toString().slice(-6),
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Department: u.department,
        TwoFactor: u.twoFactorEnabled,
      }))
    );

    // 2. Transactions Collection
    const txCount = await Transaction.countDocuments();
    const sampleTx = await Transaction.find().sort({ id: 1 }).limit(10).lean();
    console.log(`\nTX-1. TRANSACTIONS COLLECTION (${txCount} total documents, displaying first 10):`);
    console.table(
      sampleTx.map((tx: any) => ({
        'Tx ID': tx.id,
        Date: new Date(tx.date).toISOString().slice(0, 10),
        Amount: `$${Number(tx.amount).toFixed(2)}`,
        Category: tx.category,
        Status: tx.status,
        User: tx.user_id,
      }))
    );

    console.log('\n========================================\n');
  } catch (err) {
    console.error('Error viewing database:', err);
  } finally {
    await disconnectDB();
  }
}

main();
