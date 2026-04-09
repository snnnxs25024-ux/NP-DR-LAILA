import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import domtoimage from 'dom-to-image-more';
import { Athlete, AssessmentEntry } from '../data/mockData';

export const generateAssessmentPDF = (athlete: Athlete, assessments: AssessmentEntry[], title: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(225, 29, 72); // brand-red
  doc.text('LAPORAN ASESMEN FISIK', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(title, 105, 28, { align: 'center' });
  
  // Athlete Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Nama: ${athlete.name}`, 20, 45);
  doc.text(`Divisi: ${athlete.division}`, 20, 52);
  doc.text(`Sektor: ${athlete.sector}`, 20, 59);
  doc.text(`Tinggi: ${athlete.height} cm`, 140, 45);
  doc.text(`Target Berat: ${athlete.targetWeight} kg`, 140, 52);
  
  // Table
  const tableData = assessments.map(entry => [
    entry.date,
    `${entry.weight} kg`,
    `${entry.bfCaliper}%`,
    `${entry.bfInBody}%`,
    `${entry.lbm} kg`,
    `${entry.fm} kg`
  ]);
  
  autoTable(doc, {
    startY: 70,
    head: [['Tanggal', 'Berat', 'BF% (Caliper)', 'BF% (InBody)', 'LBM', 'FM']],
    body: tableData,
    headStyles: { fillColor: [225, 29, 72] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 20, 285);
    doc.text(`Halaman ${i} dari ${pageCount}`, 190, 285, { align: 'right' });
  }
  
  return doc;
};

export const shareToWhatsApp = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const captureElementAsJPG = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }
  
  try {
    // Wait a bit for any layout shifts or style applications
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use dom-to-image-more for better compatibility with modern CSS
    const dataUrl = await domtoimage.toJpeg(element, {
      quality: 0.95,
      bgcolor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        transform: 'none',
        margin: '0',
        padding: '20px',
        width: `${element.scrollWidth}px`,
        height: `${element.scrollHeight}px`
      }
    });
    
    const link = document.createElement('a');
    link.style.display = 'none';
    link.download = `${fileName}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('Error capturing JPG:', error);
    // Fallback alert for the user
    alert('Gagal mengunduh gambar. Silakan coba gunakan format PDF.');
  }
};
