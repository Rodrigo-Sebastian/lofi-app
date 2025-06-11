'use client';

import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import {
  PiCakeLight,
  PiGenderMaleLight,
  PiBookOpenTextLight,
  PiGlobeStandLight,
  PiBabyCarriageLight,
  PiCigaretteLight,
  PiWineLight,
  PiRulerLight,
  PiMapPinLight,
  PiPencilSimpleLineLight,
} from 'react-icons/pi';

interface UserInfoItem {
  id: number;
  text: string;
  placeholder: string;
}

interface BirthdaySectionProps {
  userId?: string;
  userData?: UserInfoItem[];
  readOnly?: boolean;
  isOwnProfile: boolean;
  onSave?: (data: UserInfoItem[]) => void;
}

const BirthdaySection: React.FC<BirthdaySectionProps> = ({
  userId,
  userData,
  readOnly = false,
  onSave,
}) => {
  const initialUserInfo: UserInfoItem[] = [
    { id: 0, text: '', placeholder: 'Ange din födelsedag' },
    { id: 1, text: '', placeholder: 'Välj kön' },
    { id: 7, text: '', placeholder: 'Välj längd' },
    { id: 2, text: '', placeholder: 'Ange yrke' },
    { id: 9, text: '', placeholder: 'Ange plats' },
    { id: 3, text: '', placeholder: 'Välj etnicitet' },
    { id: 4, text: '', placeholder: 'Välj inställning till barn' },
    { id: 5, text: '', placeholder: 'Välj rökvanor' },
    { id: 6, text: '', placeholder: 'Välj alkoholvanor' },
  ];

  const [userInfo, setUserInfo] = useState<UserInfoItem[]>(initialUserInfo);
  const [editedInfo, setEditedInfo] = useState<UserInfoItem[]>(initialUserInfo);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const isOwnProfile = !readOnly;

  useEffect(() => {
    const fetchData = async () => {
      const targetId = userId || (auth.currentUser && auth.currentUser.uid);
      if (!targetId) return;

      const userRef = doc(db, 'users', targetId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const birthdayData = (data.birthdaySection ||
          initialUserInfo) as UserInfoItem[];
        setUserInfo(birthdayData);
        setEditedInfo(birthdayData);
      } else {
        setUserInfo(initialUserInfo);
        setEditedInfo(initialUserInfo);
      }
    };

    if (!userData) {
      fetchData();
    } else {
      setUserInfo(userData);
      setEditedInfo(userData);
    }
  }, [userId, userData]);

  const handleChange = (index: number, newValue: string) => {
    const updated = [...editedInfo];
    updated[index].text = newValue;
    setEditedInfo(updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const updateBirthday = (
    index: number,
    day: string,
    month: string,
    year: string
  ) => {
    const updated = [...editedInfo];
    updated[index].text = `${day} ${month} ${year}`;
    setEditedInfo(updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors: { [key: number]: string } = {};
    editedInfo.forEach((info, idx) => {
      if (!info.text?.trim()) {
        newErrors[idx] = 'Fältet måste fyllas i';
      } else if (info.id === 0) {
        const parts = info.text.split(' ');
        if (parts.length !== 3 || parts.some((p) => p === '')) {
          newErrors[idx] = 'Välj dag, månad och år';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toTimestamp = (date: Date) => Timestamp.fromDate(date);

  const handleSave = async () => {
    if (!validate()) return;

    const user = auth.currentUser;
    if (!user) return;

    setUserInfo([...editedInfo]);
    setIsEditing(false);

    const userRef = doc(db, 'users', user.uid);
    const birthdayText = editedInfo[0]?.text;
    let birthdate: Date | null = null;

    if (birthdayText) {
      const [day, monthStr, year] = birthdayText.split(' ');
      const monthsMap: { [key: string]: number } = {
        januari: 0,
        februari: 1,
        mars: 2,
        april: 3,
        maj: 4,
        juni: 5,
        juli: 6,
        augusti: 7,
        september: 8,
        oktober: 9,
        november: 10,
        december: 11,
      };
      const month = monthsMap[monthStr?.toLowerCase() || ''];
      if (!isNaN(Number(day)) && !isNaN(month) && !isNaN(Number(year))) {
        birthdate = new Date(Number(year), month, Number(day));
      }
    }

    const updateData: { [key: string]: any } = { birthdaySection: editedInfo };
    if (birthdate) updateData.birthdate = toTimestamp(birthdate);

    await setDoc(userRef, updateData, { merge: true });

    if (onSave) onSave(editedInfo);
  };

  const genderOptions = ['Man', 'Kvinna'];
  const ethnicityOptions = [
    'Latino/Sydamerikan',
    'Asiatisk',
    'Mellan Östern',
    'Europeisk',
    'Amerikan',
  ];
  const childrenOptions = [
    'Öppen för barn',
    'Vill ha barn',
    'Vill inte ha barn',
  ];
  const smokingOptions = ['Icke rökare', 'Rökare', 'Social rökare'];
  const drinkingOptions = ['Ibland', 'Social dryckare', 'Drickare'];
  const heightOptions = Array.from({ length: 71 }, (_, i) => `${140 + i} cm`);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'januari',
    'februari',
    'mars',
    'april',
    'maj',
    'juni',
    'juli',
    'augusti',
    'september',
    'oktober',
    'november',
    'december',
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const iconMapping: { [key: number]: React.ReactNode } = {
    0: <PiCakeLight />,
    1: <PiGenderMaleLight />,
    7: <PiRulerLight />,
    2: <PiBookOpenTextLight />,
    9: <PiMapPinLight />,
    3: <PiGlobeStandLight />,
    4: <PiBabyCarriageLight />,
    5: <PiCigaretteLight />,
    6: <PiWineLight />,
  };

  const renderInput = (info: UserInfoItem, index: number) => {
    const base = 'text-sm w-32 rounded-md p-1';
    const error = errors[index] ? 'border-red-500' : 'border border-gray-300';

    const renderSelect = (options: string[]) => (
      <>
        <select
          value={info.text}
          onChange={(e) => handleChange(index, e.target.value)}
          className={`${base} ${error}`}
          disabled={readOnly}
        >
          <option value=''>{info.placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors[index] && (
          <p className='text-xs text-red-600 mt-1'>{errors[index]}</p>
        )}
      </>
    );

    switch (info.id) {
      case 0: {
        const [day = '', month = '', year = ''] = info.text.split(' ');
        return (
          <div>
            <div className='flex gap-1 flex-wrap'>
              <select
                value={day}
                onChange={(e) =>
                  updateBirthday(index, e.target.value, month, year)
                }
                className={`${base} ${error}`}
                disabled={readOnly}
              >
                <option value=''>Dag</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) =>
                  updateBirthday(index, day, e.target.value, year)
                }
                className={`${base} ${error}`}
                disabled={readOnly}
              >
                <option value=''>Månad</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) =>
                  updateBirthday(index, day, month, e.target.value)
                }
                className={`${base} ${error}`}
                disabled={readOnly}
              >
                <option value=''>År</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {errors[index] && (
              <p className='text-xs text-red-600 mt-1'>{errors[index]}</p>
            )}
          </div>
        );
      }
      case 1:
        return renderSelect(genderOptions);
      case 3:
        return renderSelect(ethnicityOptions);
      case 4:
        return renderSelect(childrenOptions);
      case 5:
        return renderSelect(smokingOptions);
      case 6:
        return renderSelect(drinkingOptions);
      case 7:
        return renderSelect(heightOptions);
      default:
        return (
          <>
            <input
              type='text'
              placeholder={info.placeholder}
              value={info.text}
              onChange={(e) => handleChange(index, e.target.value)}
              className={`${base} ${error}`}
              disabled={readOnly}
            />
            {errors[index] && (
              <p className='text-xs text-red-600 mt-1'>{errors[index]}</p>
            )}
          </>
        );
    }
  };

  // Ny renderfunktion för att visa bara text i visningsläge
  const renderDisplay = (info: UserInfoItem) => {
    if (!info.text)
      return <span className='text-gray-400 italic'>Ej angivet</span>;

    if (info.id === 0) {
      // Född datum visas 
      return <span>{info.text}</span>;
    }

    return <span>{info.text}</span>;
  };

  return (
    <div className='mt-10'>
      <div className='flex flex-row gap-2 items-center'>
        <h1 className='text-xl font-semibold'>Personlig information</h1>
        {isOwnProfile && !isEditing && (
          <span
            className='text-2xl cursor-pointer hover:text-zinc-600'
            onClick={() => setIsEditing(true)}
          >
            <PiPencilSimpleLineLight />
          </span>
        )}
        {isOwnProfile && isEditing && (
          <div className='ml-auto flex gap-2'>
            <button
              className='px-4 py-1 text-sm bg-black text-white rounded-sm hover:bg-gray-700'
              onClick={handleSave}
            >
              Spara
            </button>
            <button
              className='px-4 py-1 text-sm bg-gray-300 rounded-sm hover:bg-gray-400'
              onClick={() => {
                setIsEditing(false);
                setEditedInfo(userInfo);
                setErrors({});
              }}
            >
              Avbryt
            </button>
          </div>
        )}
      </div>

      <div className='mt-5 flex flex-wrap gap-4'>
        {isEditing
          ? editedInfo.map((info, index) => (
              <div
                key={index}
                className='flex flex-wrap flex-row items-center p-4 gap-4'
              >
                <div className='text-xl'>{iconMapping[info.id]}</div>
                <div>{renderInput(info, index)}</div>
              </div>
            ))
          : userInfo.map((info, index) => (
              <div
                key={index}
                className='flex flex-row shadow-md p-4 rounded-md items-center gap-3'
              >
                <div className='text-xl'>{iconMapping[info.id]}</div>
                <div>{renderDisplay(info)}</div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default BirthdaySection;
