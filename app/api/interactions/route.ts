import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { logInteraction, getInteractions } from '@/lib/database'

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { feature, input, output } = await req.json()

    if (!feature) {
      return NextResponse.json({ error: 'Feature is required' }, { status: 400 })
    }

    const record = await logInteraction(user.id, feature, input ?? null, output ?? null)
    return NextResponse.json({ interaction: record })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log interaction' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const feature = searchParams.get('feature') || undefined
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const interactions = await getInteractions(user.id, feature, limit)
    return NextResponse.json({ interactions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 })
  }
}
