import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    const response = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify({
        query: `
          mutation DeleteMediaListEntry($id: Int) {
            DeleteMediaListEntry(id: $id) {
              deleted
            }
          }
        `,
        variables: { id },
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json({ error: data.errors }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting list entry:', error);
    return NextResponse.json({ error: 'Failed to delete list entry' }, { status: 500 });
  }
}
