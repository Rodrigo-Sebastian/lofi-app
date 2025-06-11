import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import InfoImg from '../../public/images/dating-1.jpg';

const InfoSection: React.FC = () => {
  return (
    <div className='mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row justify-between gap-4 items-center'>
      <div className=' lg:w-[550px] flex flex-col gap-4'>
        <h1 className='text-2xl w-[300px] lg:w-[550px] lg:text-6xl font-semibold'>
          Ditt livs kärlek kan vara ifrån ett swipe!
        </h1>
        <p className='text-sm lg:text-md font-semibold text-gray-500'>
          Lofi är byggd för singlar med hög ambition på att ta nästa steget i
          dejtning livet!
          <br />
          Vi hjälper dig att hitta din livs kärlek genom att matcha dig med
          personer som delar samma intressen som dig.
          <br />
        </p>
        <Link
          href='/'
          className='bg-black w-fit px-8 py-3 rounded-lg mt-4 transition-all ease-in-out duration-300 hover:bg-stone-500'
        >
          <h1 className='text-white'>Hur går det till</h1>
        </Link>
      </div>
      <div className='flex-2 w-full flex justify-end lg:w-fit'>
        <Image
          src={InfoImg}
          alt='info-img'
          width={400}
          height={500}
          className='rounded-lg'
        />
      </div>
    </div>
  );
};

export default InfoSection;
