import React from 'react';
import { Users, BarChart3, Zap, Shield, MessageSquare, Target, Workflow, Bell } from 'lucide-react';
import { Feature } from '../types';

const features: Feature[] = [
  {
    title: 'Manajemen Pelanggan Terpadu',
    description: 'Kelola data pelanggan lengkap dalam satu sistem. Riwayat interaksi, catatan penting, dan informasi kontak tersimpan rapi.',
    icon: Users,
  },
  {
    title: 'Sales Pipeline Otomatis',
    description: 'Visualisasikan funel penjualan Anda. Tracking progress deals dari awal hingga closing dengan dashboard yang intuitif.',
    icon: Target,
  },
  {
    title: 'Lead Generation',
    description: 'Tangkap leads dari berbagai渠道 (WhatsApp, Website, Form). Otomatisasi penugasan ke tim sales.',
    icon: Zap,
  },
  {
    title: 'Analitik & Laporan',
    description: 'Laporan real-time tentang performa tim sales, conversion rate, dan revenue. Ambil keputusan berbasis data.',
    icon: BarChart3,
  },
  {
    title: 'Otomatisasi Workflow',
    description: 'Buat workflow otomatis untuk tugas berulang: follow-up reminder, notifikasi, update status deals, dan lainnya.',
    icon: Workflow,
  },
  {
    title: 'Integrasi WhatsApp',
    description: 'Kirim broadcast,auto-reply, dan terlacak semua chat WhatsApp pelanggan langsung dari CRM.',
    icon: MessageSquare,
  },
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Fitur Unggulan</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Semua yang Anda Butuhkan untuk Menaikkan Penjualan</h3>
          <p className="text-gray-600 text-lg">
            PelangganPro hadir dengan fitur lengkap untuk membantu bisnis Anda mengelola hubungan pelanggan dan meningkatkan revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
