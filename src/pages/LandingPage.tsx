import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Heart, ArrowRight, Users, Target, Phone, Mail, TrendingUp, LogOut, LayoutDashboard, Trophy, Star, Crown, Megaphone, Lock } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { NeoButton } from '../components/ui/NeoButton';
import foodImage from '../assets/img3.png';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore'; 
import toast from 'react-hot-toast';
import GoogleTranslate from '../components/GoogleTranslate'; 

const FOOD_EMOJIS = ["🍕", "🍔", "🥗", "🥦", "🍩", "🥑", "🥕", "🍉", "🍇", "🧁", "🥘", "🌮", "🍱", "🍛", "🥪", "🥞"];
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubAnnounce = onSnapshot(doc(db, "system", "global"), (doc) => {
        if(doc.exists() && doc.data().active) setAnnouncement(doc.data().message);
        else setAnnouncement("");
    });

    const fetchLeaderboard = async () => {
        try {
            const q = query(collection(db, "donations"), where("status", "==", "completed"));
            const snapshot = await getDocs(q);
            const stats: any = {};
            
            snapshot.forEach(doc => {
                const d = doc.data();
                if(d.donorName) {
                    stats[d.donorName] = (stats[d.donorName] || 0) + 10;
                }
            });

            const sorted = Object.keys(stats).map(name => ({
                name, 
                karma: stats[name],
                badge: stats[name] > 50 ? "Hunger Slayer ⚔️" : stats[name] > 20 ? "Food Ninja 🥷" : "Food Hero 🥕"
            })).sort((a,b) => b.karma - a.karma).slice(0, 3);
            
            setLeaderboard(sorted);
        } catch(e) { console.error(e); }
    }
    fetchLeaderboard();
    return () => unsubAnnounce();
  }, []);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        toast.success("Logged out successfully");
        navigate('/'); 
    } catch (error) {
        toast.error("Error logging out");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg text-dark font-sans overflow-x-hidden relative">
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && FOOD_EMOJIS.map((emoji, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{ 
                    opacity: [0, 0.5, 0], 
                    y: [0, random(-100, -200), 0], 
                    x: [0, random(-50, 50), 0], 
                    rotate: [0, random(-180, 180)] 
                }}
                transition={{
                    duration: random(15, 30), 
                    repeat: Infinity,
                    delay: random(0, 0.2),
                    ease: "easeInOut"
                }}
                className="absolute text-6xl filter blur-[1px]" 
                style={{
                    left: `${random(0, 100)}%`,
                    top: `${random(0, 100)}%`,
                }}
            >
                {emoji}
            </motion.div>
        ))}
      </div>

      {announcement && (
        <div className="bg-red-500 text-white font-black py-2 px-4 text-center border-b-2 border-dark animate-pulse flex items-center justify-center gap-2 relative z-50">
            <Megaphone size={20} className="animate-bounce"/> {announcement}
        </div>
      )}

      <nav className="border-b-2 border-dark bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <ChefHat className="w-8 h-8" /> OneMeal
          </div>
          
          <div className="hidden md:flex gap-6">
            <button onClick={() => scrollToSection('mission')} className="hover:underline decoration-2 underline-offset-4 font-bold">Mission</button>
            <button onClick={() => scrollToSection('leaderboard')} className="hover:underline decoration-2 underline-offset-4 font-bold text-yellow-600">Leaderboard</button>
            <button onClick={() => scrollToSection('about')} className="hover:underline decoration-2 underline-offset-4 font-bold">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="hover:underline decoration-2 underline-offset-4 font-bold">Contact</button>
          </div>

          <div className="flex items-center gap-4">
            <GoogleTranslate /> 
            {user ? (
                <div className="flex items-center gap-3">
                    <Link to="/donor"> 
                        <NeoButton variant="secondary" className="text-sm px-4 py-2 flex items-center gap-2 hidden sm:flex">
                            <LayoutDashboard size={16}/> Dashboard
                        </NeoButton>
                    </Link>
                    <NeoButton onClick={handleLogout} variant="danger" className="text-sm px-4 py-2 flex items-center gap-2">
                         <LogOut size={16}/> <span className="hidden sm:inline">Logout</span>
                    </NeoButton>
                </div>
            ) : (
                <Link to="/login">
                    <NeoButton variant="primary" className="text-sm px-4 py-2">Login Karo Boss</NeoButton>
                </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="border-b-2 border-dark bg-yellow-300 overflow-hidden py-2 relative z-20">
        <div className="animate-marquee whitespace-nowrap font-bold text-sm uppercase tracking-wider flex gap-8">
            <span>⚡ Rohit just donated 5kg Rice in Solapur...</span>
            <span>⚡ Priya claimed 3 Meals...</span>
            <span>⚡ New Donation Live: Wedding Leftovers...</span>
            <span>⚡ 50+ Meals distributed today...</span>
            <span>⚡ Rohit just donated 5kg Rice in Solapur...</span>
        </div>
      </div>

      <header className="max-w-6xl mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-20 grid md:grid-cols-2 gap-12 items-center relative z-20">
        <div className="space-y-6">
          <motion.div initial={{ rotate: -2 }} animate={{ rotate: 0 }} className="inline-block bg-accent text-white px-4 py-2 border-2 border-dark shadow-neo rounded-lg font-bold transform -rotate-2">
            🥕 Khana phekne ka nahi!
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Extra food hai? <br />
            <span className="bg-primary px-2 border-2 border-dark rounded-lg inline-block transform rotate-1">Donate kardo.</span>
          </h1>
          <p className="text-xl font-medium text-gray-700">
            Hotels, Mess, aur Shaadi ka bacha hua khana ; Hungry People. <br/>
            <span className="font-bold text-dark">Simple. Fast. Punya ka kaam.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to={user ? "/donor" : "/login"}>
                <NeoButton>Donate Now <Heart className="w-5 h-5 fill-dark ml-2" /></NeoButton>
            </Link>
            <Link to="/recipes"><NeoButton variant="secondary">Recipes Dekho <ArrowRight className="w-5 h-5 ml-2" /></NeoButton></Link>
          </div>
        </div>
        
        <div className="relative">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="bg-white border-2 border-dark rounded-2xl p-8 shadow-neo relative z-10">
            <div className="aspect-video bg-white rounded-lg border-2 border-dark overflow-hidden flex items-center justify-center mb-4">
              <img src={foodImage} alt="Food Donation" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-4 bg-bg p-3 rounded-lg border-2 border-dashed border-gray-300">
                <div className="bg-green-100 p-2 rounded-full border border-dark">
                    <TrendingUp size={24} className="text-green-600" />
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Impact</div>
                    <div className="font-black text-xl flex items-center gap-2">
                        240+ Meals Saved <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-secondary text-dark border-2 border-dark p-3 rounded-full shadow-neo font-bold rotate-12">AI Powered 🤖</div>
          </motion.div>
          <div className="absolute top-10 -left-10 w-full h-full bg-primary rounded-2xl border-2 border-dark -z-0"></div>
        </div>
      </header>

      <div className="border-y-2 border-dark bg-primary overflow-hidden py-4 relative z-20">
        <div className="flex gap-8 animate-marquee whitespace-nowrap font-black text-2xl uppercase tracking-widest">
           <span>🍔 Zero Hunger • 🥗 Bhookh Mitao • 🤖 AI Smart Diet • 📍 Live Tracking • ❤️ Punya Kamao •</span>
           <span>🍔 Zero Hunger • 🥗 Bhookh Mitao • 🤖 AI Smart Diet • 📍 Live Tracking • ❤️ Punya Kamao •</span>
        </div>
      </div>

      <section id="leaderboard" className="py-20 px-4 bg-white border-b-2 border-dark bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative z-20">
        <div className="max-w-4xl mx-auto text-center">
            <div className="bg-yellow-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-dark mx-auto shadow-neo">
                <Trophy size={40} className="text-yellow-800" />
            </div>
            <h2 className="text-5xl font-black mb-4">Karma Leaderboard 🏆</h2>
            <p className="text-xl font-bold text-gray-600 mb-12">Top Donors & Food Heroes</p>
            
            <div className="grid md:grid-cols-3 gap-6 items-end">
                {leaderboard.length > 0 ? leaderboard.map((hero, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        key={index}
                        className={`bg-white border-4 border-dark rounded-2xl p-6 shadow-neo relative ${index === 0 ? 'order-2 scale-110 z-10 bg-yellow-50' : index === 1 ? 'order-1' : 'order-3'}`}
                    >
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                            {index === 0 && <Crown size={40} className="fill-yellow-400 text-dark animate-bounce" />}
                            {index !== 0 && <div className="bg-dark text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white">#{index + 1}</div>}
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-black truncate">{hero.name}</h3>
                            <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded-full mt-1 mb-2">
                                {hero.badge}
                            </div>
                            <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold">
                                <Star size={16} className="fill-current" /> {hero.karma} Karma
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <p className="col-span-3 text-gray-500 font-bold py-10">Loading Heroes...</p>
                )}
            </div>
        </div>
      </section>

      <section id="mission" className="py-20 px-4 bg-white border-b-2 border-dark relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-accent/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-dark mx-auto">
            <Target size={40} />
          </div>
          <h2 className="text-5xl font-black mb-6">Our Mission 🎯</h2>
          <p className="text-2xl font-bold text-gray-700 leading-relaxed">
            "India wastes 68 million tonnes of food every year. Humara aim simple hai: iss number ko <span className="bg-primary px-2 border border-dark rounded transform -rotate-1 inline-block">ZERO</span> banana."
          </p>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-secondary/10 border-b-2 border-dark relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-dark">
                <Users size={40} />
              </div>
              <h2 className="text-5xl font-black mb-6">About Us 🤝</h2>
              <p className="text-xl font-bold text-gray-700 mb-4">
                We are a team of engineers who love food but hate waste.
              </p>
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-white border-2 border-dark p-4 rounded-xl shadow-neo font-bold flex items-center gap-3">
                ✅ Real-time Food Tracking
              </div>
              <div className="bg-white border-2 border-dark p-4 rounded-xl shadow-neo font-bold flex items-center gap-3">
                ✅ AI Freshness Detection
              </div>
              <div className="bg-white border-2 border-dark p-4 rounded-xl shadow-neo font-bold flex items-center gap-3">
                ✅ 100% Non-Profit (Dil se)
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-dark text-bg py-16 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-8 text-white">Contact Us 📞</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
            <a href="mailto:missiononemeal@gmail.com" className="flex items-center justify-center gap-2 text-xl font-bold hover:text-primary transition-colors">
              <Mail /> missiononemeal@gmail.com
            </a>
            <div className="flex items-center justify-center gap-2 text-xl font-bold hover:text-primary transition-colors">
              <Phone /> 9175096541 \ 7030883504
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Link to="/admin" className="text-gray-600 hover:text-white text-sm font-bold opacity-50 flex items-center gap-1">
                <Lock size={12} /> Admin Login
            </Link>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-8 text-gray-400 font-medium">
            &copy; 2025 OneMeal. All rights reserved
          </div>
          <div className="border-t border-gray-700 pt-8 text-gray-400 font-medium">
            Banaya hai Dil se ❤️ aur Code se 💻.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;