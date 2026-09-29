import {
  CalendarCheck,
  Clock,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Plus,
  UserPlus,
  Package,
  ArrowRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const kpis = [
  { label: 'Confirmados', value: 12, badge: 'Activos', badgeColor: 'green', icon: CalendarCheck, trend: '+8% vs mes anterior', trendUp: true },
  { label: 'Pendientes', value: 5, badge: 'Por Aprobar', badgeColor: 'amber', icon: Clock, trend: '2 pendientes hoy', trendUp: false },
  { label: 'En Curso', value: 3, badge: 'Ejecutándose', badgeColor: 'blue', icon: PlayCircle, trend: 'Sin incidencias', trendUp: true },
  { label: 'Finalizados', value: 28, badge: 'Historial', badgeColor: 'gray', icon: CheckCircle2, trend: '+14 este mes', trendUp: true },
];

const alerts = [
  { type: 'warning', text: 'Proyector HD — Solo 1 disponible en inventario global.' },
  { type: 'error', text: 'Carpas 6×6 — 0 disponibles (Sobre-reservado para 15 Nov).' },
];

const quickActions = [
  { label: 'Nuevo Evento', icon: Plus, primary: true },
  { label: 'Agregar Cliente', icon: UserPlus },
  { label: 'Ver Inventario', icon: Package },
];

const upcomingEvents = [
  { name: 'Boda García-López', date: '15 Nov 2026', status: 'Confirmado', statusColor: 'green' },
  { name: 'Gala Anual BBVA', date: '18 Nov 2026', status: 'Pendiente', statusColor: 'amber' },
  { name: 'Tech Summit Madrid', date: '22 Nov 2026', status: 'Confirmado', statusColor: 'green' },
  { name: 'Cena de Gala Rotarios', date: '25 Nov 2026', status: 'Finalizado', statusColor: 'gray' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-gray-500 dark:text-slate-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    {kpi.label}
                  </span>
                </div>
                <Badge variant={kpi.badgeColor}>{kpi.badge}</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {kpi.value}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                {kpi.trendUp ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (
                  <TrendingDown size={14} className="text-amber-500" />
                )}
                <span>{kpi.trend}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Alertas */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Alertas de Disponibilidad
              </h2>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                    alert.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}
                >
                  {alert.type === 'warning' ? (
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  )}
                  <span>{alert.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Accesos rápidos */}
          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
              Accesos Rápidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map(({ label, icon: Icon, primary }) => (
                <button
                  key={label}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition ${
                    primary
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Próximos eventos */}
        <div className="lg:col-span-1">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Próximos Eventos
              </h2>
              <a
                href="#"
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                Ver Agenda <ArrowRight size={12} />
              </a>
            </div>

            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li
                  key={event.name}
                  className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {event.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <CalendarIcon size={12} />
                      {event.date}
                    </p>
                  </div>
                  <Badge variant={event.statusColor}>{event.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}