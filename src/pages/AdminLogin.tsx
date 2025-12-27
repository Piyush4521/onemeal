import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { NeoButton } from '../components/ui/NeoButton';
import toast from 'react-hot-toast';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; 

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const OWNER_EMAIL ="missiononemeal@gmail.com";
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.email !== OWNER_EMAIL) {
        await signOut(auth);
        toast.error("Access Denied! You are not the Owner. 🚫");
        setLoading(false);
        return; 
      }
            localStorage.setItem('isAdmin', 'true'); 
      toast.success("Welcome, Boss! 👑");
      navigate('/admin-dashboard');

    } catch (error: any) {
      console.error("Login Error:", error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error("User does not exist!");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Wrong Password!");
      } else {
        toast.error("Login Failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white border-4 border-dark rounded-3xl p-8 shadow-neo max-w-md w-full text-center">
        <div className="bg-red-100 w-20 h-20 rounded-full border-2 border-dark flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-black mb-2">Admin Access</h1>
        <p className="text-gray-600 font-bold mb-6">Owner Only Area 🚧</p>

        <form onSubmit={handleLogin} className="space-y-4">
            <input 
                type="email" 
                placeholder="Admin Email" 
                className="w-full border-2 border-dark rounded-xl px-4 py-3 font-bold outline-none focus:bg-gray-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password" 
                className="w-full border-2 border-dark rounded-xl px-4 py-3 font-bold outline-none focus:bg-gray-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <NeoButton className="w-full mt-4" disabled={loading}>
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </NeoButton>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;