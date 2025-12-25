import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-white border-2 border-dark rounded-lg overflow-hidden shadow-sm">
        <button 
            onClick={() => setLanguage('en')} 
            className={`px-3 py-1 font-bold text-sm transition-colors ${language === 'en' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        >
            EN
        </button>
        <button 
            onClick={() => setLanguage('hi')} 
            className={`px-3 py-1 font-bold text-sm transition-colors ${language === 'hi' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        >
            हिंदी
        </button>
        <button 
            onClick={() => setLanguage('mr')} 
            className={`px-3 py-1 font-bold text-sm transition-colors ${language === 'mr' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        >
            मराठी
        </button>
    </div>
  );
};