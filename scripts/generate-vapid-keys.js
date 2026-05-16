/**
 * Generate VAPID keys for Web Push notifications
 * Run with: node scripts/generate-vapid-keys.js
 * 
 * This generates public/private VAPID keys and prints them to console.
 * Add them to your .env.local file as:
 *   VAPID_PUBLIC_KEY=<generated_key>
 *   VAPID_PRIVATE_KEY=<generated_key>
 *   VAPID_EMAIL=admin@restaurant.com
 */

const webPush = require('web-push');

// Generate VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_EMAIL=admin@restaurant.com');
console.log('');
console.log('Copy these values into your .env.local file for push notifications to work.');
console.log('The public key should also be set in public/manifest.json if using PWA mode.');