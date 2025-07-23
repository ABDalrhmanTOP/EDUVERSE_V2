import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import '../../styles/admin/LanguageSwitcher.css';
import { FaGlobe } from 'react-icons/fa';

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
      className="language-toggle-navbar"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255,255,255,0.85)',
        border: '1.5px solid #bfae9e',
        borderRadius: 18,
        fontWeight: 800,
        fontSize: 15,
        color: '#a68a6d',
        padding: '6px 16px 6px 12px',
        marginRight: 8,
        boxShadow: '0 2px 8px #bfae9e22',
        cursor: 'pointer',
        transition: 'background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.13s',
        outline: 'none',
        minWidth: 44,
        minHeight: 36,
      }}
      onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #fff8f0 0%, #bfae9e 100%)'}
      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
    >
      <FaGlobe style={{ fontSize: 18, marginRight: 4, color: '#a68a6d' }} />
      <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1 }}>{currentLanguage === 'en' ? 'EN' : 'ع'}</span>
    </button>
  );
};

export default LanguageSwitcher; 