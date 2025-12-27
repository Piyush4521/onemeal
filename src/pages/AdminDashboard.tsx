import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Users, Megaphone, Ban, CheckCircle, LogOut, Package, MapPin, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeoButton } from '../components/ui/NeoButton';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'announcement' | 'donations'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
        navigate('/admin');
        return;
    }

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubDonations = onSnapshot(collection(db, "donations"), (snap) => {
      setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error(error));

    return () => { unsubUsers(); unsubDonations(); };
  }, [navigate]);

  const toggleBan = async (userId: string, currentStatus: boolean) => {
      try {
          await updateDoc(doc(db, "users", userId), { banned: !currentStatus });
          toast.success(currentStatus ? "User Unbanned" : "User Banned 🚫");
      } catch(e) { toast.error("Error updating user"); }
  };

  const postAnnouncement = async () => {
      try {
          await setDoc(doc(db, "system", "global"), { message: announcement, active: !!announcement });
          toast.success("Announcement Live! 📢");
          setAnnouncement("");
      } catch(e) { toast.error("Failed to post"); }
  };

  const getStatusBadge = (status: any) => {
      const safeStatus = typeof status === 'string' ? status.toLowerCase() : 'unknown';
      switch(safeStatus) {
          case 'delivered': return <span className="bg-green-200 text-green-900 px-2 py-1 rounded-md border-2 border-green-800 font-bold text-xs">DELIVERED ✅</span>;
          case 'on way': return <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-md border-2 border-blue-800 font-bold text-xs">ON WAY 🚚</span>;
          case 'pending': return <span className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded-md border-2 border-yellow-800 font-bold text-xs">PENDING ⏳</span>;
          default: return <span className="bg-gray-200 text-gray-900 px-2 py-1 rounded-md border-2 border-gray-800 font-bold text-xs">{String(status || "UNKNOWN")}</span>;
      }
  };


  const bannedCount = users.filter(u => u.banned).length;
  const activeDonations = donations.filter(d => d?.status?.toLowerCase() === 'pending').length;

  return (
    <div className="min-h-screen bg-grid-pattern font-sans pb-10">
      
      <div className="w-full bg-black text-white overflow-hidden py-2 border-b-4 border-dark mb-6">
        <div className="animate-marquee whitespace-nowrap font-mono font-bold text-sm flex items-center">
            <span>🔴 SYSTEM STATUS: ONLINE</span>
            <span>⚡ SERVER LOAD: 12%</span>
            <span>🥗 ONEMEAL ADMIN CONSOLE v1.0</span>
            <span>📍 TRACKING ACTIVE: SOLAPUR REGION</span>
            <span>👮‍♂️ BANNED USERS: {bannedCount}</span>
            <span>📦 PENDING DONATIONS: {activeDonations}</span>
            <span>🔴 SYSTEM STATUS: ONLINE</span>
            <span>⚡ SERVER LOAD: 12%</span>
            <span>🥗 ONEMEAL ADMIN CONSOLE v1.0</span>
            <span>📍 TRACKING ACTIVE: SOLAPUR REGION</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        <div className="bg-white border-4 border-dark rounded-2xl p-6 shadow-neo mb-8 flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
                <h1 className="text-4xl font-black uppercase italic">👑 Command Center</h1>
                <p className="text-gray-600 font-bold">Welcome back, Malik. Sab ready hai.</p>
            </div>
            <NeoButton onClick={() => { localStorage.removeItem('isAdmin'); navigate('/'); }} variant="danger" className="text-sm z-10">
                <LogOut size={16} /> Logout
            </NeoButton>

            <Activity className="absolute right-[-20px] top-[-20px] text-gray-100 w-64 h-64 rotate-12 pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-100 border-4 border-dark rounded-xl p-5 shadow-neo flex items-center gap-4">
                <div className="bg-blue-500 text-white p-3 rounded-lg border-2 border-dark">
                    <Users size={32} />
                </div>
                <div>
                    <h3 className="font-black text-2xl">{users.length}</h3>
                    <p className="font-bold text-gray-600 text-sm">Total Users</p>
                </div>
            </div>

            <div className="bg-green-100 border-4 border-dark rounded-xl p-5 shadow-neo flex items-center gap-4">
                <div className="bg-green-500 text-white p-3 rounded-lg border-2 border-dark">
                    <Package size={32} />
                </div>
                <div>
                    <h3 className="font-black text-2xl">{donations.length}</h3>
                    <p className="font-bold text-gray-600 text-sm">Total Donations</p>
                </div>
            </div>

            <div className="bg-red-100 border-4 border-dark rounded-xl p-5 shadow-neo flex items-center gap-4">
                <div className="bg-red-500 text-white p-3 rounded-lg border-2 border-dark">
                    <ShieldAlert size={32} />
                </div>
                <div>
                    <h3 className="font-black text-2xl">{bannedCount}</h3>
                    <p className="font-bold text-gray-600 text-sm">Banned / Flagged</p>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">

            <div className="space-y-4 h-fit sticky top-6">
                <button onClick={() => setActiveTab('users')} className={`w-full p-4 border-2 border-dark rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1 ${activeTab === 'users' ? 'bg-primary shadow-neo' : 'bg-white'}`}>
                    <Users size={20}/> Manage Users
                </button>
                <button onClick={() => setActiveTab('donations')} className={`w-full p-4 border-2 border-dark rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1 ${activeTab === 'donations' ? 'bg-green-400 shadow-neo' : 'bg-white'}`}>
                    <Package size={20}/> Food Tracking
                </button>
                <button onClick={() => setActiveTab('announcement')} className={`w-full p-4 border-2 border-dark rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1 ${activeTab === 'announcement' ? 'bg-yellow-400 shadow-neo' : 'bg-white'}`}>
                    <Megaphone size={20}/> Announcements
                </button>
            </div>

            <div className="md:col-span-3 bg-white border-4 border-dark rounded-2xl p-6 shadow-neo min-h-[500px]">
                {activeTab === 'users' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black">🚫 User Database</h2>
                            <span className="bg-gray-100 px-3 py-1 rounded-lg border-2 border-dark font-bold text-xs">{users.length} Records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b-2 border-dark">
                                    <tr>
                                        <th className="p-3">User Details</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="p-3">
                                                <div className="font-black">{u.name || "Unknown"}</div>
                                                <div className="text-xs text-gray-500 font-bold">{u.email || "No Email"}</div>
                                            </td>
                                            <td className="p-3 uppercase text-xs font-bold text-gray-500">{u.role}</td>
                                            <td className="p-3">
                                                {u.banned ? <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-black border border-red-200">BANNED</span> : <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-black border border-green-200">ACTIVE</span>}
                                            </td>
                                            <td className="p-3">
                                                <button onClick={() => toggleBan(u.id, u.banned)} className="hover:scale-110 transition-transform active:scale-90">
                                                    {u.banned ? <CheckCircle className="text-green-600"/> : <Ban className="text-red-600"/>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'donations' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black">📦 Live Transactions</h2>
                            <span className="bg-green-100 px-3 py-1 rounded-lg border-2 border-green-800 font-bold text-xs text-green-900 animate-pulse">● LIVE</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b-2 border-dark">
                                    <tr>
                                        <th className="p-3">Food Item</th>
                                        <th className="p-3">Donor</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.length === 0 && (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-bold italic">No food donations detected yet! 📡</td></tr>
                                    )}
                                    {donations.map(d => (
                                   <tr key={d.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                       <div className="font-black text-gray-800 uppercase">
                                         {d?.foodItem || "Untitled Meal"}
                                       </div>
                                         {d?.quantity && (
                                    <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                         {d.quantity}
                                    </span>
               )}
                                    </td>

                              <td className="p-3">
                              <div className="font-bold text-sm">{d?.donorName || "Anonymous"}</div>
                              <div className="text-xs text-gray-500 font-mono">{d?.phone}</div>
                              </td>

                              <td className="p-3">
                               {getStatusBadge(d?.status || 'pending')}
                              </td>

                              <td className="p-3 text-xs text-gray-600 font-bold max-w-[150px]">
                              <div className="flex items-start gap-1">
                              <MapPin size={14} className="mt-0.5 shrink-0 text-primary"/> 
                              <span className="truncate" title={d?.address}>
                                {d?.address || "📍 GPS Location"}
                              </span>
                              </div>
                              </td>
                              </tr>
                            ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'announcement' && (
                    <div>
                        <h2 className="text-2xl font-black mb-6">📢 Global Broadcast</h2>
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl mb-4 flex gap-2 items-start">
                             <AlertTriangle className="text-yellow-600 shrink-0" />
                             <p className="text-sm font-bold text-yellow-800">Warning: This message will be sent to ALL user devices and displayed on the home screen.</p>
                        </div>
                        <textarea 
                            className="w-full border-2 border-dark rounded-xl p-4 font-bold h-32 outline-none focus:bg-gray-50 focus:shadow-neo transition-all"
                            placeholder="Ex: Heavy rains in Solapur! Urgent food donations needed at Station Road."
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                        ></textarea>
                        <NeoButton onClick={postAnnouncement} className="mt-4 w-full flex items-center justify-center gap-2">
                            <Megaphone size={20} /> 
                            Publish Broadcast
                        </NeoButton>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;