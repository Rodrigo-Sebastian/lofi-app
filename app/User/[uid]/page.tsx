import React from 'react';
import UserNav from '../UserNav';
import UserMain from '../UserMain';
import UserResponsiveNav from '../UserResponsiveNav';

interface PageProps {
  params: {
    uid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { uid } = params; // Här är uid tillgängligt direkt

  return (
    <div className='mx-auto max-w-7xl bg-gray-50 p-4'>
      <UserNav />
      <div>
        <UserResponsiveNav />
      </div>
      <UserMain id={uid} /> {/* Skicka uid som prop */}
    </div>
  );
};

export default Page;
