'use client';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import User from '../../public/images/user-icon.webp';
import UserNav from '../User/UserNav';
import UserResponsiveNav from '../User/UserResponsiveNav';
import { PiHeartDuotone, PiXLogoLight } from 'react-icons/pi';

interface UserData {
  id: string;
  displayName?: string;
  profileImage?: string;
  birthdate?: any; 
  gender?: string | null;
}

const Page = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [skippedUsers, setSkippedUsers] = useState<string[]>([]);
  const [fadingUsers, setFadingUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [genderFilter, setGenderFilter] = useState<string>('all'); 

  useEffect(() => {
    const fetchUsers = async () => {
      const authUser = auth.currentUser;
      if (!authUser) return;

      setCurrentUser(authUser);
      console.log('Inloggad användare:', authUser.uid);

      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const userList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();

            // Extrahera kön
            let gender: string | null = null;
            if (
              Array.isArray(data.birthdaySection) &&
              data.birthdaySection[1]?.text
            ) {
              gender = data.birthdaySection[1].text.toLowerCase(); 
            }

            return {
              id: doc.id,
              gender,
              ...data,
            };
          })
          .filter((user) => user.id !== authUser.uid);

        setUsers(userList as UserData[]); 
      } catch (error) {
        console.error('Fel vid hämtning av användare:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLikedUsers = async () => {
      const authUser = auth.currentUser;
      if (!authUser) return;

      try {
        const likesSnapshot = await getDocs(
          collection(db, 'users', authUser.uid, 'likesGiven')
        );
        const likedUserIds = likesSnapshot.docs.map((doc) => doc.id);
        setLikedUsers(likedUserIds);
      } catch (error) {
        console.error('Fel vid hämtning av gillade användare:', error);
      }
    };

    fetchLikedUsers();
  }, []);

  useEffect(() => {
    const fetchSkippedUsers = async () => {
      const authUser = auth.currentUser;
      if (!authUser) return;

      try {
        const skippedSnapshot = await getDocs(
          collection(db, 'users', authUser.uid, 'skipped')
        );
        const skippedIds = skippedSnapshot.docs.map((doc) => doc.id);
        setSkippedUsers(skippedIds);
      } catch (error) {
        console.error('Fel vid hämtning av skippade användare:', error);
      }
    };

    fetchSkippedUsers();
  }, []);

  const handleLike = async (targetUserId: string) => {
    const fromUserId = auth.currentUser?.uid;
    if (!fromUserId || likedUsers.includes(targetUserId)) return;

    try {
      const likeRefReceived = doc(
        db,
        'users',
        targetUserId,
        'likesReceived',
        fromUserId
      );
      const likeRefGiven = doc(
        db,
        'users',
        fromUserId,
        'likesGiven',
        targetUserId
      );

      await Promise.all([
        setDoc(likeRefReceived, {
          fromUserId,
          timestamp: serverTimestamp(),
        }),
        setDoc(likeRefGiven, {
          toUserId: targetUserId,
          timestamp: serverTimestamp(),
        }),
      ]);

      setLikedUsers((prev) => [...prev, targetUserId]);

      // Match-check
      const reverseLikeDoc = await getDoc(
        doc(db, 'users', targetUserId, 'likesGiven', fromUserId)
      );
      if (reverseLikeDoc.exists()) {
        const matchId = [fromUserId, targetUserId].sort().join('_');
        const matchData = {
          users: [fromUserId, targetUserId],
          timestamp: serverTimestamp(),
        };

        await Promise.all([
          setDoc(doc(db, 'users', fromUserId, 'matches', targetUserId), matchData),
          setDoc(doc(db, 'users', targetUserId, 'matches', fromUserId), matchData),
          setDoc(doc(db, 'chats', matchId), {
            participants: [fromUserId, targetUserId],
            createdAt: serverTimestamp(),
            messages: [],
          }),
        ]);

        alert('💘 Det blev en match! En chatt har skapats.');
      }
    } catch (error) {
      console.error('Fel vid gilla:', error);
      alert(
        'Fel vid gilla. Kontrollera att du är inloggad och har rättigheter.'
      );
    }
  };

  const handleSkip = async (userId: string) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid || skippedUsers.includes(userId)) return;

    try {
      setFadingUsers((prev) => [...prev, userId]);

      setTimeout(async () => {
        setSkippedUsers((prev) => [...prev, userId]);
        const skipRef = doc(db, 'users', currentUid, 'skipped', userId);
        await setDoc(skipRef, { timestamp: serverTimestamp() });

        setFadingUsers((prev) => prev.filter((id) => id !== userId));
      }, 300);
    } catch (error) {
      console.error('Fel vid skip:', error);
    }
  };

  return (
    <div className='mx-auto max-w-7xl bg-gray-50 p-4'>
      <UserNav />
      <UserResponsiveNav />
      <h1 className='text-4xl font-semibold my-4'>Alla användare</h1>

      {/* Dropdown för könsfilter */}
      <div className='mb-6'>
        <label htmlFor='genderFilter' className='mr-2 font-medium'>
          Filtrera kön:
        </label>
        <select
          id='genderFilter'
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className='border rounded px-2 py-1'
        >
          <option value='all'>Alla</option>
          <option value='kvinna'>Kvinnor</option>
          <option value='man'>Män</option>
        </select>
      </div>

      <section className='flex flex-col justify-center md:justify-center  lg:justify-center lg:items-start'>
        <div className='flex flex-wrap justify-center md:justify-center lg:justify-center gap-6'>
          {users
            .filter((user) => !skippedUsers.includes(user.id))
            .filter((user) => {
              if (genderFilter === 'all') return true;
              return user.gender === genderFilter;
            })
            .map((user) => (
              <div key={user.id} className='relative'>
                {likedUsers.includes(user.id) && (
                  <div className='absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg'>
                    <h1 className='text-xl mr-2 font-semibold text-black'>
                      Gillad
                    </h1>
                    <PiHeartDuotone className='text-red-500' />
                  </div>
                )}

                <div
                  className={`flex flex-col items-center bg-white p-4 rounded-lg shadow-xl min-w-[250px] max-w-[200px] hover:shadow-lg transition-all duration-300 ease-in-out relative z-0 ${
                    likedUsers.includes(user.id)
                      ? 'opacity-50 grayscale pointer-events-none'
                      : ''
                  } ${
                    fadingUsers.includes(user.id)
                      ? 'opacity-0 scale-95'
                      : 'opacity-100 scale-100'
                  }`}
                >
                  <Link href={`/User/${user.id}`}>
                    <img
                      src={user.profileImage || User.src}
                      onError={(e: any) => (e.target.src = User.src)}
                      alt={user.displayName || 'Profilbild'}
                      className='h-[200px] w-[200px] object-cover mb-4 rounded'
                    />
                  </Link>
                  <h2 className='text-lg font-semibold mb-1'>
                    {user.displayName || 'Anonym'}
                  </h2>
                  <p className='mb-8'>
                    Ålder:{' '}
                    {user.birthdate ? calculateAge(user.birthdate) : 'Okänd'}
                  </p>
                  <div className='flex flex-row items-center gap-4'>
                    <button
                      type='button'
                      onClick={() => handleSkip(user.id)}
                      className='bg-slate-200 p-4 rounded-full text-2xl shadow-lg transition-all ease-in-out duration-300 hover:bg-black hover:text-white'
                      aria-label='Hoppa över användare'
                    >
                      <PiXLogoLight />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleLike(user.id)}
                      disabled={likedUsers.includes(user.id)}
                      className={`p-4 text-white rounded-full text-2xl shadow-lg transition-all ease-in-out duration-300 ${
                        likedUsers.includes(user.id)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-rose-400 hover:bg-rose-700 hover:text-rose-300'
                      }`}
                      aria-label='Gilla användare'
                    >
                      <PiHeartDuotone />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

function calculateAge(birthdate: any) {
  const birth = birthdate.toDate ? birthdate.toDate() : new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default Page;
