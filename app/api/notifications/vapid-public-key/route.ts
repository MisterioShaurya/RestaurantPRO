import { NextResponse } from 'next/server'

// VAPID keys for Web Push notifications
// In production, set these in .env.local:
// VAPID_PUBLIC_KEY="your-public-key"
// VAPID_PRIVATE_KEY="your-private-key"
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''

export async function GET() {
  return NextResponse.json({ 
    publicKey: VAPID_PUBLIC_KEY || null
  })
}