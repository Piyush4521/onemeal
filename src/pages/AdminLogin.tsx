import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Wrench } from 'lucide-react'; 
import { NeoButton } from '../components/ui/NeoButton';
import toast from 'react-hot-toast';
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const OWNER_EMAIL = "missiononemeal@gmail.com";
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (user.email === OWNER_EMAIL) {
          if (!userSnap.exists() || userSnap.data().role !== 'admin') {
              toast.loading("Owner detected. Promoting to Admin...", { duration: 2000 });
                  await setDoc(userRef, {
                  uid: user.uid,
                  email: user.email,
                  name: "System Owner",
                  role: "admin", 
                  createdAt: new Date()
              }, { merge: true });
              
              toast.success("Database Fixed! You are now Admin.");
              navigate('/admin-dashboard');
              return;
          }
      }
      if (userSnap.exists() && userSnap.data().role === 'admin') {
          toast.success("Welcome, Boss! 👑");
          navigate('/admin-dashboard');
      } else {
          await signOut(auth);
          toast.error("Database Error: You don't have 'Admin' role access.");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white border-4 border-dark rounded-3xl p-8 shadow-neo max-w-md w-full text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

        <div className="bg-red-100 w-20 h-20 rounded-full border-2 border-dark flex items-center justify-center mx-auto mb-6 relative z-10">
            <ShieldCheck size={40} className="text-red-600" />
        </div>
        
        <h1 className="text-3xl font-black mb-2">Admin Access</h1>
        <p className="text-gray-600 font-bold mb-6 flex items-center justify-center gap-2">
            <Lock size={16} /> Owner Only Area 🚧
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
            <input 
                type="email" 
                placeholder="Admin Email" 
                className="w-full border-2 border-dark rounded-xl px-4 py-3 font-bold outline-none focus:bg-gray-50 focus:ring-4 ring-gray-200 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password" 
                className="w-full border-2 border-dark rounded-xl px-4 py-3 font-bold outline-none focus:bg-gray-50 focus:ring-4 ring-gray-200 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <NeoButton className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white border-red-900" disabled={loading}>
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </NeoButton>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold">
            <Wrench size={12} /> Auto-Fix Enabled for Owner
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;