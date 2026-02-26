import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brush, Wrench, Send, ArrowRight, MonitorDot, CheckCircle2, MessageCircle, UserCog, User, Briefcase, AlertTriangle, Info, Building2, Sofa, Monitor } from 'lucide-react';

// Pastikan tipe data sesuai dengan yang ada di file types.ts kamu
import { Keluhan, KategoriPelapor } from './types'; 

interface PublicKeluhanProps {
  onAdd: (k: any) => Promise<void>;
  existingKeluhans: Keluhan[];
}

const PublicKeluhan: React.FC<PublicKeluhanProps> = ({ onAdd, existingKeluhans }) => {
  const [step, setStep] = useState<'selection' | 'form' | 'success'>('selection');
  const [category, setCategory] = useState<'Kebersihan' | 'Perbaikan' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    pelapor: '',
    kategoriPelapor: 'Pihak' as KategoriPelapor,
    lokasi: '',
    deskripsi: '',
    subKategori: ''
  });
  const [waLink, setWaLink] = useState('');

  const isDuplicate = () => {
    const today = new Date().toISOString().split('T')[0];
    return existingKeluhans.some(k => 
      k.kategori === category &&
      k.lokasi.toLowerCase().trim() === formData.lokasi.toLowerCase().trim() &&
      k.deskripsi.toLowerCase().trim() === formData.deskripsi.toLowerCase().trim() &&
      k.tanggal?.split('T')[0] === today
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!category) return;

    if (category === 'Perbaikan' && !formData.subKategori) {
      setError("Silakan pilih kriteria perbaikan terlebih dahulu.");
      return;
    }

    if (isDuplicate()) {
      setError("Laporan yang sama sudah dikirimkan hari ini. Mohon tunggu tindak lanjut petugas.");
      return;
    }

    const newComplaint = {
      tanggal: new Date().toISOString(),
      kategori: category,
      subKategori: formData.subKategori,
      kategoriPelapor: formData.kategoriPelapor,
      pelapor: formData.pelapor,
      lokasi: formData.lokasi,
      deskripsi: formData.deskripsi,
    };

    try {
      await onAdd(newComplaint);
      
      // WhatsApp Logic
      let waNumber = '';
      let picName = '';

      if (category === 'Kebersihan') {
        waNumber = '6282186726057';
        picName = 'Bpk. Malik';
      } else if (category === 'Perbaikan') {
        if (formData.subKategori === 'Gedung') {
          waNumber = '6288286733662';
          picName = 'Bpk. Aprianson';
        } else {
          waNumber = '6285367086256';
          picName = 'Bpk. Oktario';
        }
      }
      
      const message = `*DIGIMONS - LAPORAN BARU*\n\n` +
        `Halo ${picName},\n` +
        `Ada laporan masuk melalui sistem DIGIMONS:\n\n` +
        `*Kategori:* ${category}${formData.subKategori ? ` (${formData.subKategori})` : ''}\n` +
        `*Jenis Pelapor:* ${formData.kategoriPelapor}\n` +
        `*Nama Pelapor:* ${formData.pelapor}\n` +
        `*Lokasi:* ${formData.lokasi}\n` +
        `*Keterangan:* ${formData.deskripsi}\n\n` +
        `_Mohon segera dilakukan pengecekan._`;
        
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      setWaLink(waUrl);
      setStep('success');
    } catch (err) {
      setError("Gagal mengirim laporan. Cek koneksi internet Anda.");
    }
  };

  const resetForm = () => {
    setStep('selection');
    setFormData({ pelapor: '', kategoriPelapor: 'Pihak', lokasi: '', deskripsi: '', subKategori: '' });
    setCategory(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[80vh] flex flex-col justify-center">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-3xl mb-6 shadow-sm">
          <MonitorDot className="w-12 h-12 text-emerald-800" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">DIGIMONS</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Digital Monitoring Sarana & Prasarana</p>
        <p className="text-slate-400 text-sm italic">Pengadilan Agama Prabumulih</p>
      </div>

      {step === 'selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button onClick={() => { setCategory('Kebersihan'); setStep('form'); }} className="group p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:border-emerald-500 transition-all text-left">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Brush size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Keluhan Kebersihan</h3>
            <p className="text-slate-500 mt-2">Laporkan ruangan kotor atau toilet bermasalah.</p>
            <div className="mt-8 flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform">
              Kirim Laporan <ArrowRight size={20} className="ml-2" />
            </div>
          </button>

          <button onClick={() => { setCategory('Perbaikan'); setStep('form'); }} className="group p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:border-amber-500 transition-all text-left">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-800 group-hover:text-white transition-all">
              <Wrench size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Mohon Perbaikan</h3>
            <p className="text-slate-500 mt-2">Perbaikan AC, Laptop, Meja, Kursi, dsb.</p>
            <div className="mt-8 flex items-center text-amber-600 font-bold group-hover:translate-x-2 transition-transform">
              Ajukan Perbaikan <ArrowRight size={20} className="ml-2" />
            </div>
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto w-full">
          <button onClick={() => { setStep('selection'); setError(null); }} className="text-sm font-semibold text-slate-400 hover:text-emerald-700 mb-8 flex items-center">
            <ArrowRight size={16} className="rotate-180 mr-2" /> Kembali
          </button>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className={`p-4 rounded-2xl ${category === 'Kebersihan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {category === 'Kebersihan' ? <Brush size={28} /> : <Wrench size={28} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Laporan {category}</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center space-x-2">
              <AlertTriangle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {category === 'Perbaikan' && (
              <div className="grid grid-cols-1 gap-3">
                <button type="button" onClick={() => setFormData({...formData, subKategori: 'Gedung'})} className={`p-4 rounded-xl border-2 flex items-center space-x-3 ${formData.subKategori === 'Gedung' ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}>
                  <Building2 size={20} /> <span>Gedung (AC, Lampu, Air)</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, subKategori: 'Peralatan Non TIK'})} className={`p-4 rounded-xl border-2 flex items-center space-x-3 ${formData.subKategori === 'Peralatan Non TIK' ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}>
                  <Sofa size={20} /> <span>Mebel (Meja, Kursi)</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, subKategori: 'Peralatan TIK'})} className={`p-4 rounded-xl border-2 flex items-center space-x-3 ${formData.subKategori === 'Peralatan TIK' ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}>
                  <Monitor size={20} /> <span>TIK (PC, Laptop, Printer)</span>
                </button>
              </div>
            )}

            <input required className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-500" placeholder="Nama Anda" value={formData.pelapor} onChange={e => setFormData({...formData, pelapor: e.target.value})} />
            <input required className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-500" placeholder="Lokasi (Contoh: Ruang PTSP)" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} />
            <textarea required rows={4} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-500" placeholder="Detail Masalah..." value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />

            <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${category === 'Kebersihan' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
              Kirim Laporan
            </button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center max-w-xl mx-auto w-full">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Berhasil!</h2>
          <p className="text-slate-500 mb-8">Laporan Anda telah tercatat di sistem monitoring.</p>
          <div className="space-y-4">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2">
              <MessageCircle size={20} /> <span>Kirim WA ke Petugas</span>
            </a>
            <button onClick={resetForm} className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold">Kembali</button>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link to="/login" className="text-slate-400 hover:text-emerald-800 text-sm font-bold flex items-center justify-center space-x-2">
          <UserCog size={18} /> <span>Login Pegawai</span>
        </Link>
      </div>
    </div>
  );
};

export default PublicKeluhan;
