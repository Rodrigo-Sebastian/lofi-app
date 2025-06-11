import Hero from './components/Hero';
import HeroCarousel from './components/HeroCarousel';
import InfoSection from './components/InfoSection';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <InfoSection />
      <HeroCarousel />
    </>
  );
};

export default Home;
