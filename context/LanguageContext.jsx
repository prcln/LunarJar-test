import React, { createContext, useContext, useState } from 'react';
import { Globe } from 'lucide-react';

const translations = {
  en: {
    title: "Welcome to My App",
    greeting: "Hello! How are you today?",
    description: "This is a multilingual React application.",
    button: "Click Me",
    footer: "Made with React",
    selectLanguage: "Select Language",
    treeLoading: "Loading your wish tree...",
    // Navbar
    navMyTree: "My Tree",
    navCreateTree: "Create Tree",
    navComTree: "Community Tree",
    navPubTree: "Public Trees",
    navLogOut: "Log out",
    
    // Tree
    treeTitle: "Apricot Blossom Wish Tree",
    treeSubtitle: "Click on the decorations to read wishes!",
      // Buttons
      treeShareBtt: "Share this Tree",
      treeFormBtt: "Make a Wish!",
    
    // Admin panel

    codePanelHeader: "Invite Codes Manager",
    codePanelRefresh: "Refresh",
    codePanelTotalCodes: "Total Codes",
    codePanelSearchTerm: "Search by code or user...",
    codePanelNotFound: "No invite codes found matching your criteria.",
    codeTableCode: "Code",
    codeTableStatus: "Status",
    codeTableUsedBy: "Used By",
    codeTableUsedAt: "Used At",
    codeTablePrev: "Previous",
    codeTableNext: "Next",

    modalTitle: "Generate New Invite Codes",

    numberCodes: "Number of codes to generate:",
    codeStatusUsed: "Used",
    codeStatusAvailable: "Available",
    

    //Error
    errUnableLoadTree: "Unable to Load Tree",
  },
  vi: {
    title: "Chào mừng bạn đến với ứng dụng của chúng tôi",
    greeting: "Xin chào! Hôm nay bạn có khỏe không?",
    description: "Đây là một ứng dụng React hỗ trợ đa ngôn ngữ.",
    button: "Nhấn để bắt đầu",
    footer: "Được xây dựng bằng React",
    selectLanguage: "Chọn ngôn ngữ",
    treeLoading: "Đang tải cây điều ước của bạn...",

    // Thanh điều hướng
    navMyTree: "Cây của tôi",
    navCreateTree: "Tạo cây mới",
    navComTree: "Cây cộng đồng",
    navPubTree: "Cây công khai",
    navLogOut: "Đăng xuất",

    // Cây điều ước
    treeTitle: "Cây Hoa Mai Điều Ước",
    treeSubtitle: "Chạm vào những món trang trí để đọc điều ước của mọi người!",

    // Nút
    treeShareBtt: "Chia sẻ cây này",
    treeFormBtt: "Gửi điều ước",

    // Bảng quản trị
    codePanelHeader: "Trình quản lý mã mời",
    codePanelRefresh: "Làm mới",
    codePanelTotalCodes: "Tổng số mã mời",
    codePanelSearchTerm: "Tìm kiếm theo mã hoặc người dùng...",
    codePanelNotFound: "Không tìm thấy mã mời nào phù hợp với tìm kiếm của bạn.",
    codeTableCode: "Mã mời",
    codeTableStatus: "Trạng thái",
    codeTableUsedBy: "Người đã sử dụng",
    codeTableUsedAt: "Thời gian sử dụng",
    codeTablePrev: "Trước",
    codeTableNext: "Tiếp",

    modalTitle: "Tạo mã mời mới",

    numberCodes: "Số lượng mã cần tạo:",
    codeStatusUsed: "Đã sử dụng",
    codeStatusAvailable: "Chưa sử dụng",

    // Lỗi
    errUnableLoadTree: "Không thể tải cây điều ước",
  },
}

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load saved language from memory on mount
    const saved = sessionStorage.getItem('appLanguage');
    return saved || 'en';
  });

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    // Persist language selection to memory
    sessionStorage.setItem('appLanguage', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Language Switcher Component
export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-5 h-5 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};