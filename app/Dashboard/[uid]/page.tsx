'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';
import UserNav from '../../User/UserNav';
import UserResponsiveNav from '../../User/UserResponsiveNav';
import UserImageGrid from '../../components/UserImageGrid';
import DashboardImages from '@/app/components/DashboardImages';

interface ImageType {
  url: string;
  path: string;
}

interface UserData {
  userImages?: ImageType[];
}

const Page: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/Login');
      } else {
        setUserId(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className='mx-auto max-w-7xl bg-gray-50 p-4'>
      <UserNav />
      <div className=''>
        <UserResponsiveNav />
      </div>

      <section className='mt-8 mb-12'>
        <h2 className='text-2xl font-bold mb-4'>Dina uppladdade bilder</h2>
        <DashboardImages/>

        {userData ? (
          <UserImageGrid
            images={userData.userImages || []}
            readOnly={true}
            onImageClick={() => {}} 
          />
        ) : (
          <p>Laddar dina bilder...</p>
        )}
      </section>
    </div>
  );
};

export default Page;
