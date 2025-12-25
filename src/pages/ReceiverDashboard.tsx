import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { NeoButton } from '../components/ui/NeoButton';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const FoodIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return (R * c).toFixed(1); 
};

const ReceiverDashboard = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ngoLocation, setNgoLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setNgoLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.error("Error getting location", error);
                toast.error("Enable location to see distance!");
            }
        );
    }
  }, []);

  useEffect(() => {
    const q = query(
        collection(db, "donations"), 
        where("status", "==", "available")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foodData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(foodData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
    toast.success("Logged out.");
  };

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col h-screen overflow-hidden">
      
      <header className="p-6 bg-white border-b-2 border-dark flex justify-between items-center z-10 shadow-neo">
        <h1 className="text-2xl font-black flex items-center gap-2">
          OneMeal <span className="bg-secondary px-2 border-2 border-dark rounded text-sm">NGO View</span>
        </h1>
        <div className="flex gap-4">
             <Link to="/">
                <NeoButton variant="secondary" className="text-sm py-2 px-4">Home</NeoButton>
            </Link>
            <NeoButton onClick={handleLogout} variant="danger" className="text-sm py-2 px-4">Logout</NeoButton>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        <div className="w-full md:w-1/3 p-6 overflow-y-auto bg-yellow-50 border-r-2 border-dark custom-scrollbar">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            Available Food 🥘 <span className="text-sm bg-dark text-white px-2 rounded-full">{donations.length}</span>
          </h2>
          
          {loading ? (
             <p className="font-bold text-gray-500 animate-pulse">Scanning nearby donors...</p>
          ) : donations.length === 0 ? (
             <div className="text-center p-8 border-2 border-dashed border-gray-400 rounded-xl">
                <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="font-bold text-gray-500">No food available right now.</p>
                <p className="text-sm text-gray-400">Please check back later.</p>
             </div>
          ) : (
             <div className="space-y-4">
               {donations.map((food) => (
                 <FoodCard key={food.id} data={food} ngoLocation={ngoLocation} />
               ))}
             </div>
          )}
        </div>

        <div className="hidden md:block w-2/3 bg-gray-100 relative z-0">
          {!ngoLocation ? (
              <div className="h-full w-full flex items-center justify-center">
                  <p className="font-bold text-gray-500 animate-pulse flex items-center gap-2">
                      <RefreshCw className="animate-spin" /> Locating you on map...
                  </p>
              </div>
          ) : (
              <MapContainer 
                  center={[ngoLocation.lat, ngoLocation.lng]} 
                  zoom={13} 
                  style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[ngoLocation.lat, ngoLocation.lng]} icon={UserIcon}>
                    <Popup>
                        <b>You are here</b> <br/> Ready to collect!
                    </Popup>
                </Marker>

                {donations.map((food) => {
                    if(food.location && food.location.lat) {
                        const dist = calculateDistance(
                            ngoLocation.lat, ngoLocation.lng, 
                            food.location.lat, food.location.lng
                        );
                        return (
                            <Marker 
                                key={food.id} 
                                position={[food.location.lat, food.location.lng]}
                                icon={FoodIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm">{food.foodItem}</h3>
                                        <p className="text-xs">Qty: {food.quantity}</p>
                                        <p className="text-xs font-bold text-green-600 mt-1">
                                            {dist} km away
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    }
                    return null;
                })}

              </MapContainer>
          )}

          <div className="absolute bottom-10 right-10 bg-white/90 border-2 border-dark p-4 rounded-xl shadow-neo z-[400]">
            <p className="font-bold flex items-center gap-2 text-sm">
              <Navigation className="text-blue-600 fill-blue-600" size={16} /> You (Blue)
              <span className="mx-1">|</span>
              <MapPin className="text-green-600 fill-green-600" size={16} /> Food (Green)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

const FoodCard = ({ data, ngoLocation }: any) => {
  const [claimed, setClaimed] = useState(false);
  const [reporting, setReporting] = useState(false); 

  const distance = (data.location && ngoLocation) 
    ? calculateDistance(ngoLocation.lat, ngoLocation.lng, data.location.lat, data.location.lng)
    : null;

  const getTimeAgo = (timestamp: any) => {
      if (!timestamp) return "Just now";
      const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      return `${Math.floor(minutes / 60)}h ago`;
  };

  const handleClaim = async () => {
    try {
        setClaimed(true);
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const foodRef = doc(db, "donations", data.id);
        await updateDoc(foodRef, {
            status: "claimed",
            claimedBy: auth.currentUser?.displayName || "NGO",
            claimedAt: new Date(),
            otp: otpCode 
        });
        toast.success(`Claimed! OTP: ${otpCode}`, { duration: 6000, icon: '🔑' });
    } catch (error) {
        console.error("Error claiming:", error);
        setClaimed(false);
    }
  };

  const handleReport = async () => {
      if(!window.confirm("Are you sure? This will deduct 50 Karma Points from the Donor.")) return;
      
      try {
          setReporting(true);
          const foodRef = doc(db, "donations", data.id);
          await updateDoc(foodRef, {
              status: "reported", 
              reportedAt: new Date(),
              reportedBy: auth.currentUser?.uid
          });
          toast.error("Donation reported as Fake/Missing.");
      } catch (e) {
          console.error(e);
          toast.error("Error reporting.");
          setReporting(false);
      }
  };

  return (
    <motion.div 
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-2 border-dark rounded-xl p-4 shadow-neo relative overflow-hidden"
    >
      {distance && (
          <div className="absolute top-0 left-0 bg-yellow-300 text-xs font-black px-2 py-1 border-r-2 border-b-2 border-dark rounded-br-lg z-10">
              {distance} km away
          </div>
      )}
      <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-2 py-1 border-l-2 border-b-2 border-dark rounded-bl-lg">
        {data.donorName || "Anonymous"}
      </div>

      <h3 className="font-black text-xl mb-1 pr-16 mt-4">{data.foodItem}</h3>
      <p className="text-gray-700 font-bold mb-3 text-sm flex items-center gap-2">
         <span className="bg-gray-200 px-2 py-0.5 rounded text-dark border border-gray-400">Qty: {data.quantity}</span>
      </p>

      <div className="flex items-start gap-2 text-sm font-medium text-gray-600 mb-3 bg-gray-50 p-2 rounded border border-gray-200">
         <MapPin size={16} className="mt-0.5 min-w-[16px]" />
         <span className="line-clamp-2">{data.address}</span>
      </div>

      <div className="flex gap-3 text-xs font-bold text-gray-500 mb-4">
        <span className="flex items-center gap-1"><Clock size={14} /> {getTimeAgo(data.createdAt)}</span>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
          {data.phone && (
             <a href={`tel:${data.phone}`} className="col-span-1 bg-white border-2 border-dark rounded-lg flex items-center justify-center hover:bg-gray-100">
                <Phone size={20} />
             </a>
          )}
          
          <button 
            onClick={handleReport}
            disabled={reporting || claimed}
            className="col-span-1 bg-red-100 border-2 border-red-500 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200"
            title="Report Fake/Missing"
          >
            <AlertCircle size={20} />
          </button>
          
          <NeoButton 
            onClick={handleClaim} 
            disabled={claimed || reporting}
            className={`col-span-3 w-full text-sm py-2 flex items-center justify-center gap-2 ${claimed ? 'bg-gray-300 border-gray-500 text-gray-600 shadow-none' : ''}`}
          >
            {claimed ? 'Claimed' : 'Claim ✋'}
          </NeoButton>
      </div>
    </motion.div>
  );
};

export default ReceiverDashboard;