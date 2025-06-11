'use client';

import { auth, storage } from '../../lib/firebase';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import { PiTrashLight, PiPlus } from 'react-icons/pi';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

interface ImageType {
  url: string;
  path: string;
}

interface UserImageGridProps {
  images?: ImageType[];
  onSave?: (images: ImageType[]) => void;
  onImageClick: (index: number) => void;
  readOnly?: boolean;
}

const UserImageGrid: React.FC<UserImageGridProps> = ({
  images: propImages = [],
  onSave,
  readOnly = false,
  onImageClick,
}) => {
  const [images, setImages] = useState<ImageType[]>(propImages);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );
  const [modalIndex, setModalIndex] = useState<number | null>(null); // Spara index på vald bild i modal

  useEffect(() => {
    setImages(propImages);
  }, [propImages]);

  const updateImages = async (newImages: ImageType[]) => {
    setImages(newImages);
    if (onSave) {
      onSave(newImages);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 6) return;

    const user = auth.currentUser;
    if (!user) return;

    const filePath = `user_images/${user.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const newImage: ImageType = { url, path: filePath };
    const updatedImages = [...images, newImage];

    await updateImages(updatedImages);
  };

  const handleDelete = async (index: number) => {
    if (readOnly) return;

    const user = auth.currentUser;
    if (!user) return;

    const imageToDelete = images[index];
    const imageRef = ref(storage, imageToDelete.path);

    try {
      await deleteObject(imageRef);

      const updatedImages = images.filter((_, i) => i !== index);
      setConfirmDeleteIndex(null);

      await updateImages(updatedImages);
    } catch (error: any) {
      console.error('Fel vid borttagning av bilden:', error);
      alert('Det gick inte att ta bort bilden. Försök igen.');
    }
  };

  const showPrev = () => {
    setModalIndex((prev) => {
      if (prev === null) return 0;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const showNext = () => {
    setModalIndex((prev) => {
      if (prev === null) return 0; 
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const renderImages = () => {
    return images.map((img, index) => (
      <div
        key={img.path}
        className='relative group w-full lg:w-72 h-72 rounded-md overflow-hidden border border-gray-300'
      >
        <img
          src={img.url}
          alt={`Bild ${index + 1}`}
          className='w-full h-full object-cover rounded-md cursor-pointer'
          onClick={() => setModalIndex(index)} 
          draggable={false}
        />
        {!readOnly && (
          <button
            onClick={() => setConfirmDeleteIndex(index)}
            className='absolute bottom-2 right-2 bg-white p-1 rounded-full hover:bg-red-500 hover:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100'
            aria-label={`Ta bort bild ${index + 1}`}
          >
            <PiTrashLight size={24} />
          </button>
        )}
        {confirmDeleteIndex === index && (
          <div className='absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center rounded-md'>
            <p className='text-white mb-4'>Vill du ta bort bilden?</p>
            <div className='flex gap-4'>
              <button
                onClick={() => handleDelete(index)}
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
              >
                Ja
              </button>
              <button
                onClick={() => setConfirmDeleteIndex(null)}
                className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
              >
                Nej
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className='mt-10'>
      <h1 className='text-xl font-semibold mb-4'>Redigera dina bilder</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {renderImages()}
        {!readOnly && images.length < 6 && (
          <label className='w-full lg:w-72 h-72 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-300'>
            <input
              type='file'
              accept='image/*'
              onChange={handleUpload}
              className='hidden'
            />
            <PiPlus className='text-5xl text-gray-500' />
            <p className='text-sm mt-2 text-gray-600'>Lägg till bild</p>
          </label>
        )}
      </div>

      {/* Modal med navigation */}
      {modalIndex !== null && (
        <div
          onClick={() => setModalIndex(null)} // Stäng modal vid klick utanför
          className='fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50'
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            } // Stoppa klick från att stänga modal när man klickar inne i fönstret
            className='relative rounded-lg p-16 max-w-[900px] max-h-[80vh] flex items-center justify-center'
            style={{ width: '90vw' }} // Så att det fungerar fint på mobil också
          >
            <button
              onClick={() => setModalIndex(null)}
              className='absolute top-2 right-2 text-white text-3xl p-1 rounded hover:bg-gray-700'
              aria-label='Stäng bildvisning'
            >
              <FiX />
            </button>

            <button
              onClick={showPrev}
              className='absolute left-2 text-white text-4xl p-1 rounded hover:bg-gray-700'
              aria-label='Föregående bild'
            >
              <FiChevronLeft />
            </button>

            <img
              src={images[modalIndex].url}
              alt={`Bild ${modalIndex + 1}`}
              className='max-w-full max-h-[70vh] rounded-md shadow-lg'
            />

            <button
              onClick={showNext}
              className='absolute right-2 text-white text-4xl p-1 rounded hover:bg-gray-700'
              aria-label='Nästa bild'
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserImageGrid;
