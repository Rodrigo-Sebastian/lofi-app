'use client';

import React from 'react';
import { PiCameraLight } from 'react-icons/pi';
import { useUser } from '../context/UserContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, storage, db } from '../../lib/firebase';
import User from '../../public/images/user-icon.webp';
import Image from 'next/image';

interface ProfilePicProps {
  src?: string;
  readOnly?: boolean;
  onSave?: (url: string) => void;
  size?: number;
}

const ProfilePic: React.FC<ProfilePicProps> = ({
  src,
  readOnly = false,
  onSave,
  size = 65,
}) => {
  const { profileImage, setProfileImage } = useUser();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Ingen användare är inloggad.');
        return;
      }

      const cleanFileName = file.name.replace(/\s/g, '_');
      const storageRef = ref(storage, `profileImages/${user.uid}/${cleanFileName}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { profileImage: url }, { merge: true });

      setProfileImage(url);
      if (onSave) onSave(url);
    } catch (error: any) {
      console.error('Fel vid uppladdning:', error);
      alert('Fel vid uppladdning: ' + error.message);
    }
  };

  const displayImage = src || profileImage || User;

  return (
    <div className='flex flex-col items-center relative'>
      <div
        className='rounded-full border-4 border-slate-800 overflow-hidden relative'
        style={{ width: size, height: size }}
      >
        <Image
          src={displayImage}
          alt='Profilbild'
          fill
          sizes={`${size}px`}
          quality={100}
          className='object-cover rounded-full'
          onError={(e: any) => {
            e.target.src = User.src;
          }}
        />
      </div>

      {!readOnly && (
        <div className='absolute top-0 left-12 lg:right-28 lg:left-12'>
          <label className='relative flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600'>
            <PiCameraLight className='w-6 h-6 text-white' />
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='hidden'
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ProfilePic;
