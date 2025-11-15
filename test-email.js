import { sendVerificationEmail } from './utils/emailService.js';

console.log('Testing email service...');

const result = await sendVerificationEmail('test@example.com', '123456', 'Test User');

console.log('Result:', result);
