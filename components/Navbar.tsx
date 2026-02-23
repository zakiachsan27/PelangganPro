import React, { useState, useEffect } from 'react';
import { Menu, X, Users } from 'lucide-react';
import { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'Fitur', href: '#services' },
  { label: 'Harga', href: '#pricing' },
  { label: 'Kontak', href: '#contact' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <a href="#" className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Users className="text-white h-6 w-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              Pelanggan<span className="text-blue-600">Pro</span>
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium hover:text-blue-500 transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-200'}`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://wa.me/6285694662592?text=Halo%20Admin%2C%20saya%20ingin%20demo%20PelangganPro"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Request Demo
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${scrolled ? 'text-gray-900' : 'text-white bg-black/20'}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl py-4 flex flex-col items-center space-y-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-800 font-medium py-2 px-4 w-full text-center hover:bg-gray-50"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://wa.me/6285694662592?text=Halo%20Admin%2C%20saya%20ingin%20demo%20PelangganPro"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold w-11/12 text-center"
          >
            Request Demo
          </a>
        </div>
      )}
    </nav>
  );
};
