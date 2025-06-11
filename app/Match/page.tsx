'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import UserNav from '../User/UserNav';
import UserResponsiveNav from '../User/UserResponsiveNav';
import { PiChatCircleDotsLight } from 'react-icons/pi';

interface UserData {
  displayName?: string;
  profileImage?: string;
}

interface Match {
  id: string;
  userData?: UserData | null;
  unreadMessages?: number;
}

function createMatchId(uid1: string | undefined, uid2: string) {
  return [uid1, uid2].sort().join('_');
}

const MatchPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError('Ingen användare är inloggad.');
      setLoading(false);
      return;
    }

    const matchesRef = collection(db, 'users', uid, 'matches');

    // Lyssna i realtid på matcherna
    const unsubscribeMatches = onSnapshot(
      matchesRef,
      async (snapshot) => {
        const matchesData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const matchUserId = docSnap.id;
            const matchInfo = docSnap.data();

            // Hämta användardata för matchen
            const userDoc = await getDoc(doc(db, 'users', matchUserId));
            const userData = userDoc.exists() ? userDoc.data() as UserData : null;

            // Läs unreadMessages (om finns), annars 0
            const unreadMessages = matchInfo.unreadMessages || 0;

            return {
              id: matchUserId,
              ...matchInfo,
              userData,
              unreadMessages,
            };
          })
        );

        setMatches(matchesData as Match[]);
        setLoading(false);
      },
      (error) => {
        setError('Fel vid hämtning av matcher: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribeMatches();
  }, []);

  if (loading) {
    return <p>Laddar matcher...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4 bg-gray-50">
      <UserNav />
      <UserResponsiveNav />
      <h1 className="text-3xl font-bold mt-10 ">Dina matcher</h1>
      {matches.length === 0 ? (
        <div className="mt-24">
          <p className="mt-4 text-center">Du har inga matcher ännu.</p>
          <Image
            src="/images/match.webp"
            alt="inga matchningar ännu"
            width={400}
            height={400}
            priority
            className="mx-auto opacity-80"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matches.map(({ id, userData, unreadMessages }) => {
            const currentUid = auth.currentUser?.uid;
            const matchId = createMatchId(currentUid, id);

            return (
              <div
                key={id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center relative"
              >
                <img
                  src={userData?.profileImage || '/images/user-icon.webp'}
                  alt={userData?.displayName || 'Användare'}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h2 className="text-xl font-semibold text-center mb-2">
                  {userData?.displayName || 'Anonym'}
                </h2>
                <div className="flex gap-4">
                  <Link
                    href={`/User/${id}`}
                    className="flex items-center bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 transition"
                  >
                    Besök profil
                  </Link>
                  <Link
                    href={`/Match/chat/${matchId}`}
                    className="bg-black text-white rounded-full p-2 text-4xl hover:bg-slate-500 transition-all ease-in-out duration-300 relative"
                  >
                    <PiChatCircleDotsLight />
                    {unreadMessages !== undefined && unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchPage;
