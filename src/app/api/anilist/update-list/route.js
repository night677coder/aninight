import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updatelist } from '@/lib/anilistqueries';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mediaId, progress, status, score, startedAt, completedAt, repeat, notes } = body;

    const response = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify({
        query: updatelist,
        variables: {
          mediaId,
          progress: progress || 0,
          status: status || null,
          score: score || 0,
          startedAt: startedAt || null,
          completedAt: completedAt || null,
          repeat: repeat || 0,
          notes: notes || null,
        },
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json({ error: data.errors }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
  }
}
