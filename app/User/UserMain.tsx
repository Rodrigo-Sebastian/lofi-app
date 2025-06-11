'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import MultipleQuestions from '../components/MultipleQuestions';
import MainInfo from '../components/MainInfo';
import ProfilePic from '../components/ProfilePic';
import BirthdaySection from '../components/BirthdaySection';
import UserImageGrid from '../components/UserImageGrid';

import { PiHeartDuotone, PiXLogoLight } from 'react-icons/pi';
import { deleteAccountAndData } from '@/lib/deleteAccount';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

// --- Lightbox komponent direkt här för enkelhet ---
const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        disabled={currentIndex === 0}
        className='absolute left-4 top-1/2 text-white text-4xl select-none'
        aria-label='Föregående bild'
      >
        ‹
      </button>

      <img
        src={images[currentIndex]}
        alt={`Bild ${currentIndex + 1}`}
        className='max-h-[80vh] max-w-[90vw] object-contain'
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        disabled={currentIndex === images.length - 1}
        className='absolute right-4 top-1/2 text-white text-4xl select-none'
        aria-label='Nästa bild'
      >
        ›
      </button>

      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-white text-3xl'
        aria-label='Stäng lightbox'
      >
        ×
      </button>
    </div>
  );
};

interface UserMainProps {
  id: string;
}

interface ImageType {
  url: string;
  path: string;
}

interface UserData {
  multipleQuestions?: any[]; 
  mainInfo?: any[]; 
  profileImage?: string;
  birthdaySection?: any; 
  userImages?: ImageType[];
}

