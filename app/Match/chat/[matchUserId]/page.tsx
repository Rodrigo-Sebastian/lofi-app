'use client';

import React, { use, useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import UserNav from '@/app/User/UserNav';
import UserResponsiveNav from '@/app/User/UserResponsiveNav';
import { PiCamera } from "react-icons/pi";

interface ChatPageProps {
  params: Promise<{ matchUserId: string }>;
}

interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  createdAt: any;
  likes?: string[];
}

const ChatPage: React.FC<ChatPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const matchUserId = resolvedParams.matchUserId;

  const currentUser = auth.currentUser;
  const currentUserId = currentUser?.uid;
  const [currentUserName, setCurrentUserName] = useState<string>('Du');
  const [partnerName, setPartnerName] = useState<string>('Okänd');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  if (!currentUserId) return <p>Logga in för att se chatten.</p>;

  const partnerId = matchUserId.split('_').find((id: string) => id !== currentUserId);
  if (!partnerId) {
    return <p>Ogiltigt matchId: kunde inte hitta partnerId.</p>;
  }

  const sorted = [currentUserId, partnerId].sort();
  const matchId = `${sorted[0]}_${sorted[1]}`;

  useEffect(() => {
    if (!currentUser) return;
    const name = currentUser.displayName;
    if (name) {
      setCurrentUserName(name);
    } else {
      getDoc(doc(db, 'users', currentUserId)).then(snap => {
        if (snap.exists() && snap.data().displayName) {
          setCurrentUserName(snap.data().displayName);
        }
      });
    }
  }, [currentUser, currentUserId]);

  useEffect(() => {
    if (!partnerId) return;
    getDoc(doc(db, 'users', partnerId)).then(snap => {
      if (snap.exists() && snap.data().displayName) {
        setPartnerName(snap.data().displayName);
      }
    });
  }, [partnerId]);

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (!matchId) return;

    const q = query(
      collection(db, 'chats', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const newMessages = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
      setMessages(newMessages);

      if (newMessages.length > prevMessagesLength.current) {
        scrollToBottom();
      }
      prevMessagesLength.current = newMessages.length;
    });
    return () => unsub();
  }, [matchId]);

  useEffect(() => {
    if (!currentUserId || !partnerId) return;
    const matchDocRef = doc(db, 'users', currentUserId, 'matches', partnerId);
    const resetUnread = async () => {
      try {
        await updateDoc(matchDocRef, { unreadMessages: 0 });
      } catch (err) {
        console.error('Kunde inte nollställa olästa meddelanden:', err);
      }
    };
    resetUnread();
  }, [currentUserId, partnerId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!currentUserId || !partnerId) return;

    try {
      await addDoc(collection(db, 'chats', matchId, 'messages'), {
        text: newMessage,
        senderId: currentUserId,
        createdAt: serverTimestamp(),
        likes: [],
      });

      scrollToBottom();

      const partnerMatchRef = doc(db, 'users', partnerId, 'matches', currentUserId);
      await updateDoc(partnerMatchRef, { unreadMessages: increment(1) });
      setNewMessage('');
    } catch (err) {
      console.error('Fel vid skicka meddelande:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !partnerId) return;

    const storage = getStorage();
    const storageRef = ref(storage, `chatImages/${matchId}/${Date.now()}_${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'chats', matchId, 'messages'), {
        imageUrl,
        senderId: currentUserId,
        createdAt: serverTimestamp(),
        likes: [],
      });

      scrollToBottom();

      const partnerMatchRef = doc(db, 'users', partnerId, 'matches', currentUserId);
      await updateDoc(partnerMatchRef, { unreadMessages: increment(1) });
    } catch (err) {
      console.error('Kunde inte ladda upp bild:', err);
    }
  };

  const toggleLike = async (msgId: string, currentLikes: string[] = []) => {
    if (!currentUserId || !partnerId) return;
    if (!msgId) return;

    const messageRef = doc(db, 'chats', matchId, 'messages', msgId);
    const hasLiked = currentLikes.includes(currentUserId);

    try {
      await updateDoc(messageRef, {
        likes: hasLiked
          ? currentLikes.filter(uid => uid !== currentUserId)
          : [...currentLikes, currentUserId],
      });
    } catch (err) {
      console.error('Fel vid toggleLike:', err);
    }
  };

  const getSenderName = (id: string) =>
    id === currentUserId ? currentUserName : partnerName;

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col h-screen">
      <UserNav />
      <UserResponsiveNav />
      <h1 className="text-2xl font-bold mb-4">
        Chatt mellan {currentUserName} och {partnerName}
      </h1>

      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto border rounded p-4 mb-4 bg-white shadow flex flex-col"
      >
        {messages.length === 0 ? (
          <p>Ingen konversation ännu.</p>
        ) : (
          messages.map(msg => {
            const isCurrentUser = msg.senderId === currentUserId;
            const hasLiked = msg.likes?.includes(currentUserId!) ?? false;

            return (
              <div
                key={`${msg.id}-${msg.likes ? msg.likes.join('-') : ''}`}
                className={`mb-4 max-w-xs relative cursor-pointer select-none ${isCurrentUser ? 'self-end' : 'self-start'}`}
                onDoubleClick={() => toggleLike(msg.id, msg.likes)}
                title={hasLiked ? 'Ta bort like' : 'Gilla meddelandet'}
              >
                <div className={`text-xs font-medium text-gray-500 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {getSenderName(msg.senderId)}
                </div>
                <div className={`mt-1 p-2 rounded pl-2 ${isCurrentUser ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                  {msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="uppladdad bild" className="max-w-xs max-h-64 rounded" />
                  ) : (
                    msg.text
                  )}
                </div>
                 {Array.isArray(msg.likes) && msg.likes.length > 0 && (
                  <div className="absolute bottom-[-25px] end-0 text-red-500 text-xl select-none animate-fade-in" aria-label="Liked" style={{ pointerEvents: 'none' }}>
                    ❤️
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 items-center">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage();
          }}
          className="flex-grow rounded border p-2"
          placeholder="Skriv ett meddelande..."
        />
        <label htmlFor="imageUpload" className="bg-gray-200 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
          <PiCamera className='text-2xl' />
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded hover:bg-slate-700 transition"
        >
          Skicka
        </button>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
