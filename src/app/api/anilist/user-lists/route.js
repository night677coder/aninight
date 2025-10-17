import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { userlists } from '@/lib/anilistqueries';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const response = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify({
        query: userlists,
        variables: { id },
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json({ error: data.errors }, { status: 400 });
    }

    return NextResponse.json(data.data?.Media?.mediaListEntry || null);
  } catch (error) {
    console.error('Error fetching user lists:', error);
    return NextResponse.json({ error: 'Failed to fetch user lists' }, { status: 500 });
  }
}