const UserMain: React.FC<UserMainProps> = ({ id }) => {
  const router = useRouter();
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // State för lösenord i delete confirmation
  const [password, setPassword] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  // State för att visa overlay efter like/skip
  const [showActionOverlay, setShowActionOverlay] = useState<'liked' | 'skipped' | null>(null);

  // State för fade in av like/skip knappar
  const [showButtons, setShowButtons] = useState<boolean>(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  useEffect(() => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      setAuthUid(uid);
      setIsOwnProfile(uid === id);
    }
  }, [id]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          console.warn('Ingen användare hittades med id:', id);
        }
      } catch (error) {
        console.error('Fel vid hämtning av användardata:', error);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (!isOwnProfile) {
      const timer = setTimeout(() => {
        setShowButtons(true);
      }, 1000); // Delay på 1 sekund

      return () => clearTimeout(timer);
    } else {
      // Om det är egen profil, visa inte knapparna alls
      setShowButtons(false);
    }
  }, [isOwnProfile]);

  const handleSave = async () => {
    if (!userData) return;

    try {
      const userRef = doc(db, 'users', id);
      await setDoc(userRef, userData, { merge: true });
      router.push(`/Dashboard/${id}`);
    } catch (error) {
      console.error('Fel vid sparande av användardata:', error);
      alert('Det gick inte att spara användardata.');
    }
  };

  // Hantera konto-radering
  const handleDelete = async () => {
    setDeleteError('');
    const user = auth.currentUser;

    if (!user) {
      alert('Ingen användare är inloggad.');
      return;
    }

    if (!password) {
      setDeleteError('Ange ditt lösenord för att bekräfta.');
      return;
    }

    try {
      const success = await deleteAccountAndData(password);

      if (success) {
        router.push('/Login');
      } else {
        setDeleteError('Raderingen misslyckades. Försök igen.');
      }
    } catch (error: any) {
      console.error('Fel vid radering:', error);
      setDeleteError('Ett oväntat fel uppstod. Försök igen.');
    }
  };

  // Funktion för att gilla användaren
  const handleLike = async () => {
    const fromUserId = auth.currentUser?.uid;
    if (!fromUserId || fromUserId === id) return;

    try {
      const likeRefReceived = doc(db, 'users', id, 'likesReceived', fromUserId);
      const likeRefGiven = doc(db, 'users', fromUserId, 'likesGiven', id);

      // 1. Spara att du gillar användaren
      await Promise.all([
        setDoc(likeRefReceived, {
          fromUserId,
          timestamp: serverTimestamp(),
        }),
        setDoc(likeRefGiven, {
          toUserId: id,
          timestamp: serverTimestamp(),
        }),
      ]);

      // 2. Kontrollera om den andra användaren redan har gillat dig
      const reverseLikeDoc = await getDoc(
        doc(db, 'users', id, 'likesGiven', fromUserId)
      );
      const isMatch = reverseLikeDoc.exists();

      if (isMatch) {
        const matchId = createMatchId(fromUserId, id);

        // 3. Skapa match för båda användare
        const matchData = {
          user1: fromUserId,
          user2: id,
          timestamp: serverTimestamp(),
          matchId,
        };

        await Promise.all([
          setDoc(doc(db, 'users', fromUserId, 'matches', id), matchData),
          setDoc(doc(db, 'users', id, 'matches', fromUserId), matchData),
        ]);

        console.log('Match skapad!');
      }

      setShowActionOverlay('liked');
      setTimeout(() => setShowActionOverlay(null), 2000);
    } catch (error: any) {
      console.error('Fel vid gilla:', error);
      alert('Fel vid gilla. Kontrollera att du är inloggad.');
    }
  };

  // Hjälpfunktion
  function createMatchId(uid1: string, uid2: string) {
    return [uid1, uid2].sort().join('_');
  }

  // Funktion för att hoppa över användaren
  const handleSkip = async () => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    try {
      const skipRef = doc(db, 'users', currentUid, 'skipped', id);
      await setDoc(skipRef, { timestamp: serverTimestamp() });

      setShowActionOverlay('skipped');
      setTimeout(() => setShowActionOverlay(null), 2000);
    } catch (error) {
      console.error('Fel vid skip:', error);
    }
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : i));
  };

  const goNext = () => {
    setLightboxIndex((i) =>
      i < ((userData?.userImages?.length || 1) - 1) ? i + 1 : i
    );
  };

  if (!userData) return <div>Laddar användardata...</div>;

  return (
    <div className='relative flex flex-row justify-center gap-8'>
      <main className='p-4 h-full w-full'>
        <div className='flex flex-row justify-between items-center'>
          <div className='flex flex-col gap-2 '>
            <h1 className='text-4xl font-semibold'>Profil</h1>
            <p className='text-md text-gray-600'>
              {isOwnProfile
                ? 'Uppdatera din profil detaljer'
                : 'Visar annan användares profil'}
            </p>
          </div>

          {isOwnProfile && (
            <button
              onClick={handleSave}
              className='px-6 py-2 rounded-md bg-black text-white transition-all ease-in-out duration-300 hover:bg-stone-500'
            >
              Spara
            </button>
          )}
        </div>

        <div className='flex flex-col-reverse lg:flex-row justify-between gap-4 mt-10'>
          <MultipleQuestions
            data={userData.multipleQuestions}
            onChange={
              isOwnProfile
                ? (val) =>
                    setUserData((prev) => ({ ...prev, multipleQuestions: val }))
                : undefined
            }
            readOnly={!isOwnProfile}
          />
          <MainInfo
            data={userData.mainInfo}
            onChange={
              isOwnProfile
                ? (val) => setUserData((prev) => ({ ...prev, mainInfo: val }))
                : undefined
            }
            readOnly={!isOwnProfile}
          />
          <ProfilePic
            size={200}
            src={userData.profileImage}
            onSave={
              isOwnProfile
                ? (val) => setUserData((prev) => ({ ...prev, profileImage: val }))
                : undefined
            }
            readOnly={!isOwnProfile}
          />
        </div>

        <div>
          <BirthdaySection
            userId={id}
            userData={userData.birthdaySection}
            onSave={
              isOwnProfile
                ? (val) =>
                    setUserData((prev) => ({ ...prev, birthdaySection: val }))
                : undefined
            }
            readOnly={!isOwnProfile}
            isOwnProfile={isOwnProfile}
          />
          <UserImageGrid
            images={userData.userImages || []}
            onSave={
              isOwnProfile
                ? (val) =>
                    setUserData((prev) => ({ ...prev, userImages: val }))
                : undefined
            }
            readOnly={!isOwnProfile}
            onImageClick={openLightbox} // Här kopplar vi in lightbox-open funktionen
          />
        </div>

        {isOwnProfile && (
          <div className='mt-10'>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition'
            >
              Radera konto
            </button>
          </div>
        )}
      </main>

      {/* Like och Skip knappar när det inte är egen profil, med fade-in efter 2 sek */}
      {!isOwnProfile && (
        <div
          className={`
            fixed bottom-8 right-10 lg:right-[350px] flex gap-4 z-50 bg-white p-2 shadow-2xl rounded-xl
            transition duration-500 ease-in-out
            ${
              showButtons
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }
          `}
        >
          <button
            onClick={handleSkip}
            className='bg-gray-300 p-4 rounded-full text-2xl hover:bg-black hover:text-white transition'
            aria-label='Hoppa över användare'
          >
            <PiXLogoLight />
          </button>
          <button
            onClick={handleLike}
            className='bg-rose-400 p-4 rounded-full text-2xl hover:bg-rose-700 hover:text-rose-300 transition'
            aria-label='Gilla användare'
          >
            <PiHeartDuotone />
          </button>
        </div>
      )}

      {/* Overlay vid like eller skip */}
      {showActionOverlay === 'liked' && (
        <div className='fixed inset-0 bg-white/70 flex items-center justify-center z-40 rounded-lg text-2xl font-semibold text-red-600'>
          <p>Du har gillat användaren!</p>
        </div>
      )}

      {showActionOverlay === 'skipped' && (
        <div className='fixed inset-0 bg-white/70 flex items-center justify-center z-40 rounded-lg text-2xl font-semibold text-gray-700'>
          <p>Du har hoppat över användaren!</p>
        </div>
      )}

      {/* Radera konto modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center'>
            <h2 className='text-xl font-semibold mb-4'>Radera konto?</h2>
            <p className='text-gray-700 mb-4'>
              Detta raderar all din information permanent. Ange ditt lösenord för
              att bekräfta.
            </p>

            <input
              type='password'
              placeholder='Lösenord'
              className='w-full p-2 border border-gray-300 rounded mb-4'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {deleteError && <p className='text-red-600 mb-4'>{deleteError}</p>}

            <div className='flex justify-center gap-4 '>
              <button
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md'
              >
                Ja, radera
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError('');
                  setPassword('');
                }}
                className='bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md'
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
      {lightboxOpen && (
        <Lightbox
          images={userData.userImages?.map(img => img.url) || []}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      
      )}
    </div>
  );
};

export default UserMain;
