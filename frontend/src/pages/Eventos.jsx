import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Eye,
  Search,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { useDebounce } from '../hooks/useDebounce';

// 🚧 Cambiar a eventosService cuando APIM esté listo
import {
  mockGetEventos as getEventos,
  mockCreateEvento as createEvento,
  mockUpdateEvento as updateEvento,
  mockDeleteEvento as deleteEvento,
} from '../services/mockEventos';

const estadoVariants = {
  Confirmado: 'green',
  Pendiente: 'amber',
  'En Curso': 'blue',
  Finalizado: 'gray',
  Cancelado: 'red',
};

const emptyForm = {
  nombre: '',
  cliente: '',
  fecha: '',
  estado: 'Pendiente',
  costo: 0,
};

// Formatea número a €X.XXX
const formatCosto = (n) =>
  '€' + Number(n).toLocaleString('es-ES', { minimumFractionDigits: 0 });

// Formatea ISO a "15 Nov 2026"
const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function Eventos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState({ items: [], totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);

  // Filtros
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterMes, setFilterMes] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Abre el modal si viene ?nuevo=true
  useEffect(() => {
    if (searchParams.get('nuevo') === 'true') {
      setEditing(null);
      setForm(emptyForm);
      setFormErrors({});
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEventos(page, pageSize, search, {
        estado: filterEstado,
        mes: filterMes,
      });
      setData(res.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search, filterEstado, filterMes]);

  useEffect(() => {
    setPage(1);
  }, [search, filterEstado, filterMes]);

  const totalPages = Math.ceil(data.totalRecords / pageSize) || 1;

  const clearFilters = () => {
    setSearchInput('');
    setFilterEstado('Todos');
    setFilterMes('');
    setPage(1);
  };

  const hasActiveFilters =
    searchInput || filterEstado !== 'Todos' || filterMes;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      cliente: item.cliente,
      fecha: item.fecha,
      estado: item.estado,
      costo: item.costo || 0,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!form.cliente.trim()) errors.cliente = 'El cliente es obligatorio';
    if (!form.fecha) errors.fecha = 'La fecha es obligatoria';
    if (form.costo < 0) errors.costo = 'Debe ser positivo';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateEvento(editing.id, form);
        toast.success('Evento actualizado');
      } else {
        await createEvento(form);
        toast.success('Evento creado');
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {} finally {
      setSaving(false);
    }
  };

  const openDelete = (item) => {
    setToDelete(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEvento(toDelete.id);
      toast.success('Evento eliminado');
      setDeleteOpen(false);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else fetchData();
    } catch (err) {} finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Eventos
          </h1>
        </div>
        <Button onClick={() => navigate('/eventos/crear')}>
          <Plus size={18} />
          Nuevo Evento
        </Button>
      </div>

      {/* Card principal */}
      <Card className="overflow-hidden">
        {/* Barra de filtros */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Curso">En Curso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            {/* Filtro Mes */}
            <input
              type="month"
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Filter size={14} />
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <Spinner className="py-12" />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No hay eventos"
            description={
              hasActiveFilters
                ? 'No se encontraron eventos con esos criterios.'
                : 'Comienza creando tu primer evento.'
            }
            action={
              !hasActiveFilters && (
                <Button onClick={() => navigate('/eventos/crear')}>
                  <Plus size={16} />
                  Crear evento
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">
                      Nombre del Evento
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Costo Total
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {data.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {item.nombre}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                        {item.cliente}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                        {formatFecha(item.fecha)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={estadoVariants[item.estado] || 'gray'}>
                          {item.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {formatCosto(item.costo)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300"
                            aria-label="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/eventos/${item.id}`)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300"
                            aria-label="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
              {data.items.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.nombre}
                    </p>
                    <Badge variant={estadoVariants[item.estado] || 'gray'}>
                      {item.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {item.cliente} · {formatFecha(item.fecha)}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCosto(item.costo)}
                  </p>
                  <div className="flex justify-end gap-1 pt-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/eventos/${item.id}`)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={data.totalRecords}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar Evento' : 'Nuevo Evento'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del evento"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            error={formErrors.nombre}
            placeholder="Ej. Boda García-López"
          />
          <Input
            label="Cliente"
            name="cliente"
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            error={formErrors.cliente}
            placeholder="Ej. Lucía García"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option>Pendiente</option>
                <option>Confirmado</option>
                <option>En Curso</option>
                <option>Finalizado</option>
                <option>Cancelado</option>
              </select>
            </div>
          </div>
          <Input
            label="Costo total (€)"
            name="costo"
            type="number"
            min="0"
            value={form.costo}
            onChange={(e) =>
              setForm({ ...form, costo: Number(e.target.value) })
            }
            error={formErrors.costo}
            placeholder="0"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
          ¿Seguro que quieres eliminar el evento{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            "{toDelete?.nombre}"
          </span>
          ? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}