import Link from 'next/link';
import React from 'react';
import { CiMenuFries, CiInstagram, CiTwitter } from 'react-icons/ci';

const Footer: React.FC = () => {
  return (
    <footer className='bg-black text-white '>
      <div className='lg:mx-auto lg:max-w-7xl pt-10'>
        {/* Top-Footer-Context */}
        <div className='p-6 flex flex-col gap-4'>
          <h1 className='text-4xl text-center lg:text-start lg:text-6xl font-semibold'>
            Lofi din kärleks lösning.
          </h1>
          <p className='text-sm lg:text-2xl text-gray-400'>
            Utforska alla möjligheter som denna dejting appen kan erbjuda
          </p>
          <Link
            href='/Prenumeration'
            target='_blank'
            className='bg-white w-fit px-6 py-2 lg:px-12 lg:py-4 lg:text-lg text-black rounded-lg transition-all ease-in-out duration-300 hover:bg-stone-500 hover:text-white'
          >
            Läss mer
          </Link>
        </div>
        <span className='mt-10 block w-full h-[0.5px] bg-gray-600'></span>
        {/* Mid-Footer-Context */}
        <div className='p-6 flex flex-col gap-4'>
          <h1 className='text-gray-300'>Index</h1>
          <div className='flex flex-row gap-20'>
            <ul className='flex flex-col gap-4'>
              <li>
                <Link
                  href='/'
                  className=' transition-all ease-in-out duration-300 hover:text-stone-500'
                >
                  Hem
                </Link>
              </li>
              <li>
                <Link
                  href='/About'
                  className=' transition-all ease-in-out duration-300 hover:text-stone-500'
                >
                  Om lofi
                </Link>
              </li>
            </ul>
            <ul className='flex flex-col gap-4'>
              <li>
                <Link
                  href='/Register'
                  className=' transition-all ease-in-out duration-300 hover:text-stone-500'
                >
                  Skappa ett konto
                </Link>
              </li>
              <li>
                <Link
                  href='/Login'
                  className=' transition-all ease-in-out duration-300 hover:text-stone-500'
                >
                  Logga in
                </Link>
              </li>
              <li>
                <Link
                  href='/Prenumeration'
                  className=' transition-all ease-in-out duration-300 hover:text-stone-500'
                >
                  Prenumerationer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <span className='mt-10 block w-full h-[0.5px] bg-gray-600'></span>
        {/* Bottom-Footer-Context */}
        <div className='p-6 flex flex-col gap-4'>
          <div className='flex flex-row gap-4'>
            <Link
              href='/'
              className='text-4xl transition-all ease-in-out duration-300 hover:text-stone-500'
            >
              <CiInstagram />
            </Link>
            <Link
              href='/'
              className='text-4xl transition-all ease-in-out duration-300 hover:text-stone-500'
            >
              <CiTwitter />
            </Link>
          </div>
          <span className='text-md font-extralight'>
            © 2025 Lofi. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
