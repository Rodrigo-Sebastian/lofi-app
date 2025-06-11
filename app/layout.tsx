import { UserProvider } from './context/UserContext';
import { UserDataProvider } from './context/UserDataContext';

import Footer from './components/Footer/Footer';
import './globals.css';
import { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'LoFi | Your Love Finder app',
  description: 'LoFi - your Love Finder app',
  icons:{
    icon: '/images/lofi-main-logo.png',
  }
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en'>
      <body>
        <UserProvider>
          <UserDataProvider>{children}</UserDataProvider>
        </UserProvider>
        <Footer />
      </body>
    </html>
  );
}
