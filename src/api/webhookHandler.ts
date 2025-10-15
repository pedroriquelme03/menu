// Endpoint para receber webhooks do n8n
// Este arquivo deve ser servido como uma API route em produção

import { WhatsAppService } from '../services/whatsappService';
import { WhatsAppWebhookPayload } from '../types';

// Função para processar webhook do n8n
export async function handleWhatsAppWebhook(payload: WhatsAppWebhookPayload) {
  try {
    console.log('Webhook recebido do n8n:', payload);

    // Validar payload
    if (!payload.orderId || !payload.customerPhone || !payload.items || payload.items.length === 0) {
      throw new Error('Payload inválido: campos obrigatórios ausentes');
    }

    // Processar pedido via WhatsAppService
    const order = await WhatsAppService.processWebhookPayload(payload);

    if (order) {
      console.log('Pedido WhatsApp processado com sucesso:', order.id);
      
      // Aqui você pode adicionar notificações em tempo real
      // Por exemplo, usando WebSockets ou Server-Sent Events
      
      return {
        success: true,
        orderId: order.id,
        message: 'Pedido processado com sucesso'
      };
    } else {
      throw new Error('Falha ao processar pedido');
    }
  } catch (error) {
    console.error('Erro ao processar webhook WhatsApp:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Exemplo de uso em uma API route (Next.js, Vercel, etc.)
export const webhookHandler = async (req: any, res: any) => {
  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const payload: WhatsAppWebhookPayload = req.body;
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
};

// Exemplo de payload esperado do n8n:
export const examplePayload: WhatsAppWebhookPayload = {
  orderId: "WA-2024-001",
  customerPhone: "11999999999",
  customerName: "João Silva",
  customerAddress: "Rua das Flores, 123 - São Paulo/SP",
  items: [
    {
      menuItemId: "item-1",
      quantity: 2,
      notes: "Sem cebola",
      customizations: ["Sem cebola", "Bem temperado"]
    },
    {
      menuItemId: "item-2", 
      quantity: 1,
      notes: "Gelado"
    }
  ],
  paymentMethod: "pix",
  notes: "Entregar após 19h",
  timestamp: new Date().toISOString()
};
