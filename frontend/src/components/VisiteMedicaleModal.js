import React, { useState, useEffect } from 'react';
import './VisiteMedicaleModal.css';
import PrescriptionView from './PrescriptionView';

const VisiteMedicaleModal = ({ isOpen, onClose, patient, dossierActif, handleRemoveItem, toutesAllergies, toutesMaladies, handleSaveNewItem, rdv }) => {
  const [activeTab, setActiveTab] = useState('visite');
  const [showPrescription, setShowPrescription] = useState(false);

  const selectedPatient = patient;

  const [showAddModal, setShowAddModal] = useState(null);

  const [poids, setPoids] = useState('');
  const [temperature, setTemperature] = useState('');
  const [tensionMax, setTensionMax] = useState('');
  const [tensionMin, setTensionMin] = useState('');
  const [symptomes, setSymptomes] = useState('');
  const [observations, setObservations] = useState('');
  const [tests, setTests] = useState('');
  const [typeVisite, setTypeVisite] = useState('consultation');
  const [severite, setSeverite] = useState('Moyenne');

  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [commentaireOrdonnance, setCommentaireOrdonnance] = useState('');

  const [selectedActes, setSelectedActes] = useState([]);
  const [currentActeId, setCurrentActeId] = useState("");

  const [catalogueActes, setCatalogueActes] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState("");

  const fetchCatalogue = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/catalogue/actes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCatalogueActes(data);
      }
      const resCat = await fetch(`http://127.0.0.1:8000/catalogue/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCatalogues(dataCat);
        if (dataCat.length > 0) setSelectedCatalogue(dataCat[0].id_catalogue);
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
    }
  };
  const handleSaveVisite = async () => {
    const token = localStorage.getItem("token");
    const body = {
      id_RDV: rdv ? rdv.id_RDV : null,
      poids: poids ? parseFloat(poids) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      tension_max: tensionMax ? parseFloat(tensionMax) : null,
      tension_min: tensionMin ? parseFloat(tensionMin) : null,
      type_visite: typeVisite
    };
    try {
      const res = await fetch(`http://127.0.0.1:8000/visites/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const visiteData = await res.json();
        const id_visite = visiteData.id_visite;
        // Save ordonnance if items
        if (prescriptionItems.length > 0) {
          await saveOrdonnance(id_visite);
        }
        // Save actes
        if (selectedActes.length > 0) {
          await fetch(`http://127.0.0.1:8000/visites/${id_visite}/actes`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ id_catalogue: selectedCatalogue, actes: selectedActes.map(id => ({ id_acte: parseInt(id) })) })
          });
        }
        alert("Visite, ordonnance et actes enregistrés");
        onClose();
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur réseau");
    }
  };

  const saveOrdonnance = async (id_visite) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/ordonnances`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_visite,
          instructions: commentaireOrdonnance
        })
      });
      if (res.ok) {
        const ordonnanceData = await res.json();
        const id_ordonnance = ordonnanceData.id_ordonnance;
        // Save items
        for (const item of prescriptionItems) {
          if (item.type === 'med') {
            await fetch(`http://127.0.0.1:8000/ordonnances/${id_ordonnance}/medicaments`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                id_medicament: item.id_medicament,
                posologie: item.posologie,
                duree: item.duree
              })
            });
          } else if (item.type === 'analyse') {
            await fetch(`http://127.0.0.1:8000/ordonnances/${id_ordonnance}/analyses`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                id_analyse: item.id_analyse,
                description: item.description
              })
            });
          }
          // Ignore radio for now
        }
      }
    } catch (err) {
      console.error("Erreur sauvegarde ordonnance:", err);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchCatalogue();
    }
  }, [isOpen]);

  if (!isOpen || !patient) return null;

  if (showAddModal) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <header className="modal-header">
            <h2>Ajouter une {showAddModal}</h2>
            <button className="close-btn" onClick={() => setShowAddModal(null)}>&times;</button>
          </header>
          <div className="modal-body">
            <select id="item-select-modal" className="modal-input">
              <option value="">-- Choisir dans la liste --</option>
              {(showAddModal === "allergie" ? toutesAllergies : toutesMaladies).map((item) => (
                <option key={item.id_allergie || item.id_maladie} value={item.id_allergie || item.id_maladie}>
                  {item.nom_allergie || item.nom_maladie}
                </option>
              ))}
            </select>
            {showAddModal === "allergie" && (
              <select value={severite} onChange={e => setSeverite(e.target.value)} className="modal-input">
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Forte">Forte</option>
              </select>
            )}
            <div className="modal-actions">
              <button className="btn-confirm" onClick={() => {
                const value = document.getElementById("item-select-modal").value;
                if (!value) {
                  alert("Veuillez sélectionner un élément");
                  return;
                }
                // Check for duplicates
                const isDuplicate = showAddModal === "allergie"
                  ? dossierActif?.allergies?.some(a => a.id_allergie === parseInt(value) || a.allergie?.id_allergie === parseInt(value))
                  : dossierActif?.maladies?.some(m => m.id_maladie === parseInt(value) || m.maladie?.id_maladie === parseInt(value));
                if (isDuplicate) {
                  alert(`Cette ${showAddModal} est déjà ajoutée au dossier.`);
                  return;
                }
                handleSaveNewItem(value, showAddModal, severite);
                setShowAddModal(null);
              }}>
                Ajouter
              </button>
              <button className="btn-cancel" onClick={() => setShowAddModal(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <h2>Dossier de : {patient.nom}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <nav className="modal-nav">
          <button className={activeTab === 'visite' ? 'active' : ''} onClick={() => {setActiveTab('visite'); setShowPrescription(false);}}>Visite en cours</button>
          <button className={activeTab === 'historique' ? 'active' : ''} onClick={() => setActiveTab('historique')}>Dossier Médical</button>
        </nav>

        <div className="modal-body">
          {activeTab === 'visite' && (
            <>
              {!showPrescription ? (
                <div className="visit-grid" style={{width: '100%', margin: '0 auto'}}>
                  <section className="visit-box">
                    <h3 className="section-title">Paramètres Vitaux</h3>
                    <div className="input-group"><label>Poids (kg)</label><input type="number" value={poids} onChange={e => setPoids(e.target.value)} placeholder="70.0" /></div>
                    <div className="input-group"><label>Température (°C)</label><input type="number" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="37.0" /></div>
                    <div className="input-group"><label>Tension Max/Min</label><div className="tension-row"><input value={tensionMax} onChange={e => setTensionMax(e.target.value)} placeholder="Max" /><input value={tensionMin} onChange={e => setTensionMin(e.target.value)} placeholder="Min" /></div></div>
                  </section>

                  <section className="visit-box">
                    <h3 className="section-title">Diagnostic & Examens</h3>
                    <div className="input-group"><label>Type de Visite</label><select value={typeVisite} onChange={e => setTypeVisite(e.target.value)}><option value="consultation">Consultation</option><option value="urgence">Urgence</option><option value="suivi">Suivi</option></select></div>
                    <div className="input-group"><label>Symptômes</label><input value={symptomes} onChange={e => setSymptomes(e.target.value)} placeholder="Symptômes..." /></div>
                    <div className="input-group"><label>Observations</label><textarea rows="2" value={observations} onChange={e => setObservations(e.target.value)}></textarea></div>
                    <div className="input-group"><label>Tests (Analyses/Radio)</label><input value={tests} onChange={e => setTests(e.target.value)} placeholder="NFS, Radio..." /></div>
                  </section>

                  <section className="visit-box full-width">
                    <h3 className="section-title">Actes Réalisés</h3>
                    <div className="input-group" style={{marginBottom: '10px'}}>
                      <label>Catalogue</label>
                      <select value={selectedCatalogue} onChange={e => setSelectedCatalogue(e.target.value)}>
                        {catalogues.map(cat => <option key={cat.id_catalogue} value={cat.id_catalogue}>{cat.nom_catalogue}</option>)}
                      </select>
                    </div>
                    <div className="act-selection-area">
                      <select className="catalog-dropdown" value={currentActeId} onChange={(e) => setCurrentActeId(e.target.value)}>
                        <option value="">Sélectionner un acte...</option>
                        {catalogueActes.map(acte => <option key={acte.id_acte} value={acte.id_acte}>{acte.nom_acte}</option>)}
                      </select>
                      <button className="btn-confirm-act" onClick={() => { if (currentActeId && !selectedActes.includes(currentActeId)) { setSelectedActes([...selectedActes, currentActeId]); setCurrentActeId(""); } }}>Ajouter</button>
                    </div>
                    <div className="selected-acts-container">
                      {selectedActes.map((id, i) => <span key={i} className="acte-tag">{catalogueActes.find(a => a.id_acte == id)?.nom_acte || id}</span>)}
                    </div>
                  </section>

                  <div className="full-width centered-btn-area">
                    <button className="btn-prescription" onClick={() => setShowPrescription(true)}>Rédiger l'Ordonnance</button>
                  </div>
                </div>
              ) : (
                <PrescriptionView 
                  onBack={() => setShowPrescription(false)} 
                  items={prescriptionItems} 
                  setItems={setPrescriptionItems} 
                  commentaireOrdonnance={commentaireOrdonnance} 
                  setCommentaireOrdonnance={setCommentaireOrdonnance} 
                />
              )}
            </>
          )}

          {activeTab === 'historique' && (
            <div className="dossier-view-container">
              {dossierActif ? (
                <>
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
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p>Aucun dossier médical trouvé pour ce patient.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSaveVisite}>Enregistrer la Visite</button>
        </footer>
      </div>
    </div>
  );
};

export default VisiteMedicaleModal;