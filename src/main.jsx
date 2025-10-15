import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from 'react';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

const brand = { navy: '#0b1e39', gold: '#d4af37', red: '#b71c1c', white: '#ffffff' };

function makePdf(title, lines) {
  const doc = new jsPDF({ unit: 'pt' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("St Patrick's College Mackay", 100, 48);
  doc.setFontSize(12);
  doc.text(title, 100, 68);
  doc.setDrawColor(12, 30, 57);
  doc.setLineWidth(2);
  doc.line(40, 86, 555, 86);
  doc.setFont('helvetica', 'normal');
  let y = 112;
  const maxWidth = 515;
  lines.forEach(line => {
    const text = doc.splitTextToSize(line, maxWidth);
    doc.text(text, 40, y);
    y += 20 + (text.length - 1) * 12;
    if (y > 760) { doc.addPage(); y = 60; }
  });
  doc.setFontSize(9);
  doc.setTextColor(183, 28, 28);
  doc.text('College values: Compassion · Hope · Justice · Respect', 40, 800);
  doc.save(title.replace(/\s+/g, '_') + '.pdf');
}

export default function App() {
  return (
    <div style={{ padding: '2rem', backgroundColor: brand.navy, color: brand.white, minHeight: '100vh' }}>
      <h1 style={{ color: brand.gold }}>St Patrick’s Teacher Induction Hub</h1>
      <p>Generate College-branded PDF forms:</p>
      <button onClick={() => makePdf('Goal Setting Template', ['Goal Setting Template', 'Teacher Name: _________'])}
        style={{ background: brand.gold, color: brand.navy, margin: '0.5rem', padding: '0.6rem 1rem', border: 'none', borderRadius: '6px' }}>
        <FileDown style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} /> Goal Setting Template
      </button>
      <button onClick={() => makePdf('Peer Observation Form', ['Peer Observation Form', 'Observer: _________'])}
        style={{ background: brand.red, color: brand.white, margin: '0.5rem', padding: '0.6rem 1rem', border: 'none', borderRadius: '6px' }}>
        <FileDown style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} /> Peer Observation
      </button>
      <button onClick={() => makePdf('Post-Observation Reflection', ['Post-Observation Reflection', 'Teacher: _________'])}
        style={{ background: brand.white, color: brand.navy, margin: '0.5rem', padding: '0.6rem 1rem', border: 'none', borderRadius: '6px' }}>
        <FileDown style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} /> Post-Observation
      </button>
      <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '1rem' }}>Upload your crest later via the Admin section.</p>
    </div>
  );
}
