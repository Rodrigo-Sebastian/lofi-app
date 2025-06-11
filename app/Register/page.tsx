'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

import { PiEyeLight, PiEyeClosedLight, PiArrowCircleLeftLight } from 'react-icons/pi';

import RegisterImg from '../../public/images/dating-4.jpg';
import Logo from '../../public/images/lofi-main-logo.png';
import { doc, setDoc } from 'firebase/firestore';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Page: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);

  const validateForm = () => {
    let newErrors: Errors = {};
    if (!formData.firstName) newErrors.firstName = 'Förnamn krävs';
    if (!formData.lastName) newErrors.lastName = 'Efternamn krävs';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ogiltig e-postadress';
    if (formData.password.length < 6) newErrors.password = 'Lösenordet måste vara minst 6 tecken';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Lösenorden matchar inte';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!validateForm()) return;

    try {
      // Skapa konto i Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Lägg till namn i användarprofilen
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Spara användardata i Firestore
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        {
          displayName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          createdAt: new Date(),
        },
        { merge: true }
      );

      // Navigera till dashboard
      router.push('/Login');
    } catch (err: any) {
      console.error(err.message);
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ ...errors, email: 'E-postadressen används redan' });
      } else {
        setErrors({ ...errors, email: 'Något gick fel, försök igen.' });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <div className='lg:h-screen flex flex-col lg:flex-row justify-evenly items-center bg-black'>
      {/* Flex right section Img */}
      <div className='group flex-1 flex flex-col gap-8'>
        <Link
          href='/'
          className='p-2 ml-10 flex flex-row items-center gap-2 transition-all ease-in-out duration-300 hover:text-stone-500'
        >
          <PiArrowCircleLeftLight className='text-white text-4xl transition-all ease-in-out duration-300 group-hover:text-stone-500' />
          <h1 className='text-white font-light text-sm transition-all ease-in-out duration-300 group-hover:text-stone-500'>
            Gå till huvudsidan.
          </h1>
        </Link>
        <Image src={RegisterImg} alt='Register img' />
      </div>
      {/* Flex left section Form */}
      <div className='w-full lg:flex flex-1 flex-col lg:justify-center gap-8 items-center lg:h-full bg-stone-400'>
        <div className='flex flex-col items-center lg:py-2 py-10'>
          <div className='flex flex-row items-center'>
            <h1 className='relative top-7 pr-2 text-2xl font-light italic'>Välkomen till</h1>
            <Image src={Logo} alt='Logo' width={150} />
          </div>
          <div>
            <h3 className='text-white font-semibold text-sm lg:text-xl p-4'>
              Din match är bara en klick ifrån dig! registrera dig nedan!
            </h3>
          </div>
        </div>
        <div className='px-8 pb-10'>
          <form className='border rounded-2xl flex flex-col gap-6 p-8 shadow-2xl' onSubmit={handleSubmit}>
            {/* Top Form section */}
            <div className='flex flex-col lg:flex-row lg:items-center gap-6'>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Namn:</h2>
                <input
                  className='border outline-none rounded-md p-2 bg-gray-200'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className='text-xs text-red-900'>{errors.firstName}</p>}
              </div>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Efternamn:</h2>
                <input
                  className='border outline-none rounded-md p-2 bg-gray-200'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className='text-xs text-red-900'>{errors.lastName}</p>}
              </div>
            </div>
            {/* Middle Form section */}
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Email:</h2>
                <input
                  className='border outline-none rounded-md p-2 bg-gray-200'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className='text-xs text-red-900'>{errors.email}</p>}
              </div>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Lösenord:</h2>
                <div className='flex flex-row gap-2 items-center'>
                  <input
                    className='borde outline-none rounded-md p-2 bg-gray-200 w-full'
                    name='password'
                    type={passwordVisible ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className='cursor-pointer bg-gray-500 p-2 rounded-md text-white'
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? <PiEyeClosedLight /> : <PiEyeLight />}
                  </span>
                </div>
                {errors.password && <p className='text-xs text-red-900'>{errors.password}</p>}
              </div>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Återuppreppa Lösenord:</h2>
                <div className='flex flex-row gap-2 items-center '>
                  <input
                    className='border outline-none rounded-md p-2 bg-gray-200 w-full'
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <span
                    className='cursor-pointer bg-gray-500 p-2 rounded-md text-white'
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {confirmPasswordVisible ? <PiEyeClosedLight /> : <PiEyeLight />}
                  </span>
                </div>
                {errors.confirmPassword && (
                  <p className='text-xs text-red-900'>{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            {/* Bottom Form section */}
            <button className='bg-black text-white p-4 rounded-md transition-all ease-in-out duration-300 hover:bg-stone-500'>
              Registrera mig
            </button>
            {successMessage && <p className='text-xs text-green-500'>{successMessage}</p>}
            <Link href='Login' className='italic font-light hover:text-stone-500 text-white text-sm text-end'>
              Jag har redan ett konto
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
