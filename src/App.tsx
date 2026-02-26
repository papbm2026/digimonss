import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// --- PERBAIKAN IMPORT KOMPONEN ---
// Karena file berada di folder 'src/pages/', tambahkan './pages/' di jalurnya
import PublicKeluhan from './pages/PublicKeluhan';
import Dashboard from './pages/Dashboard';
import CleaningChecklist from './pages/CleaningChecklist';
import ComplaintsAdmin from './pages/ComplaintsAdmin';
import Login from './pages/Login';

// Sidebar dan Header biasanya berada langsung di folder 'src/'
// Jika ternyata ada di folder lain, sesuaikan jalurnya juga
import Sidebar from './Sidebar';
import Header from './Header';

// IMPORT TYPES
import { User, Keluhan, CleaningLog, MaintenanceLog, SecurityLog } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pa_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [keluhans, setKeluhans] = useState<Keluhan[]>([]);
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  const [secLogs] = useState<SecurityLog[]>([]); 

  useEffect(() => {
    if (!db) return;

    // Real-time listener untuk Keluhan
    const qKeluhan = query(collection(db, "pa_keluhans"), orderBy("createdAt", "desc"));
    const unsubKeluhan = onSnapshot(qKeluhan, (snapshot) => {
      setKeluhans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Keluhan)));
    }, (err) => console.error("Firestore Error:", err));

    // Real-time listener untuk Cleaning
    const unsubCleaning = onSnapshot(collection(db, "pa_cleaning"), (snapshot) => {
      setCleaningLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CleaningLog)));
    });

    // Real-time listener untuk Maintenance
    const unsubMaint = onSnapshot(collection(db, "pa_maint"), (snapshot) => {
      setMaintLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceLog)));
    });

    return () => { 
      unsubKeluhan(); 
      unsubCleaning(); 
      unsubMaint(); 
    };
  }, []);

  const handleAddKeluhan = async (data: any) => {
    try {
      await addDoc(collection(db, "pa_keluhans"), {
        ...data,
        status: 'Menunggu',
        isValidated: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Gagal simpan keluhan:", err);
    }
  };

  const handleAddCleaning = async (data: any) => {
    try {
      await addDoc(collection(db, "pa_cleaning"), { ...data, createdAt: serverTimestamp() });
    } catch (err) {
      console.error("Gagal simpan cleaning:", err);
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
        {/* Navigasi Sidebar hanya muncul jika user login */}
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header hanya muncul jika user login */}
          {user && <Header user={user} pendingComplaints={pendingComplaints} />}
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              {/* Route Utama: Dashboard jika login, Public Form jika tidak */}
              <Route path="/" element={
                user ? <Dashboard keluhans={keluhans} cleaning={cleaningLogs} maintenance={maintLogs} security={secLogs} /> 
                     : <PublicKeluhan existingKeluhans={keluhans} onAdd={handleAddKeluhan} />
              } />

              <Route path="/public" element={<PublicKeluhan existingKeluhans={keluhans} onAdd={handleAddKeluhan} />} />
              
              <Route path="/cleaning" element={
                user ? <CleaningChecklist user={user} logs={cleaningLogs} onAdd={handleAddCleaning} onDelete={(id) => deleteDoc(doc(db, "pa_cleaning", id))} /> 
                     : <Navigate to="/login" />
              } />
              
              <Route path="/complaints" element={
                user?.role === 'Admin' ? <ComplaintsAdmin keluhans={keluhans} onDelete={(id) => deleteDoc(doc(db, "pa_keluhans", id))} onUpdate={(k) => updateDoc(doc(db, "pa_keluhans", k.id), k)} /> 
                                       : <Navigate to="/" />
              } />
              
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
