import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Pencil,
  ChevronDown,
  User,
  Calendar as CalendarIcon,
  MapPin,
  Utensils,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

// 🚧 Datos mock del detalle (más adelante vendrá de APIM)
const MOCK_DETALLE = {
  id: 1,
  nombre: 'Gala Corporativa Anual',
  estado: 'Confirmado',
  cliente: 'Tech Solutions SA',
  fecha: '2026-11-15',
  lugar: 'Salón Real Ritz',
  costos: [
    { concepto: 'Alquiler de Equipos', monto: 2450 },
    { concepto: 'Servicio de Catering', monto: 4800 },
    { concepto: 'Personal de Servicio', monto: 1200 },
    { concepto: 'Montaje y Desmontaje', monto: 800 },
    { concepto: 'Decoración', monto: 1500 },
  ],
  pago: {
    estado: 'Parcialmente Pagado',
    pagado: 6450,
    total: 10750,
    porcentaje: 60,
    proximoPago: {
      monto: 2150,
      vence: '2026-11-01',
    },
  },
  catering: [
    { nombre: 'Menú Gourmet x 120 personas', detalle: 'Cantidad asignada: 120 pax', precio: 4200 },
    { nombre: 'Barra de Bebidas Premium', detalle: 'Cantidad asignada: 1 Serv', precio: 400 },
    { nombre: 'Estación de Postres', detalle: 'Cantidad asignada: 1 Serv', precio: 200 },
  ],
  historial: [
    { fecha: '2026-09-26', texto: 'Estado cambiado a Confirmado por Admin' },
    { fecha: '2026-09-20', texto: 'Catering actualizado: +Estación de Postres' },
    { fecha: '2026-09-15', texto: 'Equipos modificados: +2 Mesas' },
    { fecha: '2026-09-10', texto: 'Evento creado por María González' },
  ],
};

const ESTADOS = ['Pendiente', 'Confirmado', 'En Curso', 'Finalizado', 'Cancelado'];

const estadoVariants = {
  Confirmado: 'green',
  Pendiente: 'amber',
  'En Curso': 'blue',
  Finalizado: 'gray',
  Cancelado: 'red',
};

