import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// --- KOMPONEN PAGES ---
import PublicKeluhan from './pages/PublicKeluhan';
import Dashboard from './pages/Dashboard';
import CleaningChecklist from './pages/CleaningChecklist';
import ComplaintsAdmin from './pages/ComplaintsAdmin';
import Login from './pages/Login';

// --- KOMPONEN UI ---
import Sidebar from './Sidebar';
import Header from './Header';

// --- TYPES ---
import { User, Keluhan, CleaningLog, MaintenanceLog, SecurityLog } from './types';

const App: React.FC = () => {
  // 1. State User dengan Error Handling untuk LocalStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pa_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Gagal memuat session user:", e);
      return null;
    }
  });

  // 2. State Data
  const [keluhans, setKeluhans] = useState<Keluhan[]>([]);
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  const [secLogs] = useState<SecurityLog[]>([]); 

  // 3. Effect Real-time Firestore
  useEffect(() => {
    if (!db) {
      console.error("Firebase DB tidak terdeteksi!");
      return;
    }

    // Listener Keluhan
    const qKeluhan = query(collection(db, "pa_keluhans"), orderBy("createdAt", "desc"));
    const unsubKeluhan = onSnapshot(qKeluhan, (snapshot) => {
      setKeluhans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Keluhan)));
    }, (err) => console.error("Error Keluhan:", err));

    // Listener Cleaning
    const unsubCleaning = onSnapshot(collection(db, "pa_cleaning"), (snapshot) => {
      setCleaningLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CleaningLog)));
    }, (err) => console.error("Error Cleaning:", err));

    // Listener Maintenance
    const unsubMaint = onSnapshot(collection(db, "pa_maint"), (snapshot) => {
      setMaintLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceLog)));
    }, (err) => console.error("Error Maint:", err));

    return () => { 
      unsubKeluhan(); 
      unsubCleaning(); 
      unsubMaint(); 
    };
  }, []);

  // 4. Handlers
  const handleAddKeluhan = async (data: any) => {
    try {
      await addDoc(collection(db, "pa_keluhans"), {
        ...data,
        status: 'Menunggu',
        isValidated: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      alert("Gagal mengirim keluhan. Coba lagi.");
    }
  };

  const handleAddCleaning = async (data: any) => {
    try {
      await addDoc(collection(db, "pa_cleaning"), { ...data, createdAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('pa_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pa_user');
  };

  const pendingComplaints = useMemo(() => {
    return keluhans.filter(k => k.status === 'Menunggu' && !k.isValidated);
  }, [keluhans]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Sidebar muncul jika login */}
        {user && <Sidebar user={user} onLogout={
