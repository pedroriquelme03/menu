# 🗄️ Configuração do Banco de Dados

Este diretório contém os scripts e configurações necessários para configurar o banco de dados Supabase.

## 📋 Pré-requisitos

1. **Conta no Supabase** configurada
2. **Projeto criado** no Supabase
3. **Credenciais** configuradas no Vercel

## 🚀 Passos para Configuração

### 1. Executar o Schema SQL

1. Acesse o **Dashboard do Supabase**
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `schema.sql`
4. Clique em **Run** para executar

### 2. Políticas RLS

O `schema.sql` já inclui **todas** as políticas RLS necessárias para o app (CRUD de mesas, assentos, cardápio, pedidos, pagamentos e WhatsApp).

Os arquivos `fix_*.sql` são legado — só use se estiver atualizando um banco antigo criado com schema incompleto.

### 3. Verificar as Tabelas

Após executar o schema, você deve ver as seguintes tabelas:

- `tables` - Mesas do restaurante
- `seats` - Assentos dos clientes
- `menu_items` - Itens do cardápio
- `orders` - Pedidos dos clientes
- `payments` - Pagamentos

### 4. Configurar Variáveis de Ambiente

No Vercel, certifique-se de que as seguintes variáveis estão configuradas:

```env
VITE_SUPABASE_URL=https://pxepuwymesswpgbxwkum.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-dashboard
```

**Para desenvolvimento local**, crie um arquivo `.env` na raiz do projeto com as mesmas variáveis.

## 🔧 Estrutura das Tabelas

### Tables
- `id` - UUID único
- `number` - Número da mesa
- `token` - Token único para QR code
- `capacity` - Capacidade da mesa
- `is_occupied` - Status de ocupação
- `session_id` - ID da sessão atual
- `created_at` - Data de criação

### Seats
- `id` - UUID único
- `table_id` - Referência à mesa
- `seat_number` - Número do assento
- `guest_name` - Nome do convidado
- `device_id` - ID do dispositivo
- `joined_at` - Data de entrada

### Menu Items
- `id` - UUID único
- `name` - Nome do item
- `description` - Descrição
- `price` - Preço
- `category` - Categoria
- `image_url` - URL da imagem
- `is_available` - Disponibilidade

### Orders
- `id` - UUID único
- `table_id` - Referência à mesa
- `seat_id` - Referência ao assento
- `items` - JSON com itens do pedido
- `subtotal` - Valor total
- `status` - Status do pedido
- `notes` - Observações

### Payments
- `id` - UUID único
- `table_id` - Referência à mesa
- `seat_id` - Referência ao assento
- `amount` - Valor do pagamento
- `method` - Método de pagamento
- `status` - Status do pagamento

## 🔒 Segurança

O schema inclui:

- **Row Level Security (RLS)** habilitado
- **Políticas de acesso** configuradas
- **Validações** de dados
- **Índices** para performance
- **Triggers** para timestamps automáticos

## 🧪 Testando a Conexão

Após a configuração, o sistema deve:

1. **Conectar automaticamente** ao Supabase
2. **Criar dados iniciais** se necessário
3. **Persistir** todas as operações
4. **Manter dados** entre recarregamentos

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique as credenciais do Supabase
- Confirme se o projeto está ativo
- Teste a conexão no SQL Editor

### Erro de Permissão
- Verifique as políticas RLS
- Confirme se as tabelas foram criadas
- Teste as operações CRUD

### Dados Não Persistem
- Verifique se o DatabaseService está sendo chamado
- Confirme se as operações estão sendo executadas
- Verifique os logs do console

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do console
2. Teste a conexão no Supabase
3. Confirme se o schema foi executado corretamente
4. Verifique as variáveis de ambiente
