# 🍽️ Sistema de Pedidos QR para Restaurantes

Sistema completo de gerenciamento de pedidos para restaurantes via QR Code, desenvolvido em React + TypeScript.

## ✨ Funcionalidades

### 🎯 Portal do Cliente
- **QR Code único** para cada mesa
- **Carrinho individual** para cada convidado
- **Cardápio digital** com categorias
- **Modificadores** personalizáveis para pedidos
- **Pedidos em tempo real**

### 👨‍🍳 Painel da Cozinha (KDS)
- **Kitchen Display System** integrado
- **Acompanhamento** de pedidos em tempo real
- **Atualização** de status dos pedidos
- **Gerenciamento** da fila de preparação

### 🏢 Painel Administrativo
- **Gerenciamento** de mesas e ocupação
- **Controle** de pagamentos (dinheiro, cartão, PIX)
- **Relatórios** e analytics
- **Geração** de QR codes para mesas
- **Configurações** do sistema

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Estado Global**: Context API + useReducer
- **Ícones**: Lucide React
- **QR Codes**: qrcode + jszip

## 📱 Como Funciona

1. **Cliente chega à mesa** → Escaneia QR code único
2. **Entra no sistema** → Escolhe nome e assento
3. **Faz pedidos** → Adiciona ao carrinho individual
4. **Cozinha recebe** → Atualiza status via KDS
5. **Pedido pronto** → Cliente é notificado
6. **Pagamento** → Individual ou dividido por mesa

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nome-do-repo.git
cd nome-do-repo

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── admin/          # Painel administrativo
│   ├── client/         # Portal do cliente
│   ├── kds/            # Sistema da cozinha
│   └── ui/             # Componentes de interface
├── contexts/            # Contextos React
├── types/               # Definições TypeScript
├── data/                # Dados simulados
└── main.tsx            # Ponto de entrada
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_APP_TITLE=Sistema de Pedidos QR
VITE_APP_URL=http://localhost:5173
```

### Personalização
- **Cores**: Edite `tailwind.config.js`
- **Dados**: Modifique `src/data/seedData.ts`
- **Tipos**: Ajuste `src/types/index.ts`

## 📊 Funcionalidades de QR Code

### Geração Individual
- Clique no ícone QR code de qualquer mesa
- Download como imagem PNG
- Impressão formatada

### Gerenciamento em Lote
- Visualize todos os QR codes
- Download em arquivo ZIP
- Impressão de todos os códigos

## 🎨 Características da Interface

- **Design responsivo** para todos os dispositivos
- **Tema moderno** com Tailwind CSS
- **Animações suaves** e transições
- **Ícones intuitivos** do Lucide
- **Layout adaptativo** para mobile e desktop

## 📈 Roadmap

- [ ] **Autenticação** de usuários
- [ ] **Backend** com API REST
- [ ] **Banco de dados** persistente
- [ ] **Notificações** push
- [ ] **Relatórios** avançados
- [ ] **Integração** com sistemas de pagamento
- [ ] **App mobile** nativo

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email**: seu-email@exemplo.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/nome-do-repo/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/nome-do-repo/wiki)

## 🙏 Agradecimentos

- **React Team** pelo framework incrível
- **Tailwind CSS** pelo sistema de design
- **Vite** pela ferramenta de build rápida
- **Lucide** pelos ícones bonitos

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
