'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImageItem {
  src: string;
  title: string;
  desc: string;
}

const images: ImageItem[] = [
  {
    src: '/images/dating-1.jpg',
    title: 'Träffa nya vänner',
    desc: 'Bygg meningsfulla relationer och ha kul!',
  },
  {
    src: '/images/dating-2.jpg',
    title: 'Hitta din match',
    desc: 'Anslut med människor som delar dina intressen.',
  },
  {
    src: '/images/dating-3.jpg',
    title: 'Kärlek på distans',
    desc: 'Stärk dina relationer var du än är.',
  },
  {
    src: '/images/dating-4.jpg',
    title: 'Nya äventyr',
    desc: 'Utforska, lär känna och ha roligt!',
  },
  {
    src: '/images/dating-5.jpg',
    title: 'Trygg dejting',
    desc: 'Säker och respektfull kommunikation.',
  },
  {
    src: '/images/dating-1.jpg',
    title: 'Gör minnen',
    desc: 'Skapa oförglömliga ögonblick tillsammans.',
  },
  {
    src: '/images/dating-2.jpg',
    title: 'Dela ditt liv',
    desc: 'Upptäck människor med samma passioner.',
  },
  {
    src: '/images/dating-3.jpg',
    title: 'Enkel att använda',
    desc: 'Skräddarsydd upplevelse för dig.',
  },
];

const HeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (images.length - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative max-w-7xl mx-auto py-10 overflow-hidden px-4'>
      {/* Carousel container */}
      <div
        className='flex gap-4 transition-transform duration-500'
        style={{
          transform: `translateX(-${currentIndex * 33.33}%)`, 
        }}
      >
        {images.map((item, index) => (
          <div
            key={index}
            className='min-w-[50%] shadow-md bg-black rounded-lg md:min-w-[33.33%] lg:min-w-[25%] flex flex-col items-center'
          >
            {/* Bilden */}
            <div className='relative w-full h-[250px] md:h-[300px] lg:h-[350px]'>
              <Image
                src={item.src}
                alt={item.title}
                fill
                className='object-cover rounded-lg'
              />
            </div>

            {/* Texten under bilden */}
            <div className='text-start mt-2 p-2'>
              <h3 className='text-sm md:text-lg text-white font-semibold'>
                {item.title}
              </h3>
              <p className='text-xs md:text-sm text-gray-600'>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
