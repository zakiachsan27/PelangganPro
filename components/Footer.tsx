import React from 'react';
import { Users, Phone, MapPin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid md:grid-cols-3 gap-12">
          
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Users className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Pelanggan<span className="text-blue-500">Pro</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-gray-400">
              Sistem CRM terbaik untuk membantu bisnis Anda mengelola pelanggan dan meningkatkan penjualan. Mudah digunakan, harga terjangkau.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Fitur</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#services" className="hover:text-blue-400 transition-colors">Manajemen Pelanggan</a></li>
              <li><a href="#services" className="hover:text-blue-400 transition-colors">Sales Pipeline</a></li>
              <li><a href="#services" className="hover:text-blue-400 transition-colors">Lead Generation</a></li>
              <li><a href="#services" className="hover:text-blue-400 transition-colors">Analitik & Laporan</a></li>
              <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Harga</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Green Andara Residence, Cinere, Kota Depok</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="https://wa.me/6285694662592" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">+62 856-9466-2592</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:jagobikinwebsite28@gmail.com" className="hover:text-white transition-colors">jagobikinwebsite28@gmail.com</a>
              </li>
            </ul>
            <div className="mt-6">
                <a 
                  href="https://wa.me/6285694662592?text=Halo%20Admin%2C%20saya%20ingin%20tanya-tanya%20tentang%20PelangganPro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors w-full"
                >
                  Chat WhatsApp Sekarang
                </a>
            </div>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PelangganPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
