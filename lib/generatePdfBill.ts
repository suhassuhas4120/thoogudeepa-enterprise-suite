export interface PdfBillItem {
  name: string;
  quantity: number;
  price: number;
  unitPrice?: number;
}

export interface PdfBillData {
  venueName?: string;
  invoiceNumber: string;
  tableNumber: string;
  seatNumber?: number;
  captainName?: string;
  guestName?: string;
  formattedDate: string;
  formattedTime: string;
  items: PdfBillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  tipAmount?: number;
  discount?: number;
  paidAmount: number;
  paymentMethod?: string;
  bankUtr?: string;
}

function escapePdf(str: string): string {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Builds standard compliant PDF 1.4 document bytes for the digital tax invoice.
 */
export function buildPdfBillString(data: PdfBillData): string {
  const content: string[] = [];
  const dark = '0.1 0.1 0.1 rg 0.1 0.1 0.1 RG';
  const brand = '0.55 0.25 0.12 rg 0.55 0.25 0.12 RG';
  const green = '0.05 0.55 0.25 rg 0.05 0.55 0.25 RG';
  const gray = '0.4 0.4 0.4 rg 0.8 0.8 0.8 RG';

  const itemCount = Math.max(1, (data.items || []).length);
  const pageHeight = Math.max(820, 520 + itemCount * 22);

  // Brand Header Banner
  content.push(brand);
  content.push(`30 ${pageHeight - 60} 340 45 re f`);

  // Brand Header Text
  content.push('1 1 1 rg');
  content.push(`BT /F2 13 Tf 50 ${pageHeight - 38} Td (${escapePdf(data.venueName || 'THOOGUDEEPA DONNE BIRYANI MANE')}) Tj ET`);
  content.push(`BT /F1 8.5 Tf 95 ${pageHeight - 52} Td (Authentic Military Restaurant - Bengaluru) Tj ET`);

  // Invoice Banner
  content.push(dark);
  content.push(`BT /F2 10 Tf 145 ${pageHeight - 82} Td (TAX INVOICE #${escapePdf(data.invoiceNumber)}) Tj ET`);

  // Metadata Block
  content.push(`BT /F1 8.5 Tf 35 ${pageHeight - 105} Td (Date: ${escapePdf(data.formattedDate)}  ${escapePdf(data.formattedTime)}) Tj ET`);
  content.push(`BT /F1 8.5 Tf 240 ${pageHeight - 105} Td (Table: ${escapePdf(data.tableNumber)} Chair C-${String(data.seatNumber || 1).padStart(2, '0')}) Tj ET`);
  content.push(`BT /F1 8.5 Tf 35 ${pageHeight - 120} Td (Guest: ${escapePdf(data.guestName || 'Valued Diner')}) Tj ET`);
  content.push(`BT /F1 8.5 Tf 240 ${pageHeight - 120} Td (Captain: ${escapePdf(data.captainName || 'Floor Captain')}) Tj ET`);

  // Divider Line
  content.push(`0.5 w 0.8 0.8 0.8 RG 35 ${pageHeight - 132} m 365 ${pageHeight - 132} l S`);

  // Table Column Headers
  content.push(dark);
  content.push(`BT /F2 8.5 Tf 35 ${pageHeight - 145} Td (ITEM DESCRIPTION) Tj ET`);
  content.push(`BT /F2 8.5 Tf 220 ${pageHeight - 145} Td (QTY) Tj ET`);
  content.push(`BT /F2 8.5 Tf 270 ${pageHeight - 145} Td (RATE) Tj ET`);
  content.push(`BT /F2 8.5 Tf 330 ${pageHeight - 145} Td (AMOUNT) Tj ET`);
  content.push(`0.5 w 0.8 0.8 0.8 RG 35 ${pageHeight - 152} m 365 ${pageHeight - 152} l S`);

  // Render Table Line Items
  let y = pageHeight - 168;
  (data.items || []).forEach((it) => {
    content.push(dark);
    content.push(`BT /F1 8.5 Tf 35 ${y} Td (${escapePdf(it.name)}) Tj ET`);
    content.push(`BT /F2 8.5 Tf 228 ${y} Td (${it.quantity}) Tj ET`);
    const unitRate = Math.round(it.price / it.quantity);
    content.push(`BT /F1 8.5 Tf 270 ${y} Td (Rs.${unitRate}) Tj ET`);
    content.push(`BT /F2 8.5 Tf 330 ${y} Td (Rs.${it.price}) Tj ET`);
    y -= 18;
  });

  // Table Footer Divider
  content.push(`0.5 w 0.8 0.8 0.8 RG 35 ${y + 5} m 365 ${y + 5} l S`);
  y -= 10;

  // Financial Subtotals & Tax Breakdown
  content.push(`BT /F1 8.5 Tf 200 ${y} Td (Subtotal:) Tj ET`);
  content.push(`BT /F2 8.5 Tf 330 ${y} Td (Rs.${data.subtotal}) Tj ET`);
  y -= 14;
  content.push(`BT /F1 8.5 Tf 200 ${y} Td (CGST (2.5%):) Tj ET`);
  content.push(`BT /F1 8.5 Tf 330 ${y} Td (Rs.${data.cgst}) Tj ET`);
  y -= 14;
  content.push(`BT /F1 8.5 Tf 200 ${y} Td (SGST (2.5%):) Tj ET`);
  content.push(`BT /F1 8.5 Tf 330 ${y} Td (Rs.${data.sgst}) Tj ET`);
  y -= 14;

  if (data.tipAmount && data.tipAmount > 0) {
    content.push(brand);
    content.push(`BT /F2 8.5 Tf 200 ${y} Td (Staff Tip:) Tj ET`);
    content.push(`BT /F2 8.5 Tf 330 ${y} Td (+Rs.${data.tipAmount}) Tj ET`);
    y -= 14;
  }

  if (data.discount && data.discount > 0) {
    content.push(green);
    content.push(`BT /F2 8.5 Tf 200 ${y} Td (Discount:) Tj ET`);
    content.push(`BT /F2 8.5 Tf 330 ${y} Td (-Rs.${data.discount}) Tj ET`);
    y -= 14;
  }

  // Grand Total Box
  content.push(`0.95 0.95 0.95 rg 195 ${y - 5} 170 20 re f`);
  content.push(dark);
  content.push(`BT /F2 10 Tf 200 ${y} Td (TOTAL PAID:) Tj ET`);
  content.push(`BT /F2 11 Tf 325 ${y} Td (Rs.${data.paidAmount}) Tj ET`);
  y -= 25;

  // Payment Settlement Verification Badge
  content.push(`0.9 0.97 0.92 rg 35 ${y - 5} 330 22 re f`);
  content.push(green);
  content.push(
    `BT /F2 8.5 Tf 45 ${y} Td (VERIFIED PAYMENT: ${escapePdf(data.paymentMethod || 'UPI')} | Ref: ${escapePdf(data.bankUtr || 'PAID')}) Tj ET`
  );
  y -= 25;

  // Statutory Footer
  content.push(gray);
  content.push(`BT /F1 7.5 Tf 75 ${y} Td (GSTIN: 29AABCT1332L1Z9 | FSSAI Lic: 11223334000182) Tj ET`);
  y -= 12;
  content.push(`BT /F2 8.5 Tf 130 ${y} Td (Thank You! Visit Again) Tj ET`);

  const streamBody = content.join('\n');
  const streamLen = new TextEncoder().encode(streamBody).length;

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents 4 0 R >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamBody}\nendstream\nendobj\n`;

  const header = '%PDF-1.4\n';
  const enc = new TextEncoder();
  const offset1 = enc.encode(header).length;
  const offset2 = offset1 + enc.encode(obj1).length;
  const offset3 = offset2 + enc.encode(obj2).length;
  const offset4 = offset3 + enc.encode(obj3).length;
  const xrefOffset = offset4 + enc.encode(obj4).length;

  const xref =
    'xref\n0 5\n0000000000 65535 f \n' +
    String(offset1).padStart(10, '0') +
    ' 00000 n \n' +
    String(offset2).padStart(10, '0') +
    ' 00000 n \n' +
    String(offset3).padStart(10, '0') +
    ' 00000 n \n' +
    String(offset4).padStart(10, '0') +
    ' 00000 n \n';

  const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return header + obj1 + obj2 + obj3 + obj4 + xref + trailer;
}

/**
 * Automatically downloads the authentic PDF bill on the user's browser.
 */
export function downloadPdfBill(data: PdfBillData): void {
  if (typeof window === 'undefined') return;

  try {
    const pdfString = buildPdfBillString(data);
    const bytes = new TextEncoder().encode(pdfString);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const filename = `${(data.invoiceNumber || 'BILL').replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  } catch (err) {
    console.error('[PDF] Download failed:', err);
  }
}
