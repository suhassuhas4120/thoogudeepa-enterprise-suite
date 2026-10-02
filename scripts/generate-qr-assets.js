const fs = require('fs');
const path = require('path');

const ALL_TABLES = [
  // 4x 2-Seaters
  { number: 'T-01', capacity: 2, section: 'Express Couple Pod' },
  { number: 'T-02', capacity: 2, section: 'Express Couple Pod' },
  { number: 'T-03', capacity: 2, section: 'Express Couple Pod' },
  { number: 'T-04', capacity: 2, section: 'Express Couple Pod' },
  // 10x 3-Seaters
  { number: 'T-05', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-06', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-07', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-08', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-09', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-10', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-11', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-12', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-13', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-14', capacity: 3, section: 'Main Dining Hall' },
  // 10x 4-Seaters
  { number: 'T-15', capacity: 4, section: 'Family Section' },
  { number: 'T-16', capacity: 4, section: 'Family Section' },
  { number: 'T-17', capacity: 4, section: 'Family Section' },
  { number: 'T-18', capacity: 4, section: 'Family Section' },
  { number: 'T-19', capacity: 4, section: 'Family Section' },
  { number: 'T-20', capacity: 4, section: 'Family Section' },
  { number: 'T-21', capacity: 4, section: 'Family Section' },
  { number: 'T-22', capacity: 4, section: 'Family Section' },
  { number: 'T-23', capacity: 4, section: 'Family Section' },
  { number: 'T-24', capacity: 4, section: 'Family Section' },
  // 5x 5-Seaters
  { number: 'T-25', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-26', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-27', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-28', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-29', capacity: 5, section: 'Courtyard Garden' },
  // 5x 6-Seaters
  { number: 'T-30', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-31', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-32', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-33', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-34', capacity: 6, section: 'Grand Feast Hall' },
];

const outDir = path.join(__dirname, '../public/printable-cards');
fs.mkdirSync(outDir, { recursive: true });

console.log(`Generating 34 Printable Table Cards for 133 Seats...`);

ALL_TABLES.forEach((tbl) => {
  const seatsHtml = Array.from({ length: tbl.capacity }, (_, i) => i + 1)
    .map((seat) => {
      const url = `https://thoogudeepa-develop.surge.sh/?table=${tbl.number}&seat=${seat}`;
      const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=0F3A22`;
      return `
      <div style="border: 2px solid #0f172a; border-radius: 12px; padding: 12px; text-align: center; background: #fff; width: 180px;">
        <div style="font-family: monospace; font-size: 14px; font-weight: 900; color: #ea580c; margin-bottom: 6px;">
          SEAT #${seat}
        </div>
        <img src="${qrApi}" width="150" height="150" style="display: block; margin: 0 auto;" />
        <div style="font-family: monospace; font-size: 9px; color: #475569; margin-top: 6px; word-break: break-all;">
          ${tbl.number}-S${seat}
        </div>
      </div>
    `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Table ${tbl.number} - Thoogudeepa Donne Biryani Mane</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      @page { size: A4 landscape; margin: 10mm; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fafaf9; padding: 20px; }
    .card { max-width: 900px; margin: 0 auto; background: #fff; border: 3px solid #0f172a; border-radius: 20px; padding: 24px; box-shadow: 6px 6px 0px #0f172a; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
    .subtitle { font-size: 11px; font-family: monospace; color: #ea580c; font-weight: bold; }
    .badge { background: #ea580c; color: #fff; padding: 6px 14px; border-radius: 8px; font-family: monospace; font-weight: 900; font-size: 14px; }
    .grid { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin: 20px 0; }
    .instructions { text-align: center; font-size: 12px; color: #334155; font-family: monospace; border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="subtitle">THOOGUDEEPA DONNE BIRYANI MANE • TABLETOP EDGE ANCHORS</div>
        <div class="title">TABLE ${tbl.number} (${tbl.section})</div>
      </div>
      <div class="badge">${tbl.capacity} SEATS / SCANNERS</div>
    </div>

    <div style="text-align: center; font-family: monospace; font-size: 12px; font-weight: bold; color: #0F3A22; margin-bottom: 8px;">
      [PERMANENTLY AFFIX EACH QR CODE TO THE RESPECTIVE TABLETOP EDGE IN FRONT OF EACH CHAIR]
    </div>

    <div class="grid">
      ${seatsHtml}
    </div>

    <div class="instructions">
      Scan with your phone camera • No app download required • Dine first, pay seamlessly via UPI at the end
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, `Table_${tbl.number}.html`), html);
});

console.log(`✅ Successfully generated 34 table cards in public/printable-cards/`);