const formatCosto = (n) =>
  '€' + Number(n).toLocaleString('es-ES', { minimumFractionDigits: 0 });

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function DetalleEvento() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado local del evento (para reflejar cambios sin recargar)
  const [evento, setEvento] = useState(MOCK_DETALLE);

  // Dropdown de "Cambiar Estado"
  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);

  // Modal de Editar
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: evento.nombre,
    cliente: evento.cliente,
    fecha: evento.fecha,
    lugar: evento.lugar,
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) {
        setEstadoOpen(false);
      }
    };
    if (estadoOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [estadoOpen]);

  const totalCostos = evento.costos.reduce((acc, c) => acc + c.monto, 0);

  /* ===== Cambiar estado ===== */
  const handleCambiarEstado = (nuevoEstado) => {
    if (nuevoEstado === evento.estado) {
      setEstadoOpen(false);
      return;
    }

    // Simula actualización (en el futuro: updateEvento(id, { estado }))
    const nuevoHistorial = [
      {
        fecha: new Date().toISOString().slice(0, 10),
        texto: `Estado cambiado a ${nuevoEstado} por Admin`,
      },
      ...evento.historial,
    ];

    setEvento({
      ...evento,
      estado: nuevoEstado,
      historial: nuevoHistorial,
    });
    setEstadoOpen(false);
    toast.success(`Estado cambiado a ${nuevoEstado}`);
  };

  /* ===== Editar ===== */
  const openEdit = () => {
    setForm({
      nombre: evento.nombre,
      cliente: evento.cliente,
      fecha: evento.fecha,
      lugar: evento.lugar,
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!form.cliente.trim()) errors.cliente = 'El cliente es obligatorio';
    if (!form.fecha) errors.fecha = 'La fecha es obligatoria';
    if (!form.lugar.trim()) errors.lugar = 'El lugar es obligatorio';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Simula delay (en el futuro: await updateEvento(id, form))
      await new Promise((r) => setTimeout(r, 400));

      const cambios = [];
      if (form.nombre !== evento.nombre) cambios.push('Nombre');
      if (form.cliente !== evento.cliente) cambios.push('Cliente');
      if (form.fecha !== evento.fecha) cambios.push('Fecha');
      if (form.lugar !== evento.lugar) cambios.push('Lugar');

      const nuevoHistorial =
        cambios.length > 0
          ? [
              {
                fecha: new Date().toISOString().slice(0, 10),
                texto: `Evento editado: ${cambios.join(', ')}`,
              },
              ...evento.historial,
            ]
          : evento.historial;

      setEvento({
        ...evento,
        ...form,
        historial: nuevoHistorial,
      });
      setEditOpen(false);
      toast.success('Evento actualizado');
    } catch (err) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <Link
          to="/eventos"
          className="hover:text-teal-600 dark:hover:text-teal-400"
        >
          Eventos
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-medium">
          {evento.nombre}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {evento.nombre}
          </h1>
          <Badge variant={estadoVariants[evento.estado] || 'gray'}>
            {evento.estado}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown Cambiar Estado */}
          <div className="relative" ref={estadoRef}>
            <button
              onClick={() => setEstadoOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              aria-expanded={estadoOpen}
            >
              Cambiar Estado
              <ChevronDown size={16} />
            </button>

            {estadoOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg z-50 overflow-hidden">
                {ESTADOS.map((est) => (
                  <button
                    key={est}
                    onClick={() => handleCambiarEstado(est)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          est === 'Confirmado'
                            ? 'bg-green-500'
                            : est === 'Pendiente'
                            ? 'bg-amber-500'
                            : est === 'En Curso'
                            ? 'bg-blue-500'
                            : est === 'Finalizado'
                            ? 'bg-gray-400'
                            : 'bg-red-500'
                        }`}
                      />
                      {est}
                    </span>
                    {est === evento.estado && (
                      <Check size={14} className="text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón Editar */}
          <Button variant="secondary" onClick={openEdit}>
            <Pencil size={16} />
            Editar
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Cliente
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {evento.cliente}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Fecha del Evento
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatFecha(evento.fecha)}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <MapPin size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Lugar asignado
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {evento.lugar}
            </p>
          </div>
        </Card>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Costos */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Costos Desglosados
            </h2>
            <div className="space-y-3">
              {evento.costos.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
                >
                  <span className="text-sm text-gray-600 dark:text-slate-300">
                    {c.concepto}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCosto(c.monto)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-gray-900 dark:border-slate-500">
              <span className="font-semibold text-gray-900 dark:text-white">
                Costo Total del Evento
              </span>
              <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                {formatCosto(totalCostos)}
              </span>
            </div>
          </Card>

          {/* Catering */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Servicio de Catering
            </h2>
            <div className="space-y-3">
              {evento.catering.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Utensils size={14} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {item.detalle}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCosto(item.precio)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Estado de Pago */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Estado de Pago
              </h2>
              <Badge variant="amber">{evento.pago.estado}</Badge>
            </div>

            <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-teal-600 rounded-full transition-all"
                style={{ width: `${evento.pago.porcentaje}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-4">
              <span>
                {formatCosto(evento.pago.pagado)} pagado (
                {evento.pago.porcentaje}%)
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                Total: {formatCosto(evento.pago.total)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                Próximo pago solicitado:
              </p>
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {formatCosto(evento.pago.proximoPago.monto)} —{' '}
                <span className="text-sm font-medium">
                  Vence {formatFecha(evento.pago.proximoPago.vence)}
                </span>
              </p>
            </div>
          </Card>

          {/* Historial */}
          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Historial de Cambios
            </h2>
            <ol className="relative space-y-4">
              {evento.historial.map((h, i) => (
                <li key={i} className="relative pl-6">
                  {i < evento.historial.length - 1 && (
                    <span className="absolute left-[5px] top-3 bottom-[-16px] w-px bg-gray-200 dark:bg-slate-700" />
                  )}
                  <span
                    className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 ${
                      i === 0
                        ? 'bg-teal-600 border-teal-600'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-0.5">
                    {formatFecha(h.fecha)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-slate-200">
                    {h.texto}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      {/* Modal Editar */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Evento"
        size="lg"
      >
        <form onSubmit={handleGuardarEdicion} className="space-y-4">
          <Input
            label="Nombre del evento"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            error={formErrors.nombre}
          />
          <Input
            label="Cliente"
            name="cliente"
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            error={formErrors.cliente}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha"
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              error={formErrors.fecha}
            />
            <Input
              label="Lugar asignado"
              name="lugar"
              value={form.lugar}
              onChange={(e) => setForm({ ...form, lugar: e.target.value })}
              error={formErrors.lugar}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}