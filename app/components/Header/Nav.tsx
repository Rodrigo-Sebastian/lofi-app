'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Logo from '../../../public/images/lofi-main-logo.png';
import LogoDark from '../../../public/images/lofi-dark-logo.png';
import ResponsiveNav from '../ResponsiveNav';

const Nav: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <header>
      <div className='lg:flex flex-row justify-between items-center p-2 mx-auto max-w-7xl hidden'>
        <nav className='flex-1'>
          <ul className='flex flex-row gap-8 items-center text-white'>
            <li>
              <Link href='/Register' className='transition-all ease-in-out duration-300 hover:text-black'>
                Skappa ett konto
              </Link>
            </li>
            <li>
              <Link href='/Login' className='transition-all ease-in-out duration-300 hover:text-black'>
                Logga in
              </Link>
            </li>
            <li>
              <a href='#' className='transition-all ease-in-out duration-300 hover:text-black'>
                Service
              </a>
            </li>
          </ul>
        </nav>

        {/* Logo med transition */}
        <div
          className='flex-shrink-0 relative w-[100px] h-[70px]'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link href='/'>
            {/* Ljusa loggan */}
            <Image
              src={Logo}
              alt='Logo'
              fill
              className={`absolute transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />
            {/* Mörka loggan */}
            <Image
              src={LogoDark}
              alt='Logo Dark'
              fill
              className={`absolute transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          </Link>
        </div>

        <div className='flex-1 flex flex-row justify-end gap-8 items-center transition-all ease-in-out duration-300 hover:text-black'>
          <Link href='/' className='text-white transition-all ease-in-out duration-300 hover:text-black'>
            Instagram
          </Link>
          <Link href='/' className='text-white transition-all ease-in-out duration-300 hover:text-black'>
            Twitter / X
          </Link>
        </div>
      </div>
      <ResponsiveNav />
    </header>
  );
};

export default Nav;
