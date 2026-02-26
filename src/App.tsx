import React, { useState, useEffect, useMemo } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './firebase'; // Pastikan file firebase.ts Anda sudah benar
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// ... import komponen lainnya tetap sama ...

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pa_user');
    return saved ? JSON.parse(saved) : null;
  });

  // State untuk data dari Firebase
  const [keluhans, setKeluhans] = useState<Keluhan[]>([]);
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  const [secLogs, setSecLogs] = useState<SecurityLog[]>([]);

  // --- MENGAMBIL DATA (REALTIME) ---
  useEffect(() => {
    // Ambil Keluhan
    const qKeluhan = query(collection(db, "pa_keluhans"), orderBy("createdAt", "desc"));
    const unsubKeluhan = onSnapshot(qKeluhan, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Keluhan));
      setKeluhans(data);
    });

    // Ambil Cleaning Logs
    const unsubCleaning = onSnapshot(collection(db, "pa_cleaning"), (snapshot) => {
      setCleaningLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CleaningLog)));
    });

    // Ambil Maintenance Logs
    const unsubMaint = onSnapshot(collection(db, "pa_maint"), (snapshot) => {
      setMaintLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceLog)));
    });

    return () => { unsubKeluhan(); unsubCleaning(); unsubMaint(); };
  }, []);

  // --- FUNGSI UNTUK MENYIMPAN (ADD) ---
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
      alert("Gagal menyimpan ke Database!");
    }
  };

  const handleAddCleaning = async (data: any) => {
    await addDoc(collection(db, "pa_cleaning"), { ...data, createdAt: serverTimestamp() });
  };

  // ... fungsi delete/update ...
  const handleDeleteKeluhan = async (id: string) => {
    await deleteDoc(doc(db, "pa_keluhans", id));
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {user && <Header user={user} pendingComplaints={pendingComplaints} />}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={
                user ? <Dashboard keluhans={keluhans} cleaning={cleaningLogs} maintenance={maintLogs} security={secLogs} /> 
                     : <PublicKeluhan existingKeluhans={keluhans} onAdd={handleAddKeluhan} />
              } />

              <Route path="/public" element={<PublicKeluhan existingKeluhans={keluhans} onAdd={handleAddKeluhan} />} />
              
              {/* Pastikan props onAdd dan onDelete menggunakan fungsi Firebase di atas */}
              <Route path="/cleaning" element={user ? <CleaningChecklist user={user} logs={cleaningLogs} onAdd={handleAddCleaning} onDelete={(id) => deleteDoc(doc(db, "pa_cleaning", id))} /> : <Navigate to="/login" />} />
              
              <Route path="/complaints" element={
                user?.role === 'Admin' ? <ComplaintsAdmin keluhans={keluhans} onDelete={handleDeleteKeluhan} onUpdate={(k) => updateDoc(doc(db, "pa_keluhans", k.id), k)} /> : <Navigate to="/" />
              } />
              
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
