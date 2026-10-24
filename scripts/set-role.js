const path = require('path');
const mongoose = require(path.join(__dirname, '..', 'backend', 'auth-service', 'node_modules', 'mongoose'));
const dotenv = require(path.join(__dirname, '..', 'backend', 'gateway', 'node_modules', 'dotenv'));

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const [,, email, targetRole] = process.argv;

if (!email || !targetRole) {
  console.log('\nUsage: npm run set-role <email> <role>');
  console.log('Available roles: participant, organizer, admin');
  console.log('Example: npm run set-role test@example.com admin\n');
  process.exit(1);
}

const validRoles = ['participant', 'organizer', 'admin'];
if (!validRoles.includes(targetRole.toLowerCase())) {
  console.error(`\nError: Invalid role "${targetRole}". Must be one of: ${validRoles.join(', ')}\n`);
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/univent';

async function setRole() {
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { role: targetRole.toLowerCase().trim() } }
    );

    if (result.matchedCount === 0) {
      console.log(`\nNo user found with email: ${email}`);
    } else {
      console.log(`\nSuccessfully updated ${email} to role: "${targetRole.toLowerCase()}"!`);
      console.log('Note: If currently logged in, please log out and log back in for the new role to take effect.\n');
    }
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

setRole();
