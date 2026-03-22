import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// TODO: Mount route handlers
// import challengeRoutes from './routes/challenge';
// app.use('/api/challenge', challengeRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'presence-server' });
});

app.listen(PORT, () => {
  console.log(`🛡️  PRESENCE server running on http://localhost:${PORT}`);
});
