import React, { useState, useEffect, useCallback } from "react";
import "./MedecinDashboard.css";
import MesConges from "./MesConges";
import VisiteMedicaleModal from './VisiteMedicaleModal'; 

const MedecinDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("planning");
  const [rdvAujourdhui, setRdvAujourdhui] = useState([]);
  const [rdvAVenir, setRdvAVenir] = useState([]);
  const [mesPatients, setMesPatients] = useState([]);
  const [mesConges, setMesConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dossierActif, setDossierActif] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientForNewDossier, setPatientForNewDossier] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [selectedGS, setSelectedGS] = useState("");
  const [showObsForm, setShowObsForm] = useState(false); 
  const [nouvelleObs, setNouvelleObs] = useState("");
  const [observations, setObservations] = useState([]);
  const [toutesAllergies, setToutesAllergies] = useState([]);
  const [toutesMaladies, setToutesMaladies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(null);
  const [showCongeModal, setShowCongeModal] = useState(false);
  const [newConge, setNewConge] = useState({
    type_conge: "annuel",
    date_debut_conge: "",
    date_fin_conge: "",
  });
  const [medecinInfo, setMedecinInfo] = useState(null);
  const [isVisiteModalOpen, setIsVisiteModalOpen] = useState(false);

  const handleOpenVisite = async (patient) => {
    if (!patient) return;
    setSelectedPatient({
      id: patient.id_patient,
      nom: patient.nom_utilisateur || `Patient #${patient.id_patient}`
    });
    // Fetch the dossier for the patient
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/dossier_medical/${patient.id_patient}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        // Dossier doesn't exist, prompt to create
        setPatientForNewDossier(patient);
        setShowCreateModal(true);
        return;
      } else if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erreur d'accès");
      } else {
        const data = await response.json();
        console.log("Données du dossier reçues :", data);
        setDossierActif(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement du dossier:", err);
      setDossierActif(null);
    }
    setIsVisiteModalOpen(true);
  };

  const fetchMesConges = async () => {
    const token = localStorage.getItem("token");
    // On utilise l'id stocké dans le profil du médecin (ex: medecinInfo.id_employer)
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/rh/employer/${medecinInfo.id_employer}/conges`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setMesConges(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemandeConge = async (formData) => {
    const token = localStorage.getItem("token");

    // On crée l'objet complet attendu par le schéma DemandeCongeCreate
    const payload = {
      ...formData,
      id_employer: user.id_utilisateur, // On ajoute l'ID ici
    };

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/rh/employer/${user.id_utilisateur}/conge`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), // On envoie le payload complet
        }
      );

      if (res.ok) {
        alert("Demande de congé enregistrée !");
        fetchData();
      } else {
        const error = await res.json();
        console.error("Erreur détaillée:", error);
        // Astuce : error.detail[0].loc contient le nom du champ qui pose problème
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handleSaveNewItem = async (idItem, type) => {
    if (!idItem) {
      alert("Veuillez sélectionner un élément");
      return;
    }

    const token = localStorage.getItem("token");
    const endpoint = type === "allergie" ? "allergies" : "maladies";

    // Construction du corps du JSON
    const body =
      type === "allergie"
        ? { id_allergie: parseInt(idItem), severite: "Moyenne" }
        : { id_maladie: parseInt(idItem) };

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/dossier_medical/${dossierActif.id_dossier}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        setShowAddModal(null);
        // Très important : on rafraîchit les données
        handleConsulter(selectedPatient);
      } else {
        const errorData = await res.json();
        console.error("Détail erreur backend:", errorData);
        alert(
          errorData.detail || "Erreur lors de l'ajout"
        );
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
    }
  };

  const handleRemoveItem = async (type, idItem) => {
    if (
      !window.confirm(
        `Supprimer cette ${type === "allergie" ? "allergie" : "maladie"} ?`
      )
    )
      return;

    const token = localStorage.getItem("token");
    const endpoint = type === "allergie" ? "allergies" : "maladies";
    console.log("Tentative de suppression de l'ID:", idItem);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/dossier_medical/${dossierActif.id_dossier}/${endpoint}/${idItem}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        // Pour rafraîchir sans recharger toute la page, on recharge le dossier
        handleConsulter(selectedPatient);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };
  const handleSaveObservation = async () => {
    if (!nouvelleObs.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const fetchObservations = async (idDossier) => {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://127.0.0.1:8000/dossier_medical/${idDossier}/observations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setObservations(Array.isArray(data) ? data : []);
      };
      const res = await fetch(
        `http://127.0.0.1:8000/dossier_medical/${dossierActif.id_dossier}/observations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texte: nouvelleObs }), // Correspond au schéma ObservationCreate
        }
      );

      if (res.ok) {
        alert("Note clinique enregistrée avec succès !");
        setShowObsForm(false);
        setNouvelleObs("");
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error("Erreur connexion:", err);
    }
  };

  const handleConsulter = async (patient) => {
    setSelectedPatient(patient);
    const token = localStorage.getItem("token");
    const id = patient.id_patient || patient.id;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/dossier_medical/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        // Le dossier n'existe pas : on propose la création
        setPatientForNewDossier(patient);
        setShowCreateModal(true);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erreur d'accès");
      }

      const data = await response.json();
      console.log("Données du dossier reçues :", data);
      setDossierActif(data);
      setDossierActif(data);
      setActiveTab("vue-dossier");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreerDossier = async (groupeSanguin) => {
    const token = localStorage.getItem("token");
    const payload = {
      id_patient: patientForNewDossier.id_patient,
      groupe_sanguin: groupeSanguin,
      date_creation: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/dossier_medical/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const nouveauDossier = await res.json();
        setDossierActif(nouveauDossier);
        setShowCreateModal(false);
        setIsVisiteModalOpen(true);
      }
    } catch (err) {
      console.error("Erreur création dossier:", err);
    }
  };
  // --- Chargement global des données ---
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      setLoading(true);

      // 1. Récupérer les Rendez-vous (via l'ID utilisateur du médecin)
      const resRdv = await fetch(
        `http://127.0.0.1:8000/rh/rendez-vous/medecin/${user.id_utilisateur}`,
        { headers }
      );
      const dataRdv = await resRdv.json();

      if (Array.isArray(dataRdv)) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // 1. Filtrer pour aujourd'hui
        setRdvAujourdhui(dataRdv.filter(r => r.date_rdv === todayStr));
        
        // 2. Filtrer pour le futur (exclure aujourd'hui et le passé)
        setRdvAVenir(dataRdv.filter(r => r.date_rdv > todayStr).sort((a, b) => 
          new Date(a.date_rdv) - new Date(b.date_rdv)
        ));
      }

      // 2. Récupérer uniquement MES patients (via l'ID spécifique médecin)
      // Assurez-vous que l'objet 'user' contient 'id_medecin'
      // Remplacez tout votre bloc fetch patients par ceci :
      const resPatients = await fetch(
        `http://127.0.0.1:8000/clinique/patients/mes-patients/${user.id_utilisateur}`,
        { headers }
      );
      const dataPatients = await resPatients.json();
      setMesPatients(dataPatients);

      // 3. Récupérer les congés (via l'ID utilisateur)
      const resConges = await fetch(
        `http://127.0.0.1:8000/rh/conges/employer/${user.id_utilisateur}`,
        { headers }
      );
      const dataConges = await resConges.json();
      setMesConges(Array.isArray(dataConges) ? dataConges : []);

      const resA = await fetch("http://127.0.0.1:8000/clinique/allergies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resM = await fetch("http://127.0.0.1:8000/clinique/maladies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resA.ok) setToutesAllergies(await resA.json());
      if (resM.ok) setToutesMaladies(await resM.json());
    } catch (err) {
      console.error("Erreur de liaison Backend:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id_utilisateur, user.id_medecin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div className="loading-screen">Chargement des données médicales...</div>
    );

  return (
    <div className="medecin-dashboard">
      <aside className="medecin-sidebar">
        <div className="medecin-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span>Espace Médecin</span>
        </div>

        <nav className="medecin-nav">
          <button
            className={`nav-btn ${activeTab === "planning" ? "active" : ""}`}
            onClick={() => setActiveTab("planning")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Mon Planning
          </button>
          <button
            className={`nav-btn ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => setActiveTab("patients")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Mes Patients
          </button>
          <button
            className={`nav-btn ${activeTab === "conges" ? "active" : ""}`}
            onClick={() => setActiveTab("conges")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Mes Congés
          </button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Déconnexion
        </button>
      </aside>

      <main className="medecin-main">
        <header className="medecin-header">
          <div>
            <h1>Dr. {user?.nom_utilisateur}</h1>
            <p>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-mini">
              <span className="stat-number">{rdvAujourdhui.length}</span>
              <span className="stat-label">RDV du jour</span>
            </div>
            <div className="stat-mini">
              <span className="stat-number">{mesPatients.length}</span>
              <span className="stat-label">Vos Patients</span>
            </div>
          </div>
        </header>

        <div className="medecin-content">
          {activeTab === "planning" && (
  <div className="planning-section">
    {/* SECTION AUJOURD'HUI */}
    <div className="planning-group">
      <h2 className="planning-title">Aujourd'hui</h2>
      <div className="rdv-timeline">
        {rdvAujourdhui.length > 0 ? (
          rdvAujourdhui.map((rdv, idx) => (
            <RdvItem key={`today-${idx}`} rdv={rdv} onOpenVisite={handleOpenVisite} />
          ))
        ) : (
          <p className="empty-state">Aucun rendez-vous pour aujourd'hui.</p>
        )}
      </div>
    </div>

    {/* SECTION À VENIR */}
    <div className="planning-group" style={{ marginTop: '40px' }}>
      <h2 className="planning-title">Rendez-vous à venir</h2>
      <div className="rdv-timeline alternate">
        {rdvAVenir.length > 0 ? (
          rdvAVenir.map((rdv, idx) => (
            <div key={`future-${idx}`} className="rdv-item">
               <div className="rdv-date-badge">
                  {new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
               </div>
               <div className="rdv-time">{rdv.heure_rdv?.substring(0, 5)}</div>
               <div className="rdv-details">
                  <h4>{rdv.patient?.nom_utilisateur || `Patient #${rdv.id_patient}`}</h4>
                  <p>{rdv.motif}</p>
               </div>
               <span className={`rdv-status ${rdv.statut}`}>{rdv.statut}</span>
            </div>
          ))
        ) : (
          <p className="empty-state">Aucun rendez-vous futur.</p>
        )}
      </div>
    </div>
  </div>
)}
          {showCreateModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>
                  Initialiser le dossier de{" "}
                  {patientForNewDossier.nom_utilisateur}
                </h3>
                <p>
                  Aucun dossier trouvé. Veuillez renseigner les informations de
                  base :
                </p>

                <select
                  className="modal-input"
                  value={selectedGS}
                  onChange={(e) => setSelectedGS(e.target.value)}
                >
                  <option value="">Groupe Sanguin (Optionnel)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>

                <div
                  className="modal-actions"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <button
                    className="btn-confirm"
                    onClick={() => handleCreerDossier(selectedGS)}
                  >
                    Confirmer la création
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && (
  <div className="patients-section">
    <h2>Liste de vos patients</h2>
    <div className="patients-grid">
      {mesPatients.length > 0 ? (
        mesPatients.map((p) => (
          <div
            key={p.id_utilisateur || p.id_patient}
            className="patient-card-medecin"
          >
            <div className="patient-avatar-medecin">
              {p.nom_utilisateur?.[0] || "P"}
            </div>
            <div className="patient-info-medecin">
              <h3>{p.nom_utilisateur}</h3>
              <p>{p.email}</p>
            </div>
            {/* Remplacé handleConsulter par handleOpenVisite */}
            <button
              className="btn-dossier"
              onClick={() => handleOpenVisite(p)}
            >
              Consulter
            </button>
          </div>
        ))
      ) : (
        <p className="empty-state">
          Vous n'avez aucun patient assigné pour le moment.
        </p>
      )}
    </div>
  </div>
)}
          {activeTab === "vue-dossier" && dossierActif && (
            <div className="dossier-view-container">
              <button
                className="back-btn"
                onClick={() => setActiveTab("patients")}
              >
                ←
              </button>

              <div className="dossier-header-card">
                <div>
                  <h2>Dossier de {selectedPatient?.nom_utilisateur}</h2>
                  <p style={{ color: "#6B7280" }}>{selectedPatient?.email}</p>
                </div>
                <span className="id-tag">REF-{dossierActif.id_dossier}</span>
              </div>

              <div className="dossier-grid">
                {/* Colonne Allergies */}
                <div
                  className="section-card"
                  style={{
                    background: "#FFF5F5",
                    padding: "20px",
                    borderRadius: "12px",
                  }}
                >
                  <h3 style={{ color: "#C53030", marginBottom: "15px" }}>
                    ⚠️ Allergies
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {dossierActif.allergies?.map((a, i) => (
                      <li key={i} className="list-item-removable">
                        <span>
                          <strong>{a.allergie?.nom_allergie}</strong>
                        </span>
                        <button
                          className="btn-remove"
                          onClick={() => {
                            // On vérifie les deux emplacements possibles
                            const id = a.id_allergie || a.allergie?.id_allergie;
                            if (id) {
                              handleRemoveItem("allergie", id);
                            } else {
                              console.error(
                                "ID toujours manquant. Vérifiez schema.py",
                                a
                              );
                            }
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn-dossier"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={() => setShowAddModal("allergie")}
                  >
                    + Ajouter une allergie
                  </button>
                </div>

                {/* Colonne Maladies */}
                <div
                  className="section-card"
                  style={{
                    background: "#F0F9FA",
                    padding: "20px",
                    borderRadius: "12px",
                  }}
                >
                  <h3 style={{ color: "#1D837F", marginBottom: "15px" }}>
                    🩺 Antécédents
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {dossierActif.maladies?.map((m, i) => (
                      <li key={i} className="list-item-removable">
                        <span>{m.maladie?.nom_maladie}</span>
                        <button
                          className="btn-remove"
                          onClick={() => {
                            // On récupère l'ID soit dans la table de liaison, soit dans l'objet maladie
                            const idToDelete =
                              m.id_maladie || m.maladie?.id_maladie;

                            console.log("Suppression maladie ID:", idToDelete);

                            if (idToDelete) {
                              handleRemoveItem("maladie", idToDelete);
                            } else {
                              alert("Erreur: ID de maladie introuvable");
                            }
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn-dossier"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={() => setShowAddModal("maladie")}
                  >
                    + Ajouter un antécédent
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "conges" && (
            <MesConges
              conges={mesConges || []}
              onAddConge={handleDemandeConge}
            />
          )}
        </div>
        
        
      </main>
      <VisiteMedicaleModal 
          isOpen={isVisiteModalOpen} 
          onClose={() => setIsVisiteModalOpen(false)} 
          patient={selectedPatient}
          dossierActif={dossierActif}
          handleRemoveItem={handleRemoveItem}
          toutesAllergies={toutesAllergies}
          toutesMaladies={toutesMaladies}
          handleSaveNewItem={handleSaveNewItem}
        />
    </div>
  );
};
const RdvItem = ({ rdv, isFuture = false, onOpenVisite }) => (
  <div className="rdv-item">
    {isFuture && (
      <div className="rdv-date-badge">
        {new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </div>
    )}
    <div className="rdv-time">{rdv.heure_rdv?.substring(0, 5)}</div>
    <div className="rdv-details">
      <h4>{rdv.patient?.nom_utilisateur || `Patient #${rdv.id_patient}`}</h4>
      <p>{rdv.motif || "Consultation"}</p>
      <span className={`rdv-status status-${rdv.statut}`}>{rdv.statut}</span>
    </div>
    <button 
      className="rdv-action" 
      onClick={() => onOpenVisite(rdv.patient)}
    >
      Dossier
    </button>
  </div>
);

export default MedecinDashboard;
