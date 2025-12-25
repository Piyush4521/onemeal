import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr", 
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE, 
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
        if(window.google && window.google.translate) {
            window.googleTranslateElementInit();
        }
    }
  }, []);

  return (
    <div 
        id="google_translate_element" 
        className="notranslate" 
    />
  );
};

export default GoogleTranslate;