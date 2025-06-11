'use client';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { PiPencilSimpleLineLight, PiTrashLight } from 'react-icons/pi';

interface QuestionItem {
  id: number;
  description: string;
}

interface MultipleQuestionsProps {
  data?: QuestionItem[];
  onChange?: (data: QuestionItem[]) => void;
  readOnly?: boolean;
  onSave?: (data: QuestionItem[]) => void;
}

const MultipleQuestions: React.FC<MultipleQuestionsProps> = ({
  data,
  onChange,
  readOnly = false,
  onSave,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedQuestions, setEditedQuestions] = useState<QuestionItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // 🔁 Hantera visning av prop-data (för användarsida)
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setQuestions(data);
    }
  }, [data]);

  // 🔁 Ladda användarens egna data från Firestore (om ingen prop-data finns)
  useEffect(() => {
    if (!data) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data().multipleQuestions;
            if (firestoreData) {
              setQuestions(firestoreData);
            }
          }
        }
      });

      return () => unsubscribe();
    }
  }, [data]);

  const handleEdit = () => {
    setEditedQuestions([...questions]);
    setIsEditing(true);
  };

  const handleChange = (index: number, newValue: string) => {
    const updated = [...editedQuestions];
    updated[index].description = newValue;
    setEditedQuestions(updated);

    if (error && newValue.trim().length > 0) {
      setError('');
    }

    if (onChange) {
      onChange(updated);
    }
  };

  const handleDelete = (index: number) => {
    const updated = [...editedQuestions];
    updated.splice(index, 1);
    setEditedQuestions(updated);
  };

  const handleAdd = () => {
    if (!isEditing) {
      setEditedQuestions([...questions]);
      setIsEditing(true);
    }

    const hasEmpty = editedQuestions.some((q) => q.description.trim() === '');
    if (hasEmpty) {
      setError(
        'Fyll i den tomma aktiviteten innan du lägger till en ny aktivitet'
      );
      return;
    }

    const newItem: QuestionItem = {
      id: Date.now(),
      description: '',
    };
    setEditedQuestions([...editedQuestions, newItem]);
    setError('');
  };

  const handleSave = async () => {
    if (!userId) return;

    const allFilled = editedQuestions.every(
      (q) => q.description.trim().length > 0
    );

    if (!allFilled) {
      alert('Vänligen fyll i alla aktiviteter innan du sparar.');
      return;
    }

    setError('');

    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      { multipleQuestions: editedQuestions },
      { merge: true }
    );

    setQuestions([...editedQuestions]);
    setIsEditing(false);

    if (onSave) {
      onSave(editedQuestions);
    }
  };

  return (
    <div className='w-full lg:w-[350px]'>
      <div className='flex flex-row gap-2 items-center'>
        <h1 className='font-semibold text-xl'>Vad du gillar att göra</h1>
        {!readOnly && !isEditing ? (
          <span
            className='text-2xl cursor-pointer transition-all ease-in-out duration-300 hover:text-zinc-600'
            onClick={handleEdit}
          >
            <PiPencilSimpleLineLight />
          </span>
        ) : null}
        {!readOnly && isEditing && (
          <button
            className='ml-auto px-4 py-1 text-sm bg-black text-white rounded-md transition-all duration-300 hover:bg-gray-700'
            onClick={handleSave}
          >
            Spara
          </button>
        )}
      </div>

      {error && (
        <div className='mt-4 text-red-800 text-sm font-medium'>{error}</div>
      )}
      <ul className='flex flex-col gap-4 mt-5'>
        {(isEditing ? editedQuestions : questions).map((question, index) => (
          <li
            key={question.id}
            className='rounded-md p-4 w-auto text-sm shadow-md'
          >
            {isEditing ? (
              <>
                <input
                  type='text'
                  placeholder='Resa jorden runt...'
                  value={question.description}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'
                />
                <button
                  className='mt-4'
                  onClick={() => handleDelete(index)}
                  title='Radera'
                >
                  <PiTrashLight size={20} />
                </button>
              </>
            ) : (
              question.description
            )}
          </li>
        ))}
      </ul>

      {!readOnly && editedQuestions.length < 6 && (
        <button
          className='mt-4 px-6 py-2 rounded-md bg-blue-600 text-white transition-all ease-in-out duration-300 hover:bg-blue-700'
          onClick={handleAdd}
        >
          Lägg till aktivitet
        </button>
      )}
    </div>
  );
};

export default MultipleQuestions;
