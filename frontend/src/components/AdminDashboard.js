import React, { useState, useEffect } from 'react';
import HistoriqueVisites from './HistoriqueVisites';
import './AdminDashboard.css';
import CalendrierConges from './CalendrierConges';
import AddPatientModal from '../components/AddPatientModal';
import AddEmployeeModal from '../components/AddEmployeeModal';
import ActesMedicauxManager from '../components/ActesMedicauxManager';
import CongeManager from '../components/CongeManager';
import FacturesManager from './FacturesManager';
import CatalogueManager from './CatalogueManager';

const AdminDashboard = ({ user, onLogout }) => {
  // 1. ÉTATS (Hooks en haut obligatoirement)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const [employees, setEmployees] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [actesMedicaux, setActesMedicaux] = useState([]);
  const [demandesConge, setDemandesConge] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. CHARGEMENT DES DONNÉES DEPUIS LE BACKEND
const fetchData = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Aucun token trouvé");
    return;
  }

  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    setLoading(true);
    // On teste d'abord les patients
    // 1. Récupération des Patients
    const resPatients = await fetch('http://127.0.0.1:8000/patients/', { headers });
    const dataPatients = await resPatients.json();
    console.log("Données patients reçues:", dataPatients);
    setPatients(Array.isArray(dataPatients) ? dataPatients : []);

    // 2. Récupération des Employés
    const resEmployees = await fetch('http://127.0.0.1:8000/utilisateurs/employes', { headers });
    const dataEmployees = await resEmployees.json();
    console.log("Données employés reçues:", dataEmployees);
    setEmployees(Array.isArray(dataEmployees) ? dataEmployees : []);

    // 3. Récupération des Congés (pour le Calendrier)
    const resConges = await fetch('http://127.0.0.1:8000/rh/conges', { headers });
    const dataConges = await resConges.json();
    console.log("Données congés reçues:", dataConges);
    setDemandesConge(Array.isArray(dataConges) ? dataConges : []);

    // 4. Optionnel : Récupération des Actes médicaux
    const resActes = await fetch('http://127.0.0.1:8000/actes/', { headers });
    const dataActes = await resActes.json();
    setActesMedicaux(Array.isArray(dataActes) ? dataActes : []);

    const resCat = await fetch('http://127.0.0.1:8000/catalogue/', { headers });
    const dataCat = await resCat.json();
    setCatalogues(dataCat);



  } catch (error) {
    console.error("Erreur de connexion au serveur:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // 3. VARIABLES DÉRIVÉES
  const stats = [
    { title: 'Patients', value: patients.length.toString(), icon: '👥', change: 'Total base', color: '#3EAEB1' },
    { title: 'Employés', value: employees.length.toString(), icon: '👨‍⚕️', change: 'Actifs', color: '#61BACA' },
    { title: 'Rendez-vous', value: appointments.length.toString(), icon: '📅', change: 'Aujourd\'hui', color: '#9CD1CE' },
    { title: 'Revenus', value: `0 MAD`, icon: '💰', change: 'Total encaissé', color: '#1D837F' }
  ];

  const recentPatients = patients.slice(-4).reverse();
  const recentAppointments = appointments.slice(0, 4);

  // 4. ACTIONS (API DELETE/UPDATE)
// SUPPRESSION REELLE
const handleDeleteEmployee = async (email) => {
  if (window.confirm(`Voulez-vous vraiment supprimer l'employé avec l'email : ${email} ?`)) {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/utilisateurs/employes/${email}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // Rafraîchir la liste après suppression
        fetchData();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
    }
  }
};

// AJOUT REEL (à passer en prop à AddEmployeeModal)
const handleAddEmployee = async (formData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://127.0.0.1:8000/utilisateurs/employer', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowAddEmployee(false);
      fetchData(); // Rafraîchir
    }
  } catch (err) {
    console.error("Erreur lors de l'ajout:", err);
  }
};

  if (loading) return <div className="loading-screen">Chargement du cabinet...</div>;

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </button>
          <button className={`nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Patients
          </button>
          <button className={`nav-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Employés
          </button>
          <button className={`nav-btn ${activeTab === 'conges' ? 'active' : ''}`} onClick={() => setActiveTab('conges')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Congés
          </button>
          <button className={`nav-btn ${activeTab === 'actes' ? 'active' : ''}`} onClick={() => setActiveTab('actes')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Actes
          </button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>Déconnexion</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Bienvenue, {user?.nom_utilisateur || 'Admin'}</h1>
            <p>Gérez votre cabinet médical en temps réel</p>
          </div>
          <div className="header-actions">
            <div className="user-profile">
               <div className="profile-avatar">{user?.nom_utilisateur?.charAt(0) || 'A'}</div>
               <span>{user?.nom_utilisateur}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                    <div className="stat-icon" style={{ background: `${stat.color}15` }}><span style={{ color: stat.color }}>{stat.icon}</span></div>
                    <div className="stat-details">
                      <h3>{stat.title}</h3>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-change">{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-header">
                <h2>Patients Récents</h2>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Nom</th><th>Email</th></tr>
                  </thead>
                  <tbody>
                    {/* C'est ici qu'il faut utiliser recentPatients */}
                    {recentPatients.length > 0 ? (
                      recentPatients.map(p => (
                        <tr key={p.id_utilisateur}>
                          <td><strong>{p.nom_utilisateur}</strong></td>
                          <td>{p.email}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2">Aucun patient trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'patients' && (
             <div className="page-content">
                <div className="page-header"><h2>Gestion des Patients</h2></div>
                <table className="data-table">
                  <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Couverture</th></tr></thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id_utilisateur}>
                        <td>{p.nom_utilisateur}</td>
                        <td>{p.email}</td>
                        <td>{p.numero_tl || '-'}</td>
                        <td><span className="coverage-badge">{p.couverture_medicale || 'Aucune'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {activeTab === 'employees' && (
            <div className="page-content">
               <div className="page-header">
                 <h2>Gestion des Employés</h2>
                 <button className="add-btn" onClick={() => setShowAddEmployee(true)}>+ Ajouter</button>
               </div>
               <div className="employees-grid">
                 {employees.map(emp => (
                   <div key={emp.email} className="employee-card">
                     <div className="employee-info">
                       <h3>{emp.nom_utilisateur}</h3>
                       <p className="employee-role">{emp.role} - {emp.specialite || 'Secrétariat'}</p>
                       <p>{emp.email}</p>
                     </div>
                     <div className="employee-actions">
                        <button className="action-btn delete" onClick={() => handleDeleteEmployee(emp.email)}>Supprimer</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          {/* --- SECTION CONGÉS --- */}
{activeTab === 'conges' && (
  <div className="page-content">
    <div className="conges-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      
      {/* 1. Gestion des demandes */}
      <div className="management-panel">
        <CongeManager
  demandes={demandesConge}
  currentUser={user}
  onApprove={async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/rh/conges/${id}/statut?statut=accepte`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
      alert("Congé validé et statut employé mis à jour !");
      await fetchData(); 
    }
    } catch (err) { console.error(err); }
  }}
  onReject={async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/rh/conges/${id}/statut?statut=refuse`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  }}
  fetchData={fetchData}
/>
      </div>

      {/* 2. Calendrier (Visualisation) */}
      <div className="calendar-panel">
        <div className="dashboard-card" style={{ height: '100%', padding: '20px' }}>
          <div className="card-header">
            <h2>Calendrier des absences</h2>
          </div>
          <CalendrierConges demandes={demandesConge} />
        </div>
      </div>

    </div>
  </div>
)}
      {activeTab === 'actes' && (
            <section id="actes-section" className="management-panel">
        <CatalogueManager 
          catalogues={catalogues} 
          fetchData={fetchData} 
        />
      </section>
          )}
        </div>
      </main>

      <AddPatientModal isOpen={showAddPatient} onClose={() => setShowAddPatient(false)} onAdd={() => fetchData()} />
      <AddEmployeeModal isOpen={showAddEmployee} onClose={() => setShowAddEmployee(false)} onAdd={() => fetchData()} />
    </div>
  );
};

export default AdminDashboard;