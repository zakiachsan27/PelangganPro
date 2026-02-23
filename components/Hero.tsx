import React from 'react';
import { ArrowRight, CheckCircle2, Users, BarChart3, Zap, Shield } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900" />
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[80px]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem CRM Terlengkap
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pelanggan & Penjualan</span> Lebih Mudah.
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              PelangganPro membantu bisnis Anda mengelola pelanggan, otomatisasi penjualan, dan meningkatkan revenue dengan sistem CRM yang mudah digunakan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2">
                Lihat Harga
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="https://wa.me/6285694662592?text=Halo%20Admin%2C%20saya%20ingin%20demo%20PelangganPro" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all flex items-center justify-center">
                Request Demo
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Gratis Setup & Training</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Data Aman & Terenkripsi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Support Prioritas</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60" 
                alt="CRM Dashboard" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
