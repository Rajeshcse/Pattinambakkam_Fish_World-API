import { Clerk } from '@clerk/clerk-sdk-node';

/**
 * Initialize Clerk instance with SDK
 * Make sure to set CLERK_SECRET_KEY in .env file
 */
const clerk = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY
});

export default clerk;
