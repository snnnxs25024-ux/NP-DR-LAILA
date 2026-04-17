import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import domtoimage from 'dom-to-image-more';
import { Athlete, AssessmentEntry } from '../types';

export const generateAssessmentPDF = (
  athlete: Athlete, 
  assessments: AssessmentEntry[], 
  title: string,
  diffUpdate?: any,
  diffGlobal?: any
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ASESMEN', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 105, 22, { align: 'center' });
  
  // Athlete Info Grid (Header Profile)
  doc.setDrawColor(241, 245, 249);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 30, 182, 35, 3, 3, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'bold');
  
  // Athlete Info Block (Centered, styled)
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 30, 182, 35, 3, 3, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59); // slate-900
  doc.setFont('helvetica', 'bold');
  
  // Column 1 (Left - Profil)
  doc.text('Nama :', 20, 38);
  doc.text('Kategori :', 20, 44);
  doc.text('TB :', 20, 50);

  doc.setFont('helvetica', 'normal');
  doc.text(`${athlete.name}`, 40, 38);
  doc.text(`${athlete.category_name || '-'}`, 40, 44);
  doc.text(`${athlete.height} CM`, 40, 50);

  // Column 2 (Middle - Data Saat Ini)
  doc.setFont('helvetica', 'bold');
  doc.text('BB :', 80, 38);
  doc.text('Body Fat :', 80, 44);

  doc.setFont('helvetica', 'normal');
  doc.text(`${athlete.weight} KG`, 105, 38);
  doc.text(`${athlete.bf_caliper || 0} %`, 105, 44);

  // Column 3 (Right - Target)
  doc.setFont('helvetica', 'bold');
  doc.text('Target BB :', 135, 38);
  doc.text('Target BF :', 135, 44);

  doc.setFont('helvetica', 'normal');
  doc.text(`${athlete.target_weight} KG`, 165, 38);
  doc.text(`${athlete.target_body_fat} %`, 165, 44);
  
  // Table Spacer
  const tableSpace = 70;
  
  // Table
  const tableData = assessments.map(entry => [
    entry.date,
    `${entry.bf_in_body}%`,
    entry.bicep,
    entry.tricep,
    entry.subscapula,
    entry.abdominal,
    entry.total,
    `${entry.bf_caliper}%`,
    `${entry.weight} kg`,
    `${entry.lbm} kg`,
    `${entry.fm} kg`
  ]);

  // Add Summary Rows if provided
  if (diffUpdate) {
    tableData.push([
      { content: 'TOTAL TERUPDATE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: `${diffUpdate.bfInBody.value}%`, styles: { fontStyle: 'bold', textColor: diffUpdate.bfInBody.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      '-', '-', '-', '-',
      { content: diffUpdate.total.value, styles: { fontStyle: 'bold', textColor: diffUpdate.total.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      { content: `${diffUpdate.bfCaliper.value}%`, styles: { fontStyle: 'bold', textColor: diffUpdate.bfCaliper.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      { content: diffUpdate.weight.value, styles: { fontStyle: 'bold', textColor: diffUpdate.weight.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      { content: diffUpdate.lbm.value, styles: { fontStyle: 'bold', textColor: diffUpdate.lbm.isPositive ? [5, 150, 105] : [225, 29, 72] } },
      { content: diffUpdate.fm.value, styles: { fontStyle: 'bold', textColor: diffUpdate.fm.isNegative ? [5, 150, 105] : [225, 29, 72] } }
    ] as any);
  }

  if (diffGlobal) {
    tableData.push([
      { content: 'TOTAL GLOBAL', styles: { fontStyle: 'bold', fillColor: [226, 232, 240] } },
      { content: `${diffGlobal.bfInBody.value}%`, styles: { fontStyle: 'bold', textColor: diffGlobal.bfInBody.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      '-', '-', '-', '-',
      { content: diffGlobal.total.value, styles: { fontStyle: 'bold', textColor: diffGlobal.total.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      { content: `${diffGlobal.bfCaliper.value}%`, styles: { fontStyle: 'bold', textColor: diffGlobal.bfCaliper.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      { content: diffGlobal.weight.value, styles: { fontStyle: 'bold', textColor: diffGlobal.weight.isNegative ? [5, 150, 105] : [225, 29, 72] } },
      { content: diffGlobal.lbm.value, styles: { fontStyle: 'bold', textColor: diffGlobal.lbm.isPositive ? [5, 150, 105] : [225, 29, 72] } },
      { content: diffGlobal.fm.value, styles: { fontStyle: 'bold', textColor: diffGlobal.fm.isNegative ? [5, 150, 105] : [225, 29, 72] } }
    ] as any);
  }
  
  autoTable(doc, {
    startY: tableSpace,
    head: [['TANGGAL', 'BF% INB', 'B', 'T', 'SC', 'A', 'TOT', 'BF% CAL', 'BB (KG)', 'LBM', 'FM']],
    body: tableData,
    headStyles: { 
      fillColor: [51, 65, 85], // slate-700
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    margin: { top: tableSpace },
    theme: 'grid',
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Laporan ini dihasilkan secara otomatis oleh Sistem Manajemen Atlet PBSI. Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 285);
    doc.text(`Halaman ${i} dari ${pageCount}`, 196, 285, { align: 'right' });
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
