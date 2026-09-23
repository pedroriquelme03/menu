import React, { useState } from 'react';
import { TablesView } from './TablesView';
import { TableRegistryView } from './TableRegistryView';
import { FloorMapView } from './FloorMapView';
import { MenuManagement } from './MenuManagement';
import { ReportsView } from './ReportsView';
import { Settings } from './Settings';
import { WhatsAppOrdersView } from './WhatsAppOrdersView';
import { SystemConfigView } from './SystemConfigView';
import { ReservationsBoardView } from './ReservationsBoardView';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Menu,
  BarChart3,
  Settings as SettingsIcon,
  Asterisk as CashRegister,
  MessageCircle,
  Cog,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ExternalLink,
  MapPin,
  Map,
  CalendarDays,
} from 'lucide-react';

type AdminTab =
  | 'tables'
  | 'floor-map'
  | 'table-registry'
  | 'reservations'
  | 'menu'
  | 'whatsapp'
  | 'reports'
  | 'settings'
  | 'system';

const navSections: {
  title: string;
  items: { id: AdminTab; label: string; icon: typeof LayoutGrid }[];
}[] = [
  {
    title: 'Operação',
    items: [
      { id: 'tables', label: 'Mesas', icon: LayoutGrid },
      { id: 'floor-map', label: 'Mapa do Salão', icon: Map },
      { id: 'table-registry', label: 'Cadastro Mesas', icon: MapPin },
      { id: 'reservations', label: 'Reservas', icon: CalendarDays },
      { id: 'menu', label: 'Cardápio', icon: Menu },
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { id: 'reports', label: 'Relatórios', icon: BarChart3 },
      { id: 'settings', label: 'Configurações', icon: SettingsIcon },
      { id: 'system', label: 'Sistema', icon: Cog },
    ],
  },
];

export const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('tables');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel =
    navSections.flatMap((s) => s.items).find((item) => item.id === activeTab)
      ?.label ?? 'Admin';

  const handleSelect = (id: AdminTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div
        className={`flex items-center border-b border-slate-200 ${
          sidebarCollapsed ? 'justify-center px-3 py-5' : 'gap-3 px-5 py-5'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <CashRegister className="h-5 w-5" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">Admin</p>
            <p className="truncate text-xs text-slate-500">Painel do restaurante</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={sidebarCollapsed ? item.label : undefined}
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center rounded-xl text-sm font-medium transition-colors ${
                      sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="hidden space-y-1 border-t border-slate-200 p-3 md:block">
        <Link
          to="/caixa"
          title={sidebarCollapsed ? 'Abrir Caixa' : undefined}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Abrir Caixa</span>}
        </Link>
        <Link
          to="/painel"
          title={sidebarCollapsed ? 'Painel TV' : undefined}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50 ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Painel TV</span>}
        </Link>
        <Link
          to="/recepcao"
          title={sidebarCollapsed ? 'Recepção' : undefined}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Recepção</span>}
        </Link>
        <Link
          to="/garcom"
          title={sidebarCollapsed ? 'Garçom' : undefined}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Garçom</span>}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 md:flex ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex h-full flex-col [&>div:first-child]:pr-12">
              {/* Force expanded labels on mobile drawer */}
              <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <CashRegister className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">Admin</p>
                  <p className="truncate text-xs text-slate-500">Painel do restaurante</p>
                </div>
              </div>
              <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 md:text-xl">{activeLabel}</h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Gestão completa do restaurante
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {activeTab === 'tables' && <TablesView />}
          {activeTab === 'floor-map' && <FloorMapView />}
          {activeTab === 'table-registry' && <TableRegistryView />}
          {activeTab === 'reservations' && <ReservationsBoardView />}
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'whatsapp' && <WhatsAppOrdersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'system' && <SystemConfigView />}
        </main>
      </div>
    </div>
  );
};
