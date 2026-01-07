import React, { useState, useEffect } from 'react';
import MedecinDashboard from './components/MedecinDashboard';
import Sidebar from './components/Sidebar';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import LoginModal from './components/LoginModal';
import Particles from './components/Particles';
import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState('apropos'); 
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Écouter l'événement de connexion
  useEffect(() => {
    console.log('🔧 App.js - useEffect exécuté, installation du listener');
    
    window.onAdminLogin = (user) => {
      console.log('🎯 onAdminLogin APPELÉ !');
      console.log('User reçu:', user);
      console.log('Roles:', user?.roles);
      
      setIsAdminView(true);
      setCurrentUser(user);
      
      console.log('État mis à jour: isAdminView=true, currentUser=', user);
    };

    return () => {
      console.log('🧹 Nettoyage du listener');
      window.onAdminLogin = null;
    };
  }, []);
  
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const openSidebar = (type) => {
    setSidebarType(type);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  console.log('🖥️ App.js RENDER - isAdminView:', isAdminView, 'currentUser:', currentUser);

  // Gestion de l'affichage selon le rôle de l'utilisateur
  if (isAdminView && currentUser) {
    console.log('✅ Condition remplie: isAdminView=true ET currentUser existe');
    console.log('Vérification des rôles:', currentUser.roles);
    
    // Admin
    if (currentUser.roles?.includes('admin')) {
      console.log('→ Affichage AdminDashboard');
      return <AdminDashboard user={currentUser} onLogout={() => {
        console.log('🚪 Déconnexion');
        setIsAdminView(false);
        setCurrentUser(null);
      }} />;
    }
    
    // Médecin
    if (currentUser.roles?.includes('medecin')) {
      console.log('→ Affichage MedecinDashboard');
      return <MedecinDashboard user={currentUser} onLogout={() => {
        console.log('🚪 Déconnexion');
        setIsAdminView(false);
        setCurrentUser(null);
      }} />;
    }
    
    // Secrétaire
    if (currentUser.roles?.includes('secretaire')) {
      console.log('→ Affichage AdminDashboard (secrétaire)');
      return <AdminDashboard user={currentUser} onLogout={() => {
        setIsAdminView(false);
        setCurrentUser(null);
      }} />;
    }

    // Patient
    // Patient
if (currentUser.roles?.includes('patient')) {
  return <PatientDashboard user={currentUser} onLogout={() => {
    setIsAdminView(false);
    setCurrentUser(null);
  }} />;
}
    
  } else {
    console.log('❌ Condition NON remplie - Affichage page accueil');
  }

  // Page d'accueil publique
  return (
    <div className="App">
      <Particles />
      <Header onOpenLogin={openLoginModal} onOpenSidebar={openSidebar} />
      <Hero onOpenLogin={openLoginModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} type={sidebarType} />
    </div>
  );
}

export default App;