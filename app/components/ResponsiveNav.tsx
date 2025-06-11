'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../public/images/lofi-main-logo.png';

import { CiMenuFries, CiInstagram, CiTwitter } from 'react-icons/ci';

const ResponsiveNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className='lg:hidden flex flex-row justify-between items-center z-10 relative p-2'>
        <span className='cursor-pointer' onClick={toggleMenu}>
          <CiMenuFries className='text-4xl text-white' />
        </span>
        <div className='flex-shrink-0'>
          <Link href='/'>
            <Image src={Logo} alt='Logo' width={80} height={80} />
          </Link>
        </div>
        <Link href='/Login'>
          <button className='text-black cursor-pointer text-sm bg-white font-semibold py-2 px-4 rounded-md transition-all ease-in-out duration-300 hover:bg-black hover:text-white'>
            Logga in
          </button>
        </Link>
      </div>
      <nav
        className={`bg-black w-full h-screen fixed top-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Nav-links */}
        <div>
          <ul className='flex flex-col gap-8 items-start p-2 mt-24 h-[80vh] text-white'>
            <li className='flex flex-col gap-4 w-full'>
              <a href='#' className='text-4xl'>
                Skappa ett konto
              </a>
              <span className='block w-full h-[0.1px] bg-white'></span>
            </li>
            <li className='flex flex-col gap-4 w-full'>
              <a href='#' className='text-4xl'>
                Logga in
              </a>
              <span className='block w-full h-[0.1px] bg-white'></span>
            </li>
            <li className='flex flex-col gap-4 w-full'>
              <a href='#' className='text-4xl'>
                Service
              </a>
              <span className='block w-full h-[0.1px] bg-white'></span>
            </li>
          </ul>
          {/* Socials */}
          <div className='flex flex-col justify-between items-center gap-4 p-2'>
            <span className='block w-full h-[0.1px] bg-white'></span>
            <div className='flex flex-row justify-between items-center w-full'>
              <h1 className='text-white text-xl font-light'>Kontakt</h1>
              <div className='flex flex-row gap-4 items-center'>
                <a href='#' className='text-white text-2xl'>
                  <CiInstagram />
                </a>
                <a href='#' className='text-white text-2xl'>
                  <CiTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ResponsiveNav;
