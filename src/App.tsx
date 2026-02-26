import { db } from './firebase'; // Import config yang Anda buat
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const App: React.FC = () => {
  // ... state user tetap menggunakan localStorage untuk session login ...
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pa_user');
    return saved ? JSON.parse(saved) : null;
  });

  // State data sekarang diinisialisasi kosong
  const [keluhans, setKeluhans] = useState<Keluhan[]>([]);
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  // ... state lainnya ...

  // --- SINCRONISASI FIRESTORE ---

  useEffect(() => {
    // Ambil Keluhan
    const qKeluhan = query(collection(db, "keluhans"), orderBy("createdAt", "desc"));
    const unsubKeluhan = onSnapshot(qKeluhan, (snapshot) => {
      setKeluhans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Keluhan)));
    });

    // Ambil Cleaning Logs
    const unsubCleaning = onSnapshot(collection(db, "cleaning"), (snapshot) => {
      setCleaningLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CleaningLog)));
    });

    return () => { unsubKeluhan(); unsubCleaning(); };
  }, []);

  // --- FUNGSI ACTION (CRUD) ---

  const addKeluhan = async (data: any) => {
    await addDoc(collection(db, "keluhans"), { ...data, createdAt: serverTimestamp() });
  };

  const deleteKeluhan = async (id: string) => {
    await deleteDoc(doc(db, "keluhans", id));
  };

  // ... Gunakan fungsi ini di dalam Route Anda ...
