import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';

function App() {
  React.useEffect(() => {
    document.title = 'PelangganPro - Sistem CRM Terbaik untuk Bisnis Anda';
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow">
        <Hero />
        <Services />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

export default App;
