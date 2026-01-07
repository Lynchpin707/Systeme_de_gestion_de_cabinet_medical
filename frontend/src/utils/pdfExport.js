import React, { useState } from 'react';
import './FacturesManager.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export d'une facture individuelle
export const exportFacturePDF = (facture) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(62, 174, 177);
  doc.text('CABINET MÉDICAL', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Facture', 105, 30, { align: 'center' });
  
  // Informations facture
  doc.setFontSize(10);
  doc.text(`N° Facture: ${facture.numero}`, 20, 50);
  doc.text(`Date: ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 20, 57);
  doc.text(`Patient: ${facture.patient}`, 20, 64);
  doc.text(`Médecin: ${facture.medecin || 'N/A'}`, 20, 71);
  
  // Ligne de séparation
  doc.setDrawColor(62, 174, 177);
  doc.line(20, 80, 190, 80);
  
  // Tableau des actes
  if (facture.actes && facture.actes.length > 0) {
    doc.autoTable({
      startY: 90,
      head: [['Acte médical', 'Tarif (MAD)']],
      body: facture.actes.map(acte => [acte, '---']),
      theme: 'grid',
      headStyles: { fillColor: [62, 174, 177] },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Montants
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 120;
  
  doc.setFontSize(11);
  doc.text(`Montant total:`, 20, finalY);
  doc.text(`${facture.montant_total} MAD`, 190, finalY, { align: 'right' });
  
  doc.text(`Montant payé:`, 20, finalY + 7);
  doc.setTextColor(16, 185, 129);
  doc.text(`${facture.montant_paye} MAD`, 190, finalY + 7, { align: 'right' });
  
  const reste = facture.montant_total - facture.montant_paye;
  if (reste > 0) {
    doc.setTextColor(239, 68, 68);
    doc.text(`Reste à payer:`, 20, finalY + 14);
    doc.text(`${reste} MAD`, 190, finalY + 14, { align: 'right' });
  }
  
  // Statut
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const statut = facture.statut === 'payee' ? '✓ Payée' : 
                 facture.statut === 'partielle' ? '⏳ Paiement partiel' : '✗ Impayée';
  doc.text(`Statut: ${statut}`, 105, finalY + 25, { align: 'center' });
  
  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Cabinet Médical - Fès, Maroc', 105, 280, { align: 'center' });
  doc.text('Tél: +212 6XX XX XX XX - Email: contact@cabinet.ma', 105, 285, { align: 'center' });
  
  // Télécharger
  doc.save(`${facture.numero}.pdf`);
};

// Export du journal des ventes
export const exportJournalPDF = (factures) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(62, 174, 177);
  doc.text('JOURNAL DES VENTES', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Édité le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
  
  // Statistiques
  const totalVentes = factures.reduce((sum, f) => sum + f.montant_paye, 0);
  const nombreFactures = factures.length;
  const moyenneVente = nombreFactures > 0 ? Math.round(totalVentes / nombreFactures) : 0;
  
  doc.setFillColor(62, 174, 177);
  doc.rect(20, 40, 170, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Total des ventes: ${totalVentes.toLocaleString()} MAD`, 30, 50);
  doc.text(`Nombre de factures: ${nombreFactures}`, 30, 57);
  doc.text(`Montant moyen: ${moyenneVente.toLocaleString()} MAD`, 30, 64);
  
  // Tableau des factures
  const tableData = factures.map(f => [
    f.numero,
    new Date(f.date).toLocaleDateString('fr-FR'),
    f.patient,
    f.medecin || 'N/A',
    `${f.montant_total} MAD`,
    `${f.montant_paye} MAD`,
    f.mode_paiement || 'N/A'
  ]);
  
  doc.autoTable({
    startY: 80,
    head: [['N° Facture', 'Date', 'Patient', 'Médecin', 'Total', 'Payé', 'Mode']],
    body: tableData,
    foot: [['TOTAL', '', '', '', '', `${totalVentes.toLocaleString()} MAD`, '']],
    theme: 'grid',
    headStyles: { fillColor: [62, 174, 177] },
    footStyles: { fillColor: [62, 174, 177], fontStyle: 'bold' },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 9 }
  });
  
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Cabinet Médical - Fès, Maroc', 105, finalY + 10, { align: 'center' });
  doc.text('Document généré automatiquement', 105, finalY + 15, { align: 'center' });
  
 
  const filename = `Journal_Ventes_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};