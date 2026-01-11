import React, { useState, useEffect } from 'react';
import PrescriptionView from './PrescriptionView';
import './VisiteMedicaleModal.css'; // Reuse the CSS

const PrescriptionModal = ({ isOpen, onClose, id_visite }) => {
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [commentaireOrdonnance, setCommentaireOrdonnance] = useState('');

  useEffect(() => {
    if (isOpen && id_visite) {
      loadExistingOrdonnance();
    }
  }, [isOpen, id_visite]);

  const loadExistingOrdonnance = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/ordonnances/visite/${id_visite}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const ordonnance = await res.json();
        if (ordonnance) {
          setCommentaireOrdonnance(ordonnance.instructions || '');
          // Load items
          const [medRes, analyseRes] = await Promise.all([
            fetch(`http://127.0.0.1:8000/ordonnances/${ordonnance.id_ordonnance}/medicaments`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`http://127.0.0.1:8000/ordonnances/${ordonnance.id_ordonnance}/analyses`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          const meds = medRes.ok ? await medRes.json() : [];
          const analyses = analyseRes.ok ? await analyseRes.json() : [];
          const items = [
            ...meds.map(m => ({ type: 'med', id_medicament: m.id_medicament, nom: m.nom_medicament, posologie: m.posologie, duree: m.duree })),
            ...analyses.map(a => ({ type: 'analyse', id_analyse: a.id_analyse, nom: a.nom_analyse, description: a.description }))
          ];
          setPrescriptionItems(items);
        }
      }
    } catch (err) {
      console.error("Erreur chargement ordonnance:", err);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      // First, create or update ordonnance
      let ordonnanceId;
      const existingRes = await fetch(`http://127.0.0.1:8000/ordonnances/visite/${id_visite}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (existingRes.ok) {
        const existing = await existingRes.json();
        ordonnanceId = existing.id_ordonnance;
        // Update instructions
        await fetch(`http://127.0.0.1:8000/ordonnances/${ordonnanceId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ instructions: commentaireOrdonnance })
        });
      } else {
        // Create new
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
          const data = await res.json();
          ordonnanceId = data.id_ordonnance;
        } else {
          alert("Erreur création ordonnance");
          return;
        }
      }

      // Save items - for simplicity, delete all and re-add
      // But since no delete route, perhaps just add new ones, but to avoid duplicates, assume user manages

      for (const item of prescriptionItems) {
        if (item.type === 'med') {
          await fetch(`http://127.0.0.1:8000/ordonnances/${ordonnanceId}/medicaments`, {
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
          await fetch(`http://127.0.0.1:8000/ordonnances/${ordonnanceId}/analyses`, {
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
      }
      alert("Ordonnance sauvegardée");
      onClose();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      alert("Erreur réseau");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <h2>Prescription Médicale</h2>
        <PrescriptionView
          onBack={onClose}
          items={prescriptionItems}
          setItems={setPrescriptionItems}
          commentaireOrdonnance={commentaireOrdonnance}
          setCommentaireOrdonnance={setCommentaireOrdonnance}
        />
        <div className="modal-actions">
          <button onClick={handleSave}>Sauvegarder</button>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;