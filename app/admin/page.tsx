import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminClient from '@/components/AdminClient'



export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const items = await prisma.menuItem.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <AdminClient initialItems={items} />
}