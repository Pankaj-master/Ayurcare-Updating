// components/ui/languageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      onChange={changeLanguage}
      value={i18n.language}
      className="border border-gray-300 text-sm rounded px-2 py-1 bg-background"
    >
      <option value="en">EN</option>
      <option value="hi">हिं</option>
      <option value="mr">मराठी</option>
      <option value="or">ଓଡ଼ିଆ</option>
    </select>
  );
};

export default LanguageSwitcher;
