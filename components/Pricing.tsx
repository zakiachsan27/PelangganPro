import React from 'react';
import { Check, Info, Zap } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Harga Terjangkau</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Pilih Paket yang Paling Sesuai</h3>
          <p className="text-gray-600 text-lg">
            Two options: langganan bulanan atau sekali bayar. Tanpa biaya tersembunyi, termasuk setup dan training gratis.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Monthly Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-all">
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Paket Bulanan</h4>
                  <p className="text-gray-500 text-sm mt-1">Langganan per bulan</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Popular</span>
              </div>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">Rp 200rb</span>
                <span className="text-gray-500 ml-2">/bulan</span>
              </div>

              <p className="text-gray-600 mb-6 text-sm">
                Cocok untuk bisnis yang ingin fleksibilitas. Bayar per bulan, bisa berhenti kapan saja.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  'Manajemen Pelanggan Unlimited',
                  'Sales Pipeline Otomatis',
                  'Lead Generation & Tracking',
                  'Analitik & Laporan',
                  'Integrasi WhatsApp',
                  'Otomatisasi Workflow',
                  'Support Prioritas',
                  'Gratis Update Fitur'
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="https://wa.me/6285694662592?text=Halo%20Admin%2C%20saya%20ingin%20langganan%20PelangganPro%20bulanan"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-6 text-center rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
              >
                Pilih Paket Bulanan
              </a>
            </div>
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Info size={14} /> Bisa berhenti kapan saja, data tetap aman
              </p>
            </div>
          </div>

          {/* One-time Payment Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-600 relative">
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                <Zap size={12} /> BEST VALUE
              </span>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900">Paket Sekali Bayar</h4>
                <p className="text-gray-500 text-sm mt-1">One-time payment</p>
              </div>

              <div className="mb-8">
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-extrabold text-blue-600">Rp 7jt</span>
                    <span className="text-gray-500 ml-2">sekali</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Miliki sistem sendiri dengan satu kali pembayaran. Lebih hemat dalam jangka panjang.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start bg-blue-50 p-3 rounded-lg -mx-2 border border-blue-100">
                      <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-800 text-sm font-semibold">Hemat Rp 2.4jt/th (vs langganan)</span>
                    </li>
                    {[
                      'Semua Fitur Paket Bulanan',
                      'Data Tersimpan Permanen',
                      'Custom Domain (opsional)',
                      'Backup Manual',
                      'Prioritas Tinggi',
                      'Gratis Konsultasi Bisnis bulanan'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start px-1">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
               </div>

              <a 
                href="https://wa.me/6285694662592?text=Halo%20Admin%2C%20saya%20ingin%20beli%20PelangganPro%20sekali%20bayar"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-6 text-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Beli Sekali Bayar
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
