import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Keluhan, KategoriPelapor } from '../types';
import { Brush, Wrench, Send, ArrowRight, MonitorDot, CheckCircle2, MessageCircle, UserCog, User, Briefcase, AlertTriangle, Info, Building2, Sofa, Monitor } from 'lucide-react';

interface PublicKeluhanProps {
  onAdd: (k: Keluhan) => void;
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
      k.tanggal.split('T')[0] === today
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

    // Data yang akan dikirim ke Firebase melalui onAdd di App.tsx
    const newComplaint = {
      tanggal: new Date().toISOString(),
      kategori: category,
      subKategori: formData.subKategori,
      kategoriPelapor: formData.kategoriPelapor,
      pelapor: formData.pelapor,
      lokasi: formData.lokasi,
      deskripsi: formData.deskripsi,
      status: 'Menunggu',
      isValidated: false // Penting: agar terdeteksi sebagai laporan baru di Dashboard
    };

    try {
      // Menjalankan fungsi addDoc di App.tsx
      await onAdd(newComplaint as Keluhan);
      
      // PIC WhatsApp Logic
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
        `*Lokasi
