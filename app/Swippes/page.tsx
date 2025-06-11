'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

import UserNav from '../User/UserNav';
import UserResponsiveNav from '../User/UserResponsiveNav';

import { PiHeartDuotone, PiXLogoLight } from 'react-icons/pi';

interface UserData {
  id: string;
  displayName?: string;
  profileImage?: string;
  [key: string]: any;
}

const Page: React.FC = () => {
  const [likedByUsers, setLikedByUsers] = useState<UserData[]>([]);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [skippedUsers, setSkippedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchLikedByUsers = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const likesRef = collection(db, 'users', uid, 'likesReceived');
        const likesSnapshot = await getDocs(likesRef);

        const likedBy = await Promise.all(
          likesSnapshot.docs.map(async (docSnap) => {
            const fromUserId = docSnap.id;
            const userDoc = await getDoc(doc(db, 'users', fromUserId));
            const userData = userDoc.data();
            return {
              id: fromUserId,
              ...userData,
            } as UserData;
          })
        );
        setLikedByUsers(likedBy);
      } catch (error) {
        console.error('Fel vid hämtning av likes:', error);
      }
    };

    const fetchLikedAndSkipped = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const likesGiven = await getDocs(collection(db, 'users', uid, 'likesGiven'));
        const skipped = await getDocs(collection(db, 'users', uid, 'skipped'));

        const likedIds = likesGiven.docs.map(doc => doc.id);
        const skippedIds = skipped.docs.map(doc => doc.id);

        setLikedUsers(likedIds);
        setSkippedUsers(skippedIds);
      } catch (error) {
        console.error('Fel vid hämtning av likesGiven/skipped:', error);
      }
    };

    fetchLikedByUsers();
    fetchLikedAndSkipped();
  }, []);

  const handleLikeBack = async (targetUserId: string) => {
    const fromUserId = auth.currentUser?.uid;
    if (!fromUserId || likedUsers.includes(targetUserId)) return;

    try {
      const likeRefReceived = doc(db, 'users', targetUserId, 'likesReceived', fromUserId);
      const likeRefGiven = doc(db, 'users', fromUserId, 'likesGiven', targetUserId);

      await Promise.all([
        setDoc(likeRefReceived, {
          fromUserId,
          timestamp: serverTimestamp()
        }),
        setDoc(likeRefGiven, {
          toUserId: targetUserId,
          timestamp: serverTimestamp()
        })
      ]);

      setLikedUsers(prev => [...prev, targetUserId]);

      const reverseLikeDoc = await getDoc(doc(db, 'users', targetUserId, 'likesGiven', fromUserId));
      if (reverseLikeDoc.exists()) {
        const sortedIds = [fromUserId, targetUserId].sort();
        const matchId = `${sortedIds[0]}_${sortedIds[1]}`;

        const matchData = {
          users: [fromUserId, targetUserId],
          timestamp: serverTimestamp()
        };

        await setDoc(doc(db, 'users', fromUserId, 'matches', targetUserId), matchData);
        await setDoc(doc(db, 'matches', matchId), {
          participants: [fromUserId, targetUserId],
          createdAt: serverTimestamp()
        });

        const chatDocRef = doc(db, 'chats', matchId);
        const chatDoc = await getDoc(chatDocRef);
        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            participants: [fromUserId, targetUserId],
            createdAt: serverTimestamp(),
            messages: []
          });
        }

        alert('💘 Det blev en match! En chatt har skapats.');
      }
    } catch (error) {
      console.error("Fel vid gilla tillbaka:", error);
    }
  };

  const handleSkip = async (userId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid || skippedUsers.includes(userId)) return;

    try {
      const skipRef = doc(db, 'users', uid, 'skipped', userId);
      await setDoc(skipRef, { timestamp: serverTimestamp() });
      setSkippedUsers(prev => [...prev, userId]);
    } catch (error) {
      console.error("Fel vid skip:", error);
    }
  };

  return (
    <div className='mx-auto max-w-7xl bg-gray-50 p-4'>
      <UserNav />
      <UserResponsiveNav />

      <section>
        <h1 className='text-xl lg:text-2xl font-semibold mt-10'>Användare som har gillat dig</h1>
        <Link
          href="/Match"
          className="text-sm mt-2 p-3 inline-block lg:my-4 lg:p-4 bg-black text-white rounded transition-all ease-in-out duration-300 hover:bg-slate-600"
        >
          Se dina matcher och chatta
        </Link>

        {likedByUsers.length === 0 ? (
          <div className="flex flex-col items-center mt-6">
            <p className="text-gray-600 text-lg mb-4">Inga likes ännu.</p>
            <Image
              src="/images/swippes.png"
              alt='inga likes ännu'
              width={400}
              height={400}
              className='opacity-80'
              priority
            />
          </div>
        ) : (
          <div className='flex flex-wrap lg:justify-start justify-center gap-6'>
            {likedByUsers
              .filter(user => !skippedUsers.includes(user.id))
              .map((user) => (
                <div
                  key={user.id}
                  className='flex flex-col items-center bg-white p-4 rounded-lg shadow-xl min-w-[250px] max-w-[200px] hover:shadow-lg transition-all duration-300 ease-in-out relative'
                >
                  <Link href={`/User/${user.id}`}>
                    <img
                      src={user.profileImage || '/images/user-icon.webp'}
                      alt="profil"
                      className='h-[200px] w-[200px] object-cover mb-4 rounded'
                    />
                    <h2 className="mt-4 text-lg text-center font-semibold">
                      {user.displayName || 'Anonym'}
                    </h2>
                  </Link>

                  <div className='flex flex-row items-center gap-4 mt-4'>
                    <button
                      type='button'
                      onClick={() => handleSkip(user.id)}
                      className='bg-slate-200 p-4 rounded-full text-2xl shadow-lg hover:bg-black hover:text-white transition'
                    >
                      <PiXLogoLight />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleLikeBack(user.id)}
                      disabled={likedUsers.includes(user.id)}
                      className={`p-4 text-white rounded-full text-2xl shadow-lg transition ${
                        likedUsers.includes(user.id)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-rose-400 hover:bg-rose-700 hover:text-rose-300'
                      }`}
                    >
                      <PiHeartDuotone />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Page;
