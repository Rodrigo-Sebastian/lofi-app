'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

import { PiEyeLight, PiEyeClosedLight, PiArrowCircleLeftLight } from 'react-icons/pi';
import { FcGoogle } from 'react-icons/fc';
import { FaSquareXTwitter, FaSquareFacebook } from 'react-icons/fa6';

import Logo from '../../public/images/lofi-main-logo.png';

interface FormData {
  email: string;
  password: string;
  login: string;
}

interface Errors {
  email?: string;
  password?: string;
  login?: string;
}

const Page: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    login: '',
  });

  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      router.push(`/User/${user.uid}`);
    } catch (err: any) {
      console.error(err.code);
      let loginError = 'Något gick fel, försök igen';

      switch (err.code) {
        case 'auth/user-not-found':
          loginError = 'Användaren finns inte';
          break;
        case 'auth/wrong-password':
          loginError = 'Fel lösenord';
          break;
      }

      setErrors({ login: loginError });
    }
  };

  const getInputStyle = (field: keyof FormData) => {
    if (errors[field]) return 'border-red-400';
    if (formData[field] !== '' && !errors[field]) return 'border-green-400';
    return 'border-gray-300';
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div>
      {/* Top Image section */}
      <div
        className='w-full h-[500px] bg-cover bg-center'
        style={{ backgroundImage: `url('/images/dating-3.jpg')` }}
      >
        <Link
          href='/'
          className='group flex flex-row items-center gap-2 p-8 translate-all ease-in-out duration-300 hover:text-black'
        >
          <span>
            <PiArrowCircleLeftLight className='text-2xl lg:text-6xl text-white translate-all ease-in-out duration-300 group-hover:text-black' />
          </span>
          <h1 className='text-sm lg:text-3xl text-white translate-all ease-in-out duration-300 group-hover:text-black'>
            Gå tillbaka till huvusidan.
          </h1>
        </Link>
      </div>
      {/* Form section */}
      <div className='bg-stone-400 flex flex-col justify-center items-center gap-8'>
        <div className='flex flex-row items-center gap-2'>
          <h1 className='relative top-7 lg:text-4xl'>Välkomen till</h1>
          <Image src={Logo} alt='logo' width={150} />
        </div>
        <div className='lg:px-8 pb-10 lg:w-[550px]'>
          <form className='border rounded-2xl flex flex-col gap-6 p-5 lg:p-10 shadow-2xl' onSubmit={handleSubmit}>
            {/* Top Form section */}
            <h1 className='text-center text-2xl italic'>Logga in för att hitta din match!</h1>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Email:</h2>
                <input
                  className={`border outline-none rounded-md p-2 bg-gray-200 ${getInputStyle('email')}`}
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <h2 className='text-gray-600'>Lösenord:</h2>
                <div className='flex flex-row gap-2 items-center'>
                  <input
                    className={`borde outline-none rounded-md p-2 bg-gray-200 w-full ${getInputStyle('password')}`}
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
                {errors.password && <p className='text-xs font-bold text-black'>{errors.password}</p>}
              </div>
              {/* Felmeddelande om inloggning misslyckas */}
              {errors.login && <p className='text-xs text-red-900'>{errors.login}</p>}

              <h1 className='text-center text-gray-600 mt-8'>Eller logga in med: </h1>
              <div className='flex flex-row justify-center items-center gap-2 my-4'>
                <span className='block w-full bg-white h-[0.5px]'></span>
                <Link href='/' className=''>
                  <span className='text-4xl'>
                    <FcGoogle />
                  </span>
                </Link>
                <Link href='/'>
                  <span className='text-4xl text-blue-500'>
                    <FaSquareFacebook />
                  </span>
                </Link>
                <Link href='/'>
                  <span className='text-4xl'>
                    <FaSquareXTwitter />
                  </span>
                </Link>
                <span className='block w-full bg-white h-[0.5px]'></span>
              </div>
            </div>
            {/* Bottom Form section */}
            <button
              type='submit'
              className='bg-black text-white p-4 rounded-md text-center transition-all ease-in-out duration-300 hover:bg-stone-500'
            >
              Logga in
            </button>
            <Link href='Register' className='italic font-light hover:text-stone-500 text-white text-sm text-end'>
              Skappa ett konto!
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
