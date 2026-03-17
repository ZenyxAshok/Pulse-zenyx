import express from 'express';
import nodemailer from 'nodemailer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT;

if (!PORT) throw new Error('PORT environment variable is required');

const LEADS_FILE = join(__dirname, 'leads.json');

app.use(express.json());
app.use(express.static(__dirname));

// ── STORAGE ──
function readLeads() {
  if (!existsSync(LEADS_FILE)) return [];
  try { return JSON.parse(readFileSync(LEADS_FILE, 'utf8')); } catch { return []; }
}

function saveLead(lead) {
  const leads = readLeads();
  leads.push(lead);
  writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  console.log(`[LEAD] ${lead.status} — ${lead.name} | ${lead.hospital || '—'} | Score: ${lead.riskScore || '—'}`);
}

// ── EMAIL ──
function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn('[EMAIL] SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS env vars');
    return null;
  }
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  });
}

function notifyEmail() {
  return process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
}

function adminEmailHtml({ title, rows, submittedAt }) {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0ede8;font-weight:600;color:#555;width:160px;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ede8;">${value || '—'}</td>
    </tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#F0641E;padding:20px 24px;border-radius:8px 8px 0 0;">
      <h2 style="color:#fff;margin:0;font-size:18px;">${title}</h2>
    </div>
    <div style="background:#fff;border:1px solid #e8e6e2;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
      <div style="margin-top:20px;padding:12px 16px;background:#fff8f5;border-radius:6px;border:1px solid #fdd5c0;">
        <p style="margin:0;font-size:12px;color:#888;">Submitted: ${submittedAt}</p>
      </div>
    </div>
  </div>`;
}

// ── POST /pulse/submit-audit ──
app.post('/pulse/submit-audit', async (req, res) => {
  const { name, email, phone, hospital, role, facilityType, answers, riskScore, riskLabel } = req.body;

  saveLead({
    date: new Date().toISOString(),
    name, email, phone, hospital, role, facilityType,
    riskScore, riskLabel,
    packageInterest: 'Assessment Completed',
    leadSource: 'ZENYX Pulse',
    status: 'New Lead',
    notes: '',
    answers,
  });

  const transport = getTransport();
  if (transport) {
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Admin notification
    try {
      await transport.sendMail({
        from: `"ZENYX Pulse" <${process.env.SMTP_USER}>`,
        to: notifyEmail(),
        subject: `[ZENYX Pulse] New Lead: ${name} — ${hospital}`,
        html: adminEmailHtml({
          title: 'New Hospital IT Audit Submission',
          rows: [
            ['Name', name],
            ['Phone', phone],
            ['Email', email],
            ['Hospital', hospital],
            ['Role', role],
            ['Facility Type', facilityType],
            ['Risk Score', `<strong style="color:#F0641E;font-size:16px;">${riskScore}/100</strong>`],
            ['Risk Label', riskLabel],
          ],
          submittedAt: ts,
        }),
      });
      console.log('[EMAIL] Admin notification sent');
    } catch (e) { console.error('[EMAIL] Admin notification failed:', e.message); }

    // Client confirmation
    if (email) {
      try {
        await transport.sendMail({
          from: `"ZENYX Pulse" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Your ZENYX Pulse Hospital IT Health Report',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0A0A0A;padding:20px 24px;border-radius:8px 8px 0 0;">
              <div style="font-size:16px;font-weight:700;color:#fff;">ZENYX<span style="color:#F0641E;">Pulse</span></div>
            </div>
            <div style="background:#fff;border:1px solid #e8e6e2;border-top:none;padding:28px;border-radius:0 0 8px 8px;">
              <h2 style="font-size:20px;color:#111;margin-bottom:8px;">Thank you, ${name}.</h2>
              <p style="color:#555;font-size:14px;line-height:1.65;margin-bottom:16px;">
                We've received your ZENYX Pulse Hospital IT Health Assessment for <strong>${hospital}</strong>.
              </p>
              <div style="background:#f7f6f4;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                <p style="margin:0;font-size:14px;color:#555;line-height:1.65;">
                  Your IT Health Score: <strong style="color:#F0641E;font-size:20px;">${riskScore}/100</strong><br>
                  Risk Level: <strong>${riskLabel}</strong>
                </p>
              </div>
              <p style="color:#555;font-size:14px;line-height:1.65;margin-bottom:24px;">
                Our team may reach out to discuss your results and how ZENYX can help address the gaps identified in your assessment.
              </p>
              <p style="color:#aaa;font-size:12px;border-top:1px solid #f0ede8;padding-top:16px;margin:0;">
                ZENYX IT Infra Solutions &middot; Hyderabad, India &middot;
                <a href="https://zenyx.in" style="color:#F0641E;">zenyx.in</a>
              </p>
            </div>
          </div>`,
        });
        console.log('[EMAIL] Client confirmation sent to', email);
      } catch (e) { console.error('[EMAIL] Client confirmation failed:', e.message); }
    }
  }

  res.json({ success: true });
});

// ── POST /pulse/package-enquiry ──
app.post('/pulse/package-enquiry', async (req, res) => {
  const { name, email, phone, hospital, packageName, systems, message } = req.body;

  saveLead({
    date: new Date().toISOString(),
    name, email, phone, hospital,
    role: '', facilityType: '',
    riskScore: '', riskLabel: '',
    packageInterest: packageName || 'General Enquiry',
    leadSource: 'Package Enquiry',
    status: 'Hot Lead',
    notes: [message, systems ? `Systems: ${systems}` : ''].filter(Boolean).join(' | '),
    answers: {},
  });

  const transport = getTransport();
  if (transport) {
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    try {
      await transport.sendMail({
        from: `"ZENYX Pulse" <${process.env.SMTP_USER}>`,
        to: notifyEmail(),
        subject: `[ZENYX Pulse] 🔥 Package Enquiry: ${packageName} — ${name}`,
        html: adminEmailHtml({
          title: '🔥 Hot Lead — Package Enquiry',
          rows: [
            ['Package Interest', `<strong style="color:#F0641E;">${packageName}</strong>`],
            ['Name', name],
            ['Phone', `<strong>${phone}</strong>`],
            ['Email', email],
            ['Hospital', hospital],
            ['No. of Systems', systems],
            ['Message / Requirement', message],
          ],
          submittedAt: ts,
        }),
      });
      console.log('[EMAIL] Enquiry notification sent');
    } catch (e) { console.error('[EMAIL] Enquiry notification failed:', e.message); }
  }

  res.json({ success: true });
});

// ── GET /pulse/leads (admin view — protect in production) ──
app.get('/pulse/leads', (req, res) => {
  res.json(readLeads());
});

// ── Catch-all: serve index.html ──
app.use((req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZENYX Pulse server running on port ${PORT}`);
});
