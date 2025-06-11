'use client';

import React, { useEffect, useState } from 'react';
import {
  PiHeartStraightLight,
  PiPlus,
  PiChatCircleTextLight,
  PiTrashLight,
} from 'react-icons/pi';
import MultipleQuestions from './MultipleQuestions';
import MainInfo from './MainInfo';

import { auth, db, storage } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import BirthdaySection from './BirthdaySection';
import { FirebaseError } from 'firebase/app';

interface ImageType {
  url: string;
  path: string;
}

const DashboardImages: React.FC = () => {
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [images, setImages] = useState<ImageType[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(true);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );
  const [displayName, setDisplayName] = useState<string>('');
  const [age, setAge] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null); 
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    // Lyssna på auth state change
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);

      if (currentUser) {
        setDisplayName(currentUser.displayName || '');

        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.images) setImages(data.images);
            if (data.birthdate) {
              const calculatedAge = calculateAge(data.birthdate);
              setAge(calculatedAge);
            }
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const calculateAge = (birthdate: any): number => {
    let birth: Date;
    if (birthdate.toDate) {
      birth = birthdate.toDate();
    } else {
      birth = new Date(birthdate);
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleBirthdaySave = async (birthdaySection: any) => {
    const birthdayText = birthdaySection[0]?.text;
    if (!birthdayText) {
      setAge(null);
      return;
    }

    const [day, monthStr, year] = birthdayText.split(' ');
    const monthsMap: { [key: string]: number } = {
      januari: 0,
      februari: 1,
      mars: 2,
      april: 3,
      maj: 4,
      juni: 5,
      juli: 6,
      augusti: 7,
      september: 8,
      oktober: 9,
      november: 10,
      december: 11,
    };
    const month = monthsMap[monthStr?.toLowerCase() || ''];
    if (!isNaN(Number(day)) && !isNaN(month) && !isNaN(Number(year))) {
      const birthdate = new Date(Number(year), month, Number(day));
      const newAge = calculateAge(birthdate);
      setAge(newAge);

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          { birthdate: birthdate, birthdaySection: birthdaySection },
          { merge: true }
        );
      }
    } else {
      setAge(null);
    }
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user) return;

    if (images.length >= 4) {
      alert('Max 4 bilder tillåtna.');
      return;
    }

    try {
      const filePath = `user_images/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const newImage: ImageType = { url, path: filePath };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { images: updatedImages }, { merge: true });
    } catch (error: any) {
      console.error('Fel vid uppladdning av bild:', error);
      alert('Det gick inte att ladda upp bilden. Försök igen.');
    }
  };

  const handleDelete = async (index: number) => {
    if (!user) return;

    try {
      const imageToDelete = images[index];
      if (imageToDelete && imageToDelete.path) {
        const imageRef = ref(storage, imageToDelete.path);
        await deleteObject(imageRef);
      }

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { images: updatedImages }, { merge: true });

      setConfirmDeleteIndex(null);
    } catch (error: any) {
      console.error('Fel vid borttagning av bild:', error);
      alert('Det gick inte att ta bort bilden. Försök igen.');
    }
  };

  if (loadingUser) {
    return <p>Laddar användare...</p>;
  }

  if (!user) {
    return <p>Ingen användare inloggad.</p>;
  }

  return (
    <div>
      <div className='flex flex-row gap-2 items-center mt-10'>
        <h1 className='font-semibold text-4xl'>{displayName || 'Användare'}</h1>
        {age !== null && <h2 className='font-semibold text-4xl'>{age}</h2>}
      </div>

      {/* Skicka userId och onSave som props till BirthdaySection */}
      <BirthdaySection userId={user.uid} onSave={handleBirthdaySave} isOwnProfile={isOwnProfile} />

      <div className='flex flex-col-reverse gap-8 lg:flex-row justify-between mt-10'>
        <MultipleQuestions />
        <MainInfo />
      </div>
    </div>
  );
};

export default DashboardImages;
