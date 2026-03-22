'use client'

import { SubscriptionRenewalNotice } from '@/components/subscription-renewal-notice'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <SubscriptionRenewalNotice />
    </>
  )
}
