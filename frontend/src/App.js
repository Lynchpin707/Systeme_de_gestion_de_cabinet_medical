import React, { useState, useEffect } from 'react';
import MedecinDashboard from './components/MedecinDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Hero from './components/Hero';
import LoginModal from './components/LoginModal';
import Particles from './components/Particles';
import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';
import './App.css';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState('apropos'); 
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. RESTAURATION DE SESSION AU CHARGEMENT (F5)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      console.log('🔄 Session détectée, restauration...');
      try {
        const user = JSON.parse(savedUser);
        // On s'assure que le format correspond à ce que les dashboards attendent
        const userWithRole = {
          ...user,
          roles: user.roles || [user.role]
        };
        setCurrentUser(userWithRole);
        setIsAdminView(true);
      } catch (e) {
        console.error("Erreur de lecture du localStorage", e);
        localStorage.clear();
      }
    }
  }, []);

  // 2. ÉCOUTEUR DE CONNEXION (Via LoginModal)
  useEffect(() => {
    window.onAdminLogin = (user) => {
      console.log('🎯 Connexion réussie pour:', user.nom_utilisateur);
      
      // On s'assure que l'objet user a bien le tableau roles
      const formattedUser = {
        ...user,
        roles: user.roles || [user.role]
      };

      // Sauvegarde persistante
      localStorage.setItem('user', JSON.stringify(formattedUser));
      
      setCurrentUser(formattedUser);
      setIsAdminView(true);
    };

    return () => {
      window.onAdminLogin = null;
    };
  }, []);

  // 3. FONCTION DE DÉCONNEXION CENTRALISÉE
  const handleLogout = () => {
    console.log('🚪 Déconnexion en cours...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAdminView(false);
    setCurrentUser(null);
  };

  // GESTION DES MODALS ET SIDEBAR
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

  const closeSidebar = () => setIsSidebarOpen(false);

  // 4. AFFICHAGE CONDITIONNEL DES DASHBOARDS
  if (isAdminView && currentUser) {
    const roles = currentUser.roles || [];

    // Dashboard Admin ou Secrétaire
    if (roles.includes('admin') || roles.includes('secretaire')) {
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    }
    
    // Dashboard Médecin
    if (roles.includes('medecin')) {
      return <MedecinDashboard user={currentUser} onLogout={handleLogout} />;
    }
    
    // Dashboard Patient
    if (roles.includes('patient')) {
      return <PatientDashboard user={currentUser} onLogout={handleLogout} />;
    }
  }

  // 5. PAGE D'ACCUEIL PUBLIQUE
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