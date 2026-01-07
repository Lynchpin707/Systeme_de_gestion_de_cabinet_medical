import React, { useState } from 'react';
import './FacturesManager.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FacturesManager = () => {
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [showJournal, setShowJournal] = useState(false);

  // Données de démonstration
  const factures = [
    {
      id_facture: 1,
      numero: 'F-2024-001',
      date: '2024-12-28',
      patient: 'Alami Ahmed',
      medecin: 'Dr. Benali',
      actes: ['Consultation générale', 'ECG'],
      montant_total: 800,
      montant_paye: 800,
      statut: 'payee',
      mode_paiement: 'Carte bancaire',
      date_paiement: '2024-12-28'
    },
    {
      id_facture: 2,
      numero: 'F-2024-002',
      date: '2024-12-27',
      patient: 'Benali Sara',
      medecin: 'Dr. Chakir',
      actes: ['Consultation générale'],
      montant_total: 300,
      montant_paye: 150,
      statut: 'partielle',
      mode_paiement: 'Espèces',
      date_paiement: '2024-12-27'
    },
    {
      id_facture: 3,
      numero: 'F-2024-003',
      date: '2024-12-26',
      patient: 'Chakir Mohamed',
      medecin: 'Dr. Alami',
      actes: ['Consultation générale', 'Échographie'],
      montant_total: 1100,
      montant_paye: 0,
      statut: 'impayee',
      mode_paiement: null,
      date_paiement: null
    },
    {
      id_facture: 4,
      numero: 'F-2024-004',
      date: '2024-12-25',
      patient: 'Driouech Fatima',
      medecin: 'Dr. Benali',
      actes: ['Consultation générale', 'ECG', 'Prise de sang'],
      montant_total: 1200,
      montant_paye: 1200,
      statut: 'payee',
      mode_paiement: 'Chèque',
      date_paiement: '2024-12-25'
    },
    {
      id_facture: 5,
      numero: 'F-2024-005',
      date: '2024-12-24',
      patient: 'El Amrani Youssef',
      medecin: 'Dr. Chakir',
      actes: ['Consultation générale'],
      montant_total: 300,
      montant_paye: 300,
      statut: 'payee',
      mode_paiement: 'Espèces',
      date_paiement: '2024-12-24'
    }
  ];

  const facturesFiltrees = factures.filter(f => {
    if (filtreStatut === 'tous') return true;
    return f.statut === filtreStatut;
  });

  const facturesPayees = factures.filter(f => f.statut === 'payee');

  // Statistiques
  const totalFactures = factures.reduce((sum, f) => sum + f.montant_total, 0);
  const totalPaye = factures.reduce((sum, f) => sum + f.montant_paye, 0);
  const totalImpaye = totalFactures - totalPaye;

  const getStatusBadge = (statut) => {
    const badges = {
      payee: { text: 'Payée', class: 'status-payee' },
      impayee: { text: 'Impayée', class: 'status-impayee' },
      partielle: { text: 'Partielle', class: 'status-partielle' }
    };
    return badges[statut] || badges.impayee;
  };

  const exportJournalPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // === HEADER DESIGN ===
    doc.setFillColor(62, 174, 177);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo/Icon
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 22, 8, 'F');
    doc.setFillColor(62, 174, 177);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('+', 25, 24.5, { align: 'center' });
    
    // Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont(undefined, 'bold');
    doc.text('JOURNAL DES VENTES', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Cabinet Médical', pageWidth / 2, 28, { align: 'center' });
    
    const dateStr = new Date().toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    doc.setFontSize(9);
    doc.text(`Édité le ${dateStr}`, pageWidth / 2, 35, { align: 'center' });
    
    // === CARDS STATISTIQUES (CORRIGÉES) ===
    const cardY = 55;
    const cardWidth = 55;
    const cardHeight = 28;
    const gap = 7;
    
    // Card 1 - Total ventes
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'S');
    
    // Icône
    doc.setFillColor(16, 185, 129);
    doc.circle(25, cardY + 10, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('$', 25, cardY + 11.5, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Total des ventes', 42.5, cardY + 10, { align: 'center' });
    
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${totalPaye.toLocaleString()} MAD`, 42.5, cardY + 22, { align: 'center' });
    
    // Card 2 - Nombre factures
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(15 + cardWidth + gap, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(15 + cardWidth + gap, cardY, cardWidth, cardHeight, 3, 3, 'S');
    
    // Icône
    doc.setFillColor(59, 130, 246);
    doc.circle(25 + cardWidth + gap, cardY + 10, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('#', 25 + cardWidth + gap, cardY + 11.5, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Factures payées', 42.5 + cardWidth + gap, cardY + 10, { align: 'center' });
    
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${facturesPayees.length}`, 42.5 + cardWidth + gap, cardY + 22, { align: 'center' });
    
    // Card 3 - Moyenne
    const moyenne = facturesPayees.length > 0 ? Math.round(totalPaye / facturesPayees.length) : 0;
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(15 + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(15 + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 3, 3, 'S');
    
    // Icône
    doc.setFillColor(245, 158, 11);
    doc.circle(25 + (cardWidth + gap) * 2, cardY + 10, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('~', 25 + (cardWidth + gap) * 2, cardY + 11.5, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Montant moyen', 42.5 + (cardWidth + gap) * 2, cardY + 10, { align: 'center' });
    
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${moyenne.toLocaleString()} MAD`, 42.5 + (cardWidth + gap) * 2, cardY + 22, { align: 'center' });
    
    // === TABLEAU DES FACTURES ===
    const tableData = facturesPayees.map(f => [
      f.numero,
      new Date(f.date).toLocaleDateString('fr-FR'),
      f.patient,
      f.medecin,
      f.actes.join(', '),
      `${f.montant_total} MAD`,
      f.mode_paiement
    ]);
    
    autoTable(doc, {
      startY: 95,
      head: [['N° Facture', 'Date', 'Patient', 'Médecin', 'Actes', 'Montant', 'Paiement']],
      body: tableData,
      foot: [['', '', '', '', '', `${totalPaye.toLocaleString()} MAD`, 'TOTAL']],
      theme: 'striped',
      headStyles: { 
        fillColor: [62, 174, 177],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 5
      },
      footStyles: { 
        fillColor: [62, 174, 177],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'right'
      },
      styles: { 
        fontSize: 8.5,
        cellPadding: 4,
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 22 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 42, fontSize: 7.5 },
        5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 23, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 15, right: 15 }
    });
    
    // === FOOTER ===
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(15, finalY, pageWidth - 15, finalY);
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text('Cabinet Médical - Fès, Maroc', pageWidth / 2, finalY + 8, { align: 'center' });
    doc.text('Tél: +212 6XX XX XX XX | Email: contact@cabinet-medical.ma', pageWidth / 2, finalY + 13, { align: 'center' });
    
    // Watermark
    doc.setFontSize(40);
    doc.setTextColor(240, 240, 240);
    doc.setFont(undefined, 'bold');
    doc.text('CONFIDENTIEL', pageWidth / 2, pageHeight / 2, { 
      align: 'center', 
      angle: 45 
    });
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Page 1`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    const filename = `Journal_Ventes_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const exportFacturePDF = (facture) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header
    doc.setFillColor(62, 174, 177);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 25, 10, 'F');
    doc.setFillColor(62, 174, 177);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('+', 25, 28, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FACTURE', 45, 25);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Cabinet Médical', 45, 33);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(facture.numero, pageWidth - 20, 25, { align: 'right' });
    
    // Informations
    const infoY = 65;
    
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, infoY, 85, 35, 3, 3, 'F');
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('CABINET MÉDICAL', 20, infoY + 8);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('Adresse: Fès, Maroc', 20, infoY + 15);
    doc.text('Tél: +212 6XX XX XX XX', 20, infoY + 20);
    doc.text('Email: contact@cabinet.ma', 20, infoY + 25);
    
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(pageWidth - 100, infoY, 85, 35, 3, 3, 'F');
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('PATIENT', pageWidth - 95, infoY + 8);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(`Nom: ${facture.patient}`, pageWidth - 95, infoY + 15);
    doc.text(`Date: ${new Date(facture.date).toLocaleDateString('fr-FR')}`, pageWidth - 95, infoY + 20);
    doc.text(`Médecin: ${facture.medecin}`, pageWidth - 95, infoY + 25);
    
    // Tableau actes
    const actesData = facture.actes.map((acte, i) => [
      `${i + 1}`,
      acte,
      '-',
      '-'
    ]);
    
    autoTable(doc, {
      startY: 115,
      head: [['#', 'Acte médical', 'Qté', 'Montant']],
      body: actesData,
      theme: 'striped',
      headStyles: { 
        fillColor: [62, 174, 177],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 110 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Totaux
    const totalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFillColor(62, 174, 177);
    doc.roundedRect(pageWidth - 85, totalY, 70, 35, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Montant total:', pageWidth - 80, totalY + 12);
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(`${facture.montant_total} MAD`, pageWidth - 80, totalY + 25);
    
    const reste = facture.montant_total - facture.montant_paye;
    if (reste > 0) {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(15, totalY, 70, 20, 3, 3, 'F');
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Reste: ${reste} MAD`, 20, totalY + 13);
    }
    
    // Statut
    const badge = getStatusBadge(facture.statut);
    const statusY = totalY + 45;
    
    doc.setFillColor(badge.class === 'status-payee' ? 220 : 254, 
                     badge.class === 'status-payee' ? 252 : 226, 
                     badge.class === 'status-payee' ? 231 : 226);
    doc.roundedRect(pageWidth / 2 - 25, statusY, 50, 12, 3, 3, 'F');
    
    doc.setTextColor(badge.class === 'status-payee' ? 22 : 220, 
                     badge.class === 'status-payee' ? 163 : 38, 
                     badge.class === 'status-payee' ? 74 : 38);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(badge.text, pageWidth / 2, statusY + 8, { align: 'center' });
    
    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Merci de votre confiance', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Cabinet Médical - contact@cabinet-medical.ma', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    doc.save(`${facture.numero}.pdf`);
  };

  if (showJournal) {
    return (
      <div className="factures-manager">
        <div className="factures-header">
          <div>
            <h2>📖 Journal des Ventes</h2>
            <p>Toutes les factures payées</p>
          </div>
          <div className="header-actions-group">
            <button className="btn-export-pdf" onClick={exportJournalPDF}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exporter en PDF
            </button>
            <button className="btn-back" onClick={() => setShowJournal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour
            </button>
          </div>
        </div>

        <div className="journal-summary">
          <div className="summary-card">
            <span className="summary-label">Total des ventes</span>
            <span className="summary-value">{totalPaye.toLocaleString()} MAD</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Nombre de factures</span>
            <span className="summary-value">{facturesPayees.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Montant moyen</span>
            <span className="summary-value">
              {facturesPayees.length > 0 ? Math.round(totalPaye / facturesPayees.length) : 0} MAD
            </span>
          </div>
        </div>

        <div className="journal-table">
          <table>
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Actes</th>
                <th>Montant</th>
                <th>Mode de paiement</th>
              </tr>
            </thead>
            <tbody>
              {facturesPayees.map(facture => (
                <tr key={facture.id_facture}>
                  <td><strong>{facture.numero}</strong></td>
                  <td>{new Date(facture.date).toLocaleDateString('fr-FR')}</td>
                  <td>{facture.patient}</td>
                  <td>{facture.medecin}</td>
                  <td>
                    <div className="actes-cell">
                      {facture.actes.map((acte, i) => (
                        <span key={i} className="acte-mini">{acte}</span>
                      ))}
                    </div>
                  </td>
                  <td className="montant-cell">{facture.montant_total} MAD</td>
                  <td>
                    <span className="payment-method">{facture.mode_paiement}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="5"><strong>TOTAL</strong></td>
                <td className="montant-cell"><strong>{totalPaye.toLocaleString()} MAD</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="factures-manager">
      <div className="factures-header">
        <div>
          <h2>💰 Gestion des Factures</h2>
          <p>{factures.length} factures enregistrées</p>
        </div>
        <button className="btn-journal" onClick={() => setShowJournal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Voir le Journal des Ventes
        </button>
      </div>

      <div className="factures-stats">
        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-label">Total encaissé</span>
            <span className="stat-value">{totalPaye.toLocaleString()} MAD</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-label">Impayés</span>
            <span className="stat-value">{totalImpaye.toLocaleString()} MAD</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(62, 174, 177, 0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3EAEB1" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-label">Total facturé</span>
            <span className="stat-value">{totalFactures.toLocaleString()} MAD</span>
          </div>
        </div>
      </div>

      <div className="factures-filters">
        <button
          className={`filter-btn ${filtreStatut === 'tous' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('tous')}
        >
          Toutes ({factures.length})
        </button>
        <button
          className={`filter-btn ${filtreStatut === 'payee' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('payee')}
        >
          Payées ({factures.filter(f => f.statut === 'payee').length})
        </button>
        <button
          className={`filter-btn ${filtreStatut === 'partielle' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('partielle')}
        >
          Partielles ({factures.filter(f => f.statut === 'partielle').length})
        </button>
        <button
          className={`filter-btn ${filtreStatut === 'impayee' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('impayee')}
        >
          Impayées ({factures.filter(f => f.statut === 'impayee').length})
        </button>
      </div>

      <div className="factures-grid">
        {facturesFiltrees.map(facture => {
          const badge = getStatusBadge(facture.statut);
          return (
            <div key={facture.id_facture} className="facture-card">
              <div className="facture-header-card">
                <div>
                  <h3>{facture.numero}</h3>
                  <span className="facture-date">
                    {new Date(facture.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <span className={`status-badge ${badge.class}`}>{badge.text}</span>
              </div>

              <div className="facture-body">
                <div className="facture-info-row">
                  <span className="info-label">Patient:</span>
                  <span className="info-value">{facture.patient}</span>
                </div>
                <div className="facture-info-row">
                  <span className="info-label">Médecin:</span>
                  <span className="info-value">{facture.medecin}</span>
                </div>
                <div className="facture-info-row">
                  <span className="info-label">Actes:</span>
                  <div className="actes-list">
                    {facture.actes.map((acte, i) => (
                      <span key={i} className="acte-badge">{acte}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="facture-footer">
                <div className="montant-info">
                  <span className="montant-label">Montant total:</span>
                  <span className="montant-total">{facture.montant_total} MAD</span>
                </div>
                {facture.montant_paye < facture.montant_total && (
                  <div className="montant-info">
                    <span className="montant-label">Payé:</span>
                    <span className="montant-paye">{facture.montant_paye} MAD</span>
                  </div>
                )}
              </div>

              <div className="facture-actions">
                <button className="action-btn primary" onClick={() => alert('Voir détails - À implémenter')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
                  </svg>
                  Voir détails
                </button>
                <button className="action-btn secondary" onClick={() => exportFacturePDF(facture)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacturesManager;