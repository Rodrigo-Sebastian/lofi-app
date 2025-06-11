'use client';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import React, { useState, useEffect } from 'react';
import { PiPencilSimpleLineLight, PiTrashLight } from 'react-icons/pi';

interface MainInfoItem {
  id: number;
  description: string;
}

interface MainInfoProps {
  data?: MainInfoItem[];
  onSave?: (data: MainInfoItem[]) => void;
  onChange?: (data: MainInfoItem[]) => void;
  readOnly?: boolean;
}

const MainInfo: React.FC<MainInfoProps> = ({
  data,
  onSave,
  onChange,
  readOnly = false,
}) => {
  const [info, setInfo] = useState<MainInfoItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedInfo, setEditedInfo] = useState<MainInfoItem[]>([]);
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  // Hantera extern data
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setInfo(data);
    }
  }, [data]);

  // Hämta användarens egna info om ingen prop-data finns
  useEffect(() => {
    if (!data) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data().mainInfo;
            if (firestoreData) {
              setInfo(firestoreData);
              setEditedInfo(firestoreData);
            }
          }
        }
      });

      return () => unsubscribe();
    }
  }, [data]);

  const handleChange = (index: number, newValue: string) => {
    const updated = [...editedInfo];
    updated[index].description = newValue;
    setEditedInfo(updated);

    if (error && newValue.trim().length > 0) {
      setError('');
    }

    if (onChange) {
      onChange(updated);
    }
  };

  const handleAddCard = () => {
    if (!isEditing) {
      setEditedInfo([...info]);
      setIsEditing(true);
    }

    const hasEmpty = editedInfo.some((item) => item.description.trim() === '');
    if (hasEmpty) {
      setError('Fyll i det tomma kortet innan du lägger nytt information.');
      return;
    }

    if (editedInfo.length < 3) {
      setEditedInfo([...editedInfo, { id: Date.now(), description: '' }]);
      setError('');
    }
  };

  const handleDeleteCard = (index: number) => {
    const updated = [...editedInfo];
    updated.splice(index, 1);
    setEditedInfo(updated);
  };

  const handleSave = async () => {
    if (!userId) return;

    const allFilled = editedInfo.every(
      (item) => item.description.trim().length > 0
    );
    if (!allFilled) {
      setError('Alla kort måste ha text innan du sparar.');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { mainInfo: editedInfo }, { merge: true });

    setInfo([...editedInfo]);
    setIsEditing(false);
    setError('');

    if (onSave) {
      onSave(editedInfo);
    }
  };

  const renderCards = () => {
    const displayData = isEditing ? editedInfo : info;

    return displayData.map((item, index) => (
      <div
        key={item.id}
        className='flex flex-col gap-4 p-4 rounded-md shadow-md w-full lg:w-[350px] mt-5'
      >
        <h1>En slumpmässig fakta om mig är:</h1>
        {error && (
          <div className='mt-2 text-red-800 text-sm font-medium'>{error}</div>
        )}
        {isEditing ? (
          <>
            <input
              type='text'
              placeholder='Jag har aldrig ätit pasta...'
              value={item.description}
              onChange={(e) => handleChange(index, e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'
            />
            <button
              onClick={() => handleDeleteCard(index)}
              className='text-lg flex justify-end'
              title='Radera Kort'
            >
              <PiTrashLight size={20} />
            </button>
          </>
        ) : (
          <p className='text-2xl font-semibold'>{item.description}</p>
        )}
      </div>
    ));
  };

  return (
    <div>
      {/* Titel + knappar */}
      <div className='flex flex-row gap-2 items-center'>
        <h1 className='text-xl font-semibold'>Din huvudinformation</h1>
        {!readOnly && !isEditing && (
          <span
            className='text-2xl cursor-pointer transition-all ease-in-out duration-300 hover:text-zinc-600'
            onClick={() => setIsEditing(true)}
          >
            <PiPencilSimpleLineLight />
          </span>
        )}
        {!readOnly && isEditing && (
          <button
            className='ml-auto px-4 py-1 text-sm bg-black text-white rounded-md transition-all duration-300 hover:bg-gray-700'
            onClick={handleSave}
          >
            Spara
          </button>
        )}
      </div>

      {/* Korten */}
      {renderCards()}

      {/* Lägg till nytt kort */}
      {!readOnly && editedInfo.length < 3 && (
        <button
          className='mt-4 px-6 py-2 rounded-md bg-blue-600 text-white transition-all ease-in-out duration-300 hover:bg-blue-700'
          onClick={handleAddCard}
        >
          Lägg till ett kort
        </button>
      )}
    </div>
  );
};

export default MainInfo;
