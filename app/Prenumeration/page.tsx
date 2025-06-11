import React from 'react';
import Nav from '../components/Header/Nav';

interface PrenumerationItem {
  id: number;
  text: string;
  description: string;
  alternatives: string[];
  pris: string;
}

const Page: React.FC = () => {
  const prenumeration: PrenumerationItem[] = [
    {
      id: 0,
      text: 'Premiun',
      description: 'För dig som vill få ut av det bästa från Lofi.',
      alternatives: [
        'Oändliga Swipes',
        'Exklusiv tillgång till nya användare',
        'Offline lyssning',
        'Se vilka som gillar dig',
      ],
      pris: '300 kr i månad',
    },
    {
      id: 1,
      text: 'Guld',
      description: 'För dig som använder Lofi dagligen.',
      alternatives: [
        'Oändliga Swipes',
        'Exklusiv tillgång till nya användare',
        'Se vilka som gillar dig',
      ],
      pris: '250 kr i månad',
    },
    {
      id: 2,
      text: 'Silver',
      description: 'För dig som vill enbart dejta',
      alternatives: ['Oändliga Swipes', 'Exklusiv tillgång till nya användare'],
      pris: '200 kr i månad',
    },
  ];

  return (
    <div>
      <div
        className=' h-[90vh] bg-cover bg-center flex flex-col'
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('/images/prenumeration-bg.jpg')",
        }}
      >
        <Nav />
        <div className='flex flex-col gap-4 justify-center items-center mt-48'>
          <h1 className=' font-bold text-2xl lg:text-6xl'>Få mer av Din Prenumeration |</h1>
          <span className='text-white font-semibold text-center text-6xl lg:text-7xl'>
            Din Älskade väntar!
          </span>
        </div>
      </div>
      <div className='my-40 flex flex-col gap-20'>
        <h1 className='text-4xl font-semibold text-center p-4'>Välj din Prenumaration</h1>
        <div className='flex flex-col lg:flex-row gap-8 justify-center items-center p-4'>
          {prenumeration.map((item) => (
            <div
              key={item.id}
              className={`border rounded-2xl p-8 flex flex-col justify-between gap-2 text-white w-full lg:w-[550px] lg:h-[400px] md:w-[550px] ${
                item.text === 'Premiun'
                  ? 'bg-black'
                  : item.text === 'Guld'
                  ? 'bg-stone-500'
                  : 'bg-zinc-500'
              }`}
            >
              <h1 className='font-bold text-2xl'>{item.text}</h1>
              <p className='text-xl'>{item.description}</p>
              <ul className='flex flex-col gap-2'>
                {item.alternatives.map((alt, altIndex) => (
                  <li key={altIndex} className='text-xl italic font-thin'>
                    {alt}
                  </li>
                ))}
              </ul>
              <h1>{item.pris}</h1>
              <button className='p-4 mt-4 rounded-md w-full bg-neutral-800 animation-all ease-in-out duration-300 hover:bg-neutral-600'>
                Köp Prenumeration
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
