'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '../context/UserContext';

import {
  PiUserCirclePlusLight,
  PiShootingStarLight,
  PiInfoLight,
  PiHeartLight,
  PiUsersLight,
} from 'react-icons/pi';
import { CiSettings, CiLogout } from 'react-icons/ci';

import ProfilePic from '../components/ProfilePic';
import Logo from '../../public/images/lofi-main-logo.png';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';

const UserNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { profileImage } = useUser() || {};
  const uid = auth.currentUser?.uid;

  const [likesCount, setLikesCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [likesReceivedIds, setLikesReceivedIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  const unsubscribeRefs = useRef<Unsubscribe[]>([]);

  useEffect(() => {
    if (!uid) {
      unsubscribeRefs.current.forEach((unsub) => unsub());
      unsubscribeRefs.current = [];
      return;
    }

    let isActive = true;

    const matchesRef = collection(db, 'users', uid, 'matches');
    const likesRef = collection(db, 'users', uid, 'likesReceived');
    const skippedRef = collection(db, 'users', uid, 'skipped');

    const unsubscribeMatches = onSnapshot(
      matchesRef,
      (snapshot) => {
        if (!isActive) return;
        setMatchCount(snapshot.size);
      },
      (error) => {
        if (error.code !== 'permission-denied')
          console.error('matchesRef error:', error);
      }
    );

    const unsubscribeLikes = onSnapshot(
      likesRef,
      (snapshot) => {
        if (!isActive) return;
        setLikesReceivedIds(snapshot.docs.map((doc) => doc.id));
      },
      (error) => {
        if (error.code !== 'permission-denied')
          console.error('likesRef error:', error);
      }
    );

    const unsubscribeSkipped = onSnapshot(
      skippedRef,
      (snapshot) => {
        if (!isActive) return;
        setSkippedIds(snapshot.docs.map((doc) => doc.id));
      },
      (error) => {
        if (error.code !== 'permission-denied')
          console.error('skippedRef error:', error);
      }
    );

    unsubscribeRefs.current = [
      unsubscribeMatches,
      unsubscribeLikes,
      unsubscribeSkipped,
    ];

    return () => {
      isActive = false;
      unsubscribeRefs.current.forEach((unsub) => unsub());
      unsubscribeRefs.current = [];
    };
  }, [uid]);

  useEffect(() => {
    const filteredLikes = likesReceivedIds.filter(
      (id) => !skippedIds.includes(id)
    );
    setLikesCount(filteredLikes.length);
  }, [likesReceivedIds, skippedIds]);

  const handleLogout = async () => {
    try {
      unsubscribeRefs.current.forEach((unsub) => unsub());
      unsubscribeRefs.current = [];

      await signOut(auth);
      router.push('/Login');
    } catch (error: any) {
      console.error('Fel vid utloggning:', error);
    }
  };

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleUser = () => setIsOpen(!isOpen);

  const getUnderlineClass = (path: string) => {
    return `relative text-sm hover:text-gray-400 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-black after:transition-all after:duration-300 ${
      pathname === path ? 'after:w-full' : 'after:w-0 group-hover:after:w-full'
    }`;
  };

  return (
    <header className='p-2 hidden lg:flex flex-row justify-between items-center'>
      {/* Logo */}
      <Link href='/AllUsers' className='bg-black p-2 rounded-md transition-all ease-in-out duration-300 hover:bg-stone-600'>
        <Image src={Logo} alt='logo' width={50} />
      </Link>

      {/* Nav */}
      <nav className='flex flex-row items-center gap-6'>
        {auth.currentUser && (
          <Link href='/AllUsers' className='group flex flex-row items-center gap-2'>
            <span><PiUserCirclePlusLight /></span>
            <h1 className={getUnderlineClass('/AllUsers')}>Alla Användare</h1>
          </Link>
        )}
        <Link href='/Swippes' className='group relative flex flex-row items-center gap-2'>
          <span><PiHeartLight /></span>
          <h1 className={getUnderlineClass('/Swippes')}>Swippes</h1>
          {likesCount > 0 && (
            <span className='absolute -top-3 -right-4 bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full'>
              {likesCount}
            </span>
          )}
        </Link>
        <Link href='/Match' className='group relative flex flex-row items-center gap-2'>
          <span><PiUsersLight /></span>
          <h1 className={getUnderlineClass('/Match')}>Matcher</h1>
          {matchCount > 0 && (
            <span className='absolute -top-3 -right-4 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full'>
              {matchCount}
            </span>
          )}
        </Link>
        <Link href='/Prenumeration' target='_blank' rel='noopener noreferrer' className='group flex flex-row items-center gap-2'>
          <span><PiShootingStarLight /></span>
          <h1 className={getUnderlineClass('/Prenumeration')}>Prenumeration</h1>
        </Link>
        <Link href='/' target='_blank' rel='noopener noreferrer' className='group flex flex-row items-center gap-2'>
          <span><PiInfoLight /></span>
          <h1 className={getUnderlineClass('/')}>Support</h1>
        </Link>
      </nav>

      {/* User menu */}
      <div className='flex flex-row items-center gap-6'>
        <span className='text-4xl cursor-pointer hover:bg-slate-300 hover:rounded-full hover:text-white' onClick={toggleUser}>
          <CiSettings />
        </span>
        {isOpen && (
          <div className='absolute z-50 bg-white top-24 lg:right-[320px] w-[150px] flex flex-col gap-2 p-4 rounded-md shadow-2xl'>
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
              <h1>Logga ut</h1>
            </button>
          </div>
        )}
        <ProfilePic />
      </div>
    </header>
  );
};

export default UserNav;
