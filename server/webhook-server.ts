import express from 'express';
import cors from 'cors';
import { handleWhatsAppWebhook } from '../src/api/webhookHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Webhook endpoint
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    const payload = req.body;
    const result = await handleWhatsAppWebhook(payload);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Erro no webhook handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook rodando na porta ${PORT}`);
  console.log(`📡 Webhook WhatsApp: http://localhost:${PORT}/api/webhook/whatsapp`);
});
