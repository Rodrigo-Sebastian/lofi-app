import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InfoImg from '../../public/images/dating-1.jpg';
import Nav from '../components/Header/Nav';
import HeroCarousel from '../components/HeroCarousel';
import { PiSealCheckFill } from "react-icons/pi";

const page: React.FC = () => {
  return (
    <div className='bg-stone-300'>
        {/* Header-component */}
        <div className='relative z-10 '>
            <Nav />
        </div>
        <section className='mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row justify-between gap-4 items-center'>
            <div className=' lg:w-[550px] flex flex-col gap-4'>
                <h1 className='text-2xl w-[300px] lg:w-[550px] lg:text-6xl font-semibold'>
                Ditt livs kärlek kan vara ifrån ett swipe!
                </h1>
                <p className='text-sm lg:text-md font-semibold text-gray-500'>
                Lofi är byggd för singlar med hög ambition på att ta nästa steget i
                dejtning livet!
                <br />
                Vi hjälper dig att hitta din livs kärlek genom att matcha dig med
                personer som delar samma intressen som dig.
                <br />
                </p>
                <ul className='flex flex-col gap-4'>
                    <li className='text-sm lg:text-xl font-semibold flex flex-row items-center gap-4'>Kostnat fritt. <PiSealCheckFill className='text-sky-800' /></li>
                    <li className='text-sm lg:text-xl font-semibold flex flex-row items-center gap-4'>Träffa singlar nära dig. <PiSealCheckFill className='text-sky-800' /></li>
                    <li className='text-sm lg:text-xl font-semibold flex flex-row items-center gap-4'>Hitta ambitösa singlar. <PiSealCheckFill className='text-sky-800' /></li>
                    <li className='text-sm lg:text-xl font-semibold flex flex-row items-center gap-4'>Avsluta din Prenumeration när som helst. <PiSealCheckFill className='text-sky-800' /></li>
                </ul>
                <Link
                href='/Register'
                className='bg-black w-fit px-8 py-3 rounded-lg mt-4 transition-all ease-in-out duration-300 hover:bg-stone-500'
                >
                <h1 className='text-white'>Registrera dig</h1>
                </Link>
            </div>
            <div className='flex-2 w-full flex justify-end lg:w-fit'>
                <Image
                src={InfoImg}
                alt='info-img'
                width={400}
                height={500}
                className='rounded-lg'
                />
            </div>
        </section>
        <section className='mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-2'>
            <h1 className='text-4xl lg:text-6xl font-semibold mb-4'>Det är enkelt att använda!</h1>
            <p className='text-sm lg:text-lg lg:max-w-[800px] font-semibold text-gray-500 mb-4'>Lofi är en enkelt app som erbjuder många förmåner, Lofi är en plats där du kan träffa nya människor 
                på ett tryggt, smidigt och roligt sätt! Det är helt gratis att registrera dig, och du kommer sanbbt igång med att bläddra bland
                spännande profiler när dig!
            </p>
            <h1 className='text-xl font-semibold mb-4'>Så funkar det:</h1>
            <ul className='flex flex-col gap-4 mb-4'>
                <li className='text-sm bg-neutral-500 text-white w-fit py-4 px-6 rounded-md'>Gilla någon du är intresserad av</li>
                <li className='text-sm bg-neutral-400 text-white w-fit py-4 px-6 rounded-md'>Får du en like tillbaka? Då har ni en match!</li>
                <li className='text-sm bg-neutral-700 text-white w-fit py-4 px-6 rounded-md'>Börja chatta direkt och lär känna varandra i din egen takt</li>
            </ul>
            <p className='text-sm lg:text-lg lg:max-w-[800px] font-semibold text-gray-500'>Vill du ha lite extra funktioner? Då kan du prenumerera när du vill och lika enkelt avsluta prenumerationen när det passar dig.
                Enkelhet, frihet och äkta möten det är vad vi står för. Prova själv och se vem du matchar med idag!
            </p>
        </section>
        <HeroCarousel />
    </div>
  );
};

export default page;
