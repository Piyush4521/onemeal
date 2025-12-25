import { createContext, useState, useContext, type ReactNode } from 'react';

const translations = {
  en: {
    nav_home: "Home",
    nav_login: "Login",
    nav_logout: "Logout",
    hero_title: "Share Food,",
    hero_title_span: "Save Humanity.",
    hero_subtitle: "Connect surplus food from hotels & events to NGOs instantly. Stop wasting, start feeding.",
    btn_donor: "Donate Food",
    btn_receiver: "Collect Food",
    login_title: "Who are you?",
    login_subtitle: "Select your role to continue",
    card_donor: "I am a Donor",
    card_receiver: "I am an NGO",
    login_google: "Login with Google",
    karma: "Karma Points",
    verified: "AI Verified",
    loading: "Loading...",
    donate_title: "Donate Food",
    live_badge: "Live",
    cam_btn: "Take Fresh Photo",
    cam_sub: "(Required for AI Check)",
    item_lbl: "Food Item",
    item_ph: "e.g. 50 Rotis",
    qty_lbl: "Quantity",
    qty_ph: "e.g. 5kg (Serves 20)",
    phone_lbl: "Phone Number",
    addr_lbl: "Pickup Location",
    gps_btn: "Detect Location",
    submit_btn: "List Donation",
    history_title: "Your History",
    ai_check_btn: "Verify with AI"
  },
  hi: {
    nav_home: "मुख्य पृष्ठ",
    nav_login: "लॉग इन",
    nav_logout: "लॉग आउट",
    hero_title: "खाना बांटें,",
    hero_title_span: "मानवता बचाएं।",
    hero_subtitle: "होटल और कार्यक्रमों से बचे हुए खाने को तुरंत जरूरतमंदों तक पहुंचाएं। बर्बादी रोकें, पेट भरें।",
    btn_donor: "दान करना है",
    btn_receiver: "खाना चाहिए",
    login_title: "आप कौन हैं?",
    login_subtitle: "आगे बढ़ने के लिए अपनी भूमिका चुनें",
    card_donor: "मैं डोनर हूँ",
    card_receiver: "मैं NGO हूँ",
    login_google: "गूगल से लॉग इन करें",
    karma: "कर्म अंक",
    verified: "AI द्वारा सत्यापित",
    loading: "लोड हो रहा है...",
    donate_title: "भोजन दान करें",
    live_badge: "लाइव",
    cam_btn: "ताज़ा फोटो लें",
    cam_sub: "(AI जांच के लिए जरूरी)",
    item_lbl: "क्या खाना है?",
    item_ph: "जैसे: 50 रोटी, दाल",
    qty_lbl: "मात्रा",
    qty_ph: "जैसे: 5 किलो (20 लोगों के लिए)",
    phone_lbl: "संपर्क नंबर",
    addr_lbl: "पिकअप का पता",
    gps_btn: "पता ढूंढें",
    submit_btn: "दान पोस्ट करें",
    history_title: "आपका पिछला दान",
    ai_check_btn: "AI से जांचें"
  },
  mr: {
    nav_home: "मुख्य पृष्ठ",
    nav_login: "लॉग इन",
    nav_logout: "बाहेर पडा",
    hero_title: "अन्न वाचवा,",
    hero_title_span: "माणुसकी जपा.",
    hero_subtitle: "हॉटेल आणि कार्यक्रमांमधील उरलेले अन्न गरजूंपर्यंत पोहोचवा. अन्नाची नासाडी थांबवा, भूक मिटवा.",
    btn_donor: "दान करायचे आहे",
    btn_receiver: "अन्न हवे आहे",
    login_title: "तुम्ही कोण आहात?",
    login_subtitle: "पुढे जाण्यासाठी आपली भूमिका निवडा",
    card_donor: "मी डोनर आहे",
    card_receiver: "मी NGO आहे",
    login_google: "गुगल द्वारे लॉग इन करा",
    karma: "पुण्य गुण",
    verified: "AI द्वारे प्रमाणित",
    loading: "लोड होत आहे...",
    donate_title: "अन्नदान करा",
    live_badge: "लाइव्ह",
    cam_btn: "ताजा फोटो घ्या",
    cam_sub: "(AI तपासणीसाठी आवश्यक)",
    item_lbl: "काय जेवण आहे?",
    item_ph: "उदा: 50 पोळ्या, भाजी",
    qty_lbl: "प्रमाण",
    qty_ph: "उदा: 5 किलो (20 लोकांसाठी)",
    phone_lbl: "संपर्क क्रमांक",
    addr_lbl: "कुठून घ्यायचे आहे?",
    gps_btn: "ठिकाण शोधा",
    submit_btn: "दान पोस्ट करा",
    history_title: "तुमचे कार्य",
    ai_check_btn: "AI तपासणी करा"
  }
};

type Language = 'en' | 'hi' | 'mr';
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};