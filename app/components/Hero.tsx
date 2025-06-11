import React from 'react';
import Nav from './Header/Nav';

const Hero: React.FC = () => {
  return (
    <div
      className='relative h-[90vh] bg-cover bg-center flex flex-col justify-between'
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('/images/dating-5.jpg')",
      }}
    >
      {/* Header-component */}
      <div className='relative z-10 '>
        <Nav />
      </div>
      {/* Hero-content */}
      <div className='flex lg:justify-end items-end w-full px-2 mb-64 mx-auto max-w-7xl'>
        <h1 className='text-2xl lg:text-4xl text-white font-semibold w-[600px]'>
          Dating-appen som för dig närmare
          <br />
          din framtida
          <span className='text-black text-4xl lg:text-6xl'> Själfrände</span>
          .
        </h1>
      </div>
    </div>
  );
};

export default Hero;
