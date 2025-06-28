import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import '../../styles/admin/LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  return (
    <button
      className="language-toggle-button"
      onClick={toggleLanguage}
      aria-label="Toggle language"
    >
      {currentLanguage === 'en' ? 'En' : 'عربي'}
    </button>
  );
};

export default LanguageSwitcher; 