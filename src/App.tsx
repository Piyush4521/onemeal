import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DonorDashboard from './pages/DonorDashboard';
import RecipeHub from './pages/RecipeHub';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { ChatBot } from './components/ChatBot';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; 
  if (!user) { return <Navigate to="/login" />; }
  return children;
};

const LoginGuard = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const role = userSnap.data().role;
                if (role === 'receiver') setRedirectPath('/receiver');
                else if (role === 'donor') setRedirectPath('/donor');
                else setRedirectPath(null); 
            } else {
                setRedirectPath(null); 
            }
        } catch (e) { console.error("Error fetching user role:", e); }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (redirectPath) { return <Navigate to={redirectPath} />; }
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{
          duration: 3000,
          style: {
            border: '2px solid #171717',
            padding: '16px',
            color: '#171717',
            fontWeight: 'bold',
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
          },
        }}/>
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/recipes" element={<RecipeHub />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={
            <LoginGuard>
              <LoginPage />
            </LoginGuard>
          } />
          <Route path="/donor" element={
            <ProtectedRoute>
              <DonorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/receiver" element={
            <ProtectedRoute>
              <ReceiverDashboard />
            </ProtectedRoute>
          } />
        </Routes>

        <ChatBot />
      </Router>
    </LanguageProvider>
  );
}

export default App;