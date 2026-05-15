import { NextResponse } from 'next/server'

// VAPID keys for Web Push notifications
// In production, these should be stored in environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''

export async function GET() {
  return NextResponse.json({ 
    publicKey: VAPID_PUBLIC_KEY || null
  })
}