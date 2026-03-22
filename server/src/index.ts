import express from 'express';
import cors from 'cors';
import challengeRoutes from './routes/challenge.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api', challengeRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'presence-server' });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🛡️  PRESENCE server running on http://localhost:${PORT}`);
  console.log(`   POST /api/challenge  — generate a challenge token`);
  console.log(`   POST /api/verify     — verify a challenge response`);
});
