# Integração WhatsApp + n8n

Este documento explica como configurar e usar a integração WhatsApp com n8n para receber pedidos automaticamente.

## 📋 Visão Geral

O sistema agora suporta dois modos de operação:
- **Modo Mesa**: Sistema tradicional com QR codes nas mesas
- **Modo WhatsApp**: Pedidos recebidos via WhatsApp através do n8n
- **Modo Híbrido**: Ambos os modos funcionando simultaneamente

## 🔧 Configuração

### 1. Configuração do Sistema

Acesse o painel administrativo → **Sistema** para configurar:

- **Modo de Operação**: Escolha entre Mesa, WhatsApp ou Ambos
- **URL do Webhook**: Configure a URL onde o n8n enviará os pedidos
- **Confirmação Automática**: Ative para confirmar pedidos WhatsApp automaticamente
- **Taxa de Entrega**: Defina o valor padrão para entregas

### 2. Configuração do n8n

Configure seu workflow no n8n com os seguintes passos:

1. **Trigger WhatsApp**: Configure para receber mensagens
2. **Processamento**: Extraia dados do pedido (cliente, itens, endereço)
3. **Webhook**: Envie dados para o endpoint do sistema

### 3. Estrutura do Payload

O n8n deve enviar um payload JSON no seguinte formato:

```json
{
  "orderId": "WA-2024-001",
  "customerPhone": "11999999999",
  "customerName": "João Silva",
  "customerAddress": "Rua das Flores, 123 - São Paulo/SP",
  "items": [
    {
      "menuItemId": "item-1",
      "quantity": 2,
      "notes": "Sem cebola",
      "customizations": ["Sem cebola", "Bem temperado"]
    }
  ],
  "paymentMethod": "pix",
  "notes": "Entregar após 19h",
  "timestamp": "2024-01-15T19:30:00.000Z"
}
```

## 📱 Funcionalidades

### Painel Administrativo

- **Aba WhatsApp**: Gerencie todos os pedidos recebidos via WhatsApp
- **Filtros**: Por status (Pendente, Confirmado, Preparando, Pronto, Entregue)
- **Ações**: Confirmar, iniciar preparo, marcar pronto, entregar
- **Informações**: Telefone, nome, endereço do cliente

### Sistema da Cozinha (KDS)

- **Visão Unificada**: Pedidos de mesa e WhatsApp em uma única tela
- **Filtros Duplos**: Por status e por fonte (Mesa/WhatsApp)
- **Identificação Visual**: Ícones diferentes para cada tipo de pedido
- **Atualização em Tempo Real**: Botão para atualizar pedidos WhatsApp

### Gestão de Pedidos

- **Status Tracking**: Acompanhe o progresso de cada pedido
- **Informações do Cliente**: Telefone, nome e endereço sempre visíveis
- **Observações**: Notas especiais e personalizações
- **Pagamento**: Método e status do pagamento

## 🔄 Fluxo de Trabalho

### 1. Recebimento do Pedido
1. Cliente envia mensagem via WhatsApp
2. n8n processa a mensagem
3. n8n envia webhook para o sistema
4. Sistema cria pedido automaticamente

### 2. Processamento na Cozinha
1. Pedido aparece no KDS
2. Cozinha confirma o pedido
3. Inicia preparo dos itens
4. Marca como pronto
5. Confirma entrega

### 3. Acompanhamento
1. Cliente pode acompanhar status via WhatsApp
2. Sistema notifica mudanças de status
3. Relatórios incluem pedidos WhatsApp

## 🛠️ Desenvolvimento

### Estrutura de Arquivos

```
src/
├── types/
│   └── index.ts                 # Tipos WhatsApp
├── services/
│   └── whatsappService.ts       # Serviço WhatsApp
├── components/
│   ├── admin/
│   │   ├── WhatsAppOrdersView.tsx
│   │   └── SystemConfigView.tsx
│   └── kds/
│       └── UnifiedOrderTicket.tsx
└── api/
    └── webhookHandler.ts        # Handler do webhook
```

### Banco de Dados

Nova tabela `whatsapp_orders`:
- Armazena pedidos recebidos via WhatsApp
- Campos para cliente, endereço, itens
- Status de pedido e pagamento
- Timestamps de criação e atualização

### APIs Disponíveis

- `POST /api/webhook/whatsapp` - Receber pedidos do n8n
- `GET /api/whatsapp/orders` - Listar pedidos WhatsApp
- `PUT /api/whatsapp/orders/:id/status` - Atualizar status
- `PUT /api/whatsapp/orders/:id/payment` - Atualizar pagamento

## 🔒 Segurança

- **Validação de Payload**: Verificação de campos obrigatórios
- **Rate Limiting**: Proteção contra spam
- **Logs**: Registro de todas as operações
- **RLS**: Row Level Security no Supabase

## 📊 Monitoramento

- **Logs de Webhook**: Registro de todos os pedidos recebidos
- **Métricas**: Contadores de pedidos por status
- **Alertas**: Notificações para pedidos pendentes
- **Relatórios**: Análise de performance WhatsApp vs Mesa

## 🚀 Próximos Passos

1. **Notificações Push**: Alertas em tempo real
2. **Chat Integrado**: Resposta automática via WhatsApp
3. **Geolocalização**: Mapa de entregas
4. **Analytics**: Dashboard de performance
5. **Integração Pagamento**: Processamento automático

## 📞 Suporte

Para dúvidas sobre a integração WhatsApp:
- Documentação técnica: `/docs/whatsapp-integration.md`
- Exemplos de payload: `/examples/webhook-payloads.json`
- Testes: `/tests/whatsapp-service.test.ts`
