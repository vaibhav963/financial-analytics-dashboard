import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import sampleData from './sampleData.json';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Demo User
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      await User.create({
        email: 'admin@gmail.com',
        password: 'Pass@123',
        name: 'Elena Rostova',
        role: 'admin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaRostova',
      });
      console.log('Seeded demo user: admin@gmail.com / Pass@123');
    }

    // 2. Seed Transactions
    const count = await Transaction.countDocuments();
    if (count === 0) {
      console.log(`Seeding ${sampleData.length} financial transactions from sampleData.json...`);
      const formattedData = sampleData.map((item: any) => ({
        id: item.id,
        date: new Date(item.date),
        amount: Number(item.amount),
        category: item.category,
        status: item.status,
        user_id: item.user_id,
        user_profile: item.user_profile,
      }));

      await Transaction.insertMany(formattedData);
      console.log(`Successfully seeded ${formattedData.length} transactions into MongoDB.`);
    } else {
      console.log(`Database already contains ${count} transactions.`);
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};

// If run directly via CLI
if (process.argv[1]?.includes('seed.ts')) {
  (async () => {
    const { connectDB, disconnectDB } = await import('../config/db.js');
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
