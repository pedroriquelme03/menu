import React, { useState, useEffect } from 'react';
import { SystemConfig } from '../../types';
import { 
  Settings as SettingsIcon, 
  MessageCircle, 
  Users, 
  ToggleLeft, 
  ToggleRight,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export const SystemConfigView: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    orderMode: 'both',
    whatsappIntegration: {
      enabled: true,
      webhookUrl: '',
      autoConfirmOrders: false,
      defaultDeliveryFee: 5.00
    },
    tableIntegration: {
      enabled: true,
      qrCodeEnabled: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento da configuração
      // Em produção, isso viria do banco de dados ou localStorage
      const savedConfig = localStorage.getItem('systemConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simular salvamento da configuração
      localStorage.setItem('systemConfig', JSON.stringify(config));
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrderModeChange = (mode: 'table' | 'whatsapp' | 'both') => {
    setConfig(prev => ({
      ...prev,
      orderMode: mode,
      whatsappIntegration: {
        ...prev.whatsappIntegration,
        enabled: mode === 'whatsapp' || mode === 'both'
      },
      tableIntegration: {
        ...prev.tableIntegration,
        enabled: mode === 'table' || mode === 'both'
      }
    }));
  };

  const handleWhatsAppToggle = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      whatsappIntegration: {
        ...prev.whatsappIntegration,
        enabled
      }
    }));
  };

  const handleTableToggle = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      tableIntegration: {
        ...prev.tableIntegration,
        enabled
      }
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => {
      const keys = field.split('.');
      const newConfig = { ...prev };
      
      if (keys.length === 2) {
        (newConfig as any)[keys[0]][keys[1]] = value;
      } else {
        (newConfig as any)[field] = value;
      }
      
      return newConfig;
    });
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-gray-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
            <p className="text-gray-600">Gerencie os modos de operação e integrações</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Salvo!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Erro ao salvar</span>
            </div>
          )}
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Order Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Modo de Operação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              id: 'table', 
              label: 'Apenas Mesas', 
              description: 'Sistema tradicional com QR codes nas mesas',
              icon: Users,
              color: 'blue'
            },
            { 
              id: 'whatsapp', 
              label: 'Apenas WhatsApp', 
              description: 'Pedidos recebidos via WhatsApp',
              icon: MessageCircle,
              color: 'green'
            },
            { 
              id: 'both', 
              label: 'Ambos os Modos', 
              description: 'Mesas e WhatsApp simultaneamente',
              icon: SettingsIcon,
              color: 'purple'
            }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = config.orderMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleOrderModeChange(mode.id as any)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? `border-${mode.color}-500 bg-${mode.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 ${
                    isSelected ? `text-${mode.color}-600` : 'text-gray-500'
                  }`} />
                  <h4 className={`font-semibold ${
                    isSelected ? `text-${mode.color}-800` : 'text-gray-800'
                  }`}>
                    {mode.label}
                  </h4>
                </div>
                <p className="text-sm text-gray-600">{mode.description}</p>
                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Ativo</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Integration Settings */}
      {config.orderMode === 'whatsapp' || config.orderMode === 'both' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Integração WhatsApp</h3>
            </div>
            <button
              onClick={() => handleWhatsAppToggle(!config.whatsappIntegration.enabled)}
              className="flex items-center gap-2"
            >
              {config.whatsappIntegration.enabled ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {config.whatsappIntegration.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Webhook (n8n)
                </label>
                <input
                  type="url"
                  value={config.whatsappIntegration.webhookUrl}
                  onChange={(e) => handleInputChange('whatsappIntegration.webhookUrl', e.target.value)}
                  placeholder="https://seu-n8n.com/webhook/whatsapp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL onde o n8n enviará os pedidos recebidos via WhatsApp
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Confirmar Pedidos Automaticamente</h4>
                  <p className="text-sm text-gray-600">Pedidos WhatsApp serão confirmados automaticamente</p>
                </div>
                <button
                  onClick={() => handleInputChange('whatsappIntegration.autoConfirmOrders', !config.whatsappIntegration.autoConfirmOrders)}
                  className="flex items-center gap-2"
                >
                  {config.whatsappIntegration.autoConfirmOrders ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Entrega Padrão
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.whatsappIntegration.defaultDeliveryFee}
                  onChange={(e) => handleInputChange('whatsappIntegration.defaultDeliveryFee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor padrão: {formatPrice(config.whatsappIntegration.defaultDeliveryFee)}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Table Integration Settings */}
      {config.orderMode === 'table' || config.orderMode === 'both' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Integração Mesas</h3>
            </div>
            <button
              onClick={() => handleTableToggle(!config.tableIntegration.enabled)}
              className="flex items-center gap-2"
            >
              {config.tableIntegration.enabled ? (
                <ToggleRight className="w-8 h-8 text-blue-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {config.tableIntegration.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">QR Codes Habilitados</h4>
                  <p className="text-sm text-gray-600">Clientes podem escanear QR codes para acessar o cardápio</p>
                </div>
                <button
                  onClick={() => handleInputChange('tableIntegration.qrCodeEnabled', !config.tableIntegration.qrCodeEnabled)}
                  className="flex items-center gap-2"
                >
                  {config.tableIntegration.qrCodeEnabled ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              config.tableIntegration.enabled ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div>
              <p className="font-medium text-gray-800">Sistema de Mesas</p>
              <p className="text-sm text-gray-600">
                {config.tableIntegration.enabled ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              config.whatsappIntegration.enabled ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div>
              <p className="font-medium text-gray-800">Integração WhatsApp</p>
              <p className="text-sm text-gray-600">
                {config.whatsappIntegration.enabled ? 'Ativa' : 'Inativa'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
