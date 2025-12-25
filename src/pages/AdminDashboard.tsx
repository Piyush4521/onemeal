import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Users, Megaphone, Ban, CheckCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeoButton } from '../components/ui/NeoButton';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'announcement'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) navigate('/admin');
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubUsers();
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

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white border-4 border-dark rounded-2xl p-6 shadow-neo mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-black">👑 Owner Dashboard</h1>
        <NeoButton onClick={() => { localStorage.removeItem('isAdmin'); navigate('/'); }} variant="danger" className="text-sm">
            <LogOut size={16} /> Logout
        </NeoButton>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6">
        <div className="space-y-4">
            <button onClick={() => setActiveTab('users')} className={`w-full p-4 border-2 border-dark rounded-xl font-bold flex items-center gap-2 ${activeTab === 'users' ? 'bg-primary shadow-neo' : 'bg-white'}`}>
                <Users size={20}/> Manage Users
            </button>
            <button onClick={() => setActiveTab('announcement')} className={`w-full p-4 border-2 border-dark rounded-xl font-bold flex items-center gap-2 ${activeTab === 'announcement' ? 'bg-yellow-400 shadow-neo' : 'bg-white'}`}>
                <Megaphone size={20}/> Announcements
            </button>
        </div>
        <div className="md:col-span-3 bg-white border-4 border-dark rounded-2xl p-6 shadow-neo min-h-[500px]">
            {activeTab === 'users' ? (
                <div>
                    <h2 className="text-2xl font-black mb-6">🚫 User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b-2 border-dark">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-gray-200">
                                        <td className="p-3 font-bold">{u.name || "Unknown"}</td>
                                        <td className="p-3 uppercase text-xs font-bold text-gray-500">{u.role}</td>
                                        <td className="p-3">
                                            {u.banned ? <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-black">BANNED</span> : <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-black">ACTIVE</span>}
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => toggleBan(u.id, u.banned)} className="hover:scale-110 transition-transform">
                                                {u.banned ? <CheckCircle className="text-green-600"/> : <Ban className="text-red-600"/>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-black mb-6">📢 Global Announcement</h2>
                    <p className="mb-4 font-bold text-gray-600">This message will appear on the top of the Landing Page for everyone.</p>
                    <textarea 
                        className="w-full border-2 border-dark rounded-xl p-4 font-bold h-32 outline-none focus:bg-gray-50"
                        placeholder="Ex: Heavy rains in Solapur! Urgent food donations needed at Station Road."
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                    ></textarea>
                    <NeoButton onClick={postAnnouncement} className="mt-4 w-full">🚀 Go Live</NeoButton>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;