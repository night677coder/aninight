import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { notifications } from '@/lib/anilistqueries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify({
        query: notifications,
        variables: {
          page: page,
          perPage: 15,
        },
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json({ error: data.errors }, { status: 400 });
    }

    return NextResponse.json(data.data.Page);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
