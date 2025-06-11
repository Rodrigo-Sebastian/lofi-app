'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

import {
  PiUserCirclePlusLight,
  PiShootingStarLight,
  PiInfoLight,
  PiHeartLight,
  PiUsersLight,
} from 'react-icons/pi';
import { CiMenuFries, CiSettings, CiLogout } from 'react-icons/ci';

import Logo from '../../public/images/lofi-main-logo.png';
import ProfilePic from '../components/ProfilePic';
import { collection, onSnapshot } from 'firebase/firestore';

const UserResponsiveNav = () => {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [likesCount, setLikesCount] = useState<number>(0);
  const [likesReceivedIds, setLikesReceivedIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number>(0);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [navOpen, setNavOpen] = useState<boolean>(false);

  const toggleUser = () => setIsOpen(!isOpen);
  const toggleNav = () => setNavOpen(!navOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/Login');
    } catch (error: any) {
      console.error('Fel vid utloggning:', error);
    }
  };

  useEffect(() => {
    if (!uid) return;

    // Lyssna i realtid på matches
    const matchesRef = collection(db, 'users', uid, 'matches');
    const unsubscribeMatches = onSnapshot(matchesRef, (snapshot) => {
      setMatchCount(snapshot.size);
    });

    // Lyssna i realtid på likesReceived
    const likesRef = collection(db, 'users', uid, 'likesReceived');
    const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
      const likedUserIds = snapshot.docs.map((doc) => doc.id);
      setLikesReceivedIds(likedUserIds);
    });

    // Lyssna i realtid på skipped
    const skippedRef = collection(db, 'users', uid, 'skipped');
    const unsubscribeSkipped = onSnapshot(skippedRef, (snapshot) => {
      const skippedUserIds = snapshot.docs.map((doc) => doc.id);
      setSkippedIds(skippedUserIds);
    });

    return () => {
      unsubscribeLikes();
      unsubscribeSkipped();
      unsubscribeMatches();
    };
  }, [uid]);

  useEffect(() => {
    // Uppdatera likesCount med exkludering av skippade användare
    const filteredLikes = likesReceivedIds.filter(
      (id) => !skippedIds.includes(id)
    );
    setLikesCount(filteredLikes.length);
  }, [likesReceivedIds, skippedIds]);

  return (
    <header className='flex flex-row justify-between items-center lg:hidden'>
      {/* Logo och menyknapp */}
      <div className='flex flex-row gap-4 items-center'>
        <Link href='/AllUsers' className='bg-black p-2 rounded-md'>
          <Image src={Logo} alt='logo' width={50} />
        </Link>
        <div>
          <span className='text-4xl cursor-pointer' onClick={toggleNav}>
            <CiMenuFries />
          </span>

          <nav
            className={`h-full mt-4 bg-black text-white absolute top-20 left-0 p-4 z-50 w-full flex flex-col gap-10 
                        transform transition-transform duration-500 ease-in-out 
                        ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {auth.currentUser && (
              <Link
                href='/AllUsers'
                className='group flex flex-row items-center gap-2 text-2xl'
              >
                <PiUserCirclePlusLight />
                <h1 className='lg:text-sm text-lg'>Alla Användare</h1>
              </Link>
            )}

            <Link
              href='/Swippes'
              className='flex flex-row items-center gap-2 text-2xl relative'
            >
              <PiHeartLight />
              <h1 className='text-lg'>Swippes</h1>
              {likesCount > 0 && (
                <span className='absolute left-28 bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full'>
                  {likesCount}
                </span>
              )}
            </Link>
            <Link
              href='/Match'
              className='group relative flex flex-row items-center gap-2 text-2xl'
            >
              <span>
                <PiUsersLight />
              </span>
              <h1 className='text-lg lg:text-sm relative transition-all ease-in-out duration-300 hover:text-gray-400'>
                Matcher
              </h1>
              {matchCount > 0 && (
                <span className='absolute left-28 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full'>
                  {matchCount}
                </span>
              )}
            </Link>

            <Link
              href='/Prenumeration'
              className='flex flex-row items-center gap-2 text-2xl'
            >
              <PiShootingStarLight />
              <h1 className='text-lg'>Prenumeration</h1>
            </Link>

            <Link
              href='/'
              className='flex flex-row items-center gap-2 text-2xl'
            >
              <PiInfoLight />
              <h1 className='text-lg'>Support</h1>
            </Link>

            <hr />

            <ul className='flex flex-col gap-14'>
              <Link href={`/User/${uid}`}>
                <h1>Min Profil</h1>
              </Link>
              <Link href='/'>
                <h1>Födelsedatum</h1>
              </Link>
              <Link href='/'>
                <h1>Relation Status</h1>
              </Link>
              <Link href='/'>
                <h1>Information</h1>
              </Link>
            </ul>
          </nav>
        </div>
      </div>

      {/* Användarinställningar */}
      <div className='flex flex-row items-center gap-6 cursor-pointer'>
        <span className='text-4xl' onClick={toggleUser}>
          <CiSettings />
        </span>
        {isOpen && (
          <div className='absolute z-50 bg-white top-24 right-4 w-[150px] flex flex-col gap-2 p-4 rounded-md shadow-2xl'>
            <Link href={`/User/${uid}`} className='hover:text-gray-400'>
              <h1 className='flex flex-row items-center gap-2'>
                <PiHeartLight className='text-xl' />
                Min Profil
              </h1>
            </Link>
            <Link href={`/Dashboard/${uid}`} className='hover:text-gray-400'>
              <h1 className='flex flex-row items-center gap-2'>
                <PiShootingStarLight className='text-xl' />
                Dashboard
              </h1>
            </Link>
            <button
              onClick={handleLogout}
              className='p-2 cursor-pointer flex flex-row items-center gap-2 transition-all ease-in-out duration-300 hover:bg-black hover:text-white'
            >
              <CiLogout className='text-xl' />
              Logga ut
            </button>
          </div>
        )}
        <ProfilePic />
      </div>
    </header>
  );
};

export default UserResponsiveNav;
