import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Heart, ArrowLeft, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { NeoButton } from '../components/ui/NeoButton';
import { auth, googleProvider, db } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<'donor' | 'receiver' | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first! (Donor or NGO)");
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: selectedRole,
        lastLogin: new Date()
      };
      await setDoc(userRef, userData, { merge: true });

      toast.success(`Welcome to OneMeal, ${user.displayName}!`);
      
      if (selectedRole === 'donor') {
        navigate('/donor');
      } else {
        navigate('/receiver');
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Login Failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary rounded-full border-4 border-dark opacity-20 -z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary rounded-full border-4 border-dark opacity-20 -z-0"></div>
      <Link to="/" className="absolute top-6 left-6 z-50">
        <NeoButton variant="secondary" className="px-3 py-2">
          <ArrowLeft size={20} /> Back
        </NeoButton>
      </Link>

      <div className="z-10 text-center max-w-4xl w-full pt-16 md:pt-0">
        <h1 className="text-4xl md:text-6xl font-black mb-2">
          Pehle batao, <span className="text-primary bg-dark px-2 rounded">kaun ho tum?</span>
        </h1>
        <p className="text-xl text-gray-600 font-bold mb-12">Select your role to continue</p>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          
          <motion.div 
            whileHover={{ scale: 1.02, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('donor')}
            className={`
              cursor-pointer border-4 border-dark rounded-3xl p-10 bg-white shadow-neo transition-all
              ${selectedRole === 'donor' ? 'ring-4 ring-offset-4 ring-primary bg-yellow-50' : ''}
            `}
          >
            <div className="bg-primary/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dark">
              <ChefHat size={48} className="text-dark" />
            </div>
            <h2 className="text-3xl font-black mb-2">I am a Donor</h2>
            <p className="font-bold text-gray-500">Hotel, Mess, Caterer, or Individual.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('receiver')}
            className={`
              cursor-pointer border-4 border-dark rounded-3xl p-10 bg-white shadow-neo transition-all
              ${selectedRole === 'receiver' ? 'ring-4 ring-offset-4 ring-secondary bg-green-50' : ''}
            `}
          >
            <div className="bg-secondary/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dark">
              <Heart size={48} className="text-dark" />
            </div>
            <h2 className="text-3xl font-black mb-2">I am an NGO</h2>
            <p className="font-bold text-gray-500">Volunteer, Shelter, or Community Center.</p>
          </motion.div>

        </div>

        {selectedRole && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <NeoButton onClick={handleLogin} className="w-full py-4 text-xl flex items-center justify-center gap-3">
              <LogIn /> Login with Google
            </NeoButton>
            <p className="mt-4 font-bold text-gray-500 text-sm">
              Logging in as <span className="uppercase text-primary">{selectedRole}</span>
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;