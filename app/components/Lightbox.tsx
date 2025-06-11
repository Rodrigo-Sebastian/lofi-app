import React from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

interface LightboxProps {
  images: { url: string }[] | null;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  if (!currentImage || !currentImage.url) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='relative max-w-4xl max-h-[90vh] flex items-center'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className='absolute top-4 right-4 text-white text-3xl'
          onClick={onClose}
          aria-label='Stäng'
        >
          <FiX />
        </button>

        <button
          className='text-white text-4xl p-4 hover:bg-white/20 rounded-l-md'
          onClick={onPrev}
          disabled={currentIndex === 0}
          aria-label='Föregående bild'
        >
          <FiChevronLeft />
        </button>

        <img
          src={currentImage.url}
          alt={`Bild ${currentIndex + 1}`}
          className='max-h-[80vh] max-w-full object-contain mx-4 rounded-md'
          draggable={false}
        />

        <button
          className='text-white text-4xl p-4 hover:bg-white/20 rounded-r-md'
          onClick={onNext}
          disabled={currentIndex === images.length - 1}
          aria-label='Nästa bild'
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
