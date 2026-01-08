import React from 'react';

import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import Notifications from '@/components/settingscomponent/Notifications';

async function Page() {
    const session = await getAuthSession();

    return (
        <div className='min-h-[100vh]'>
            <div className='h-20'>
                
            </div>
            <Notifications session={session}/>
        </div>
    );
}

export default Page;