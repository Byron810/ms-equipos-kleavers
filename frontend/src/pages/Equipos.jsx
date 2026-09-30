import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Eye, Search, Package, Filter } from 'lucide-react';
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

// 🚧 Cambiar a equiposService cuando APIM esté listo
import {
  mockGetEquipos as getEquipos,
  mockCreateEquipo as createEquipo,
  mockUpdateEquipo as updateEquipo,
  mockDeleteEquipo as deleteEquipo,
} from '../services/mockEquipos';

const CATEGORIAS = [
  'Video',
  'Audio',
  'Mobiliario',
  'Estructuras',
  'Iluminación',
  'Decoración',
];

const estadoVariants = {
  Disponible: 'green',
  'En Mantenimiento': 'red',
  Asignado: 'amber',
};

const emptyForm = {
  nombre: '',
  categoria: 'Video',
  cantidad: 0,
  disponible: 0,
  asignado: 0,
  estado: 'Disponible',
};

export default function Equipos() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState({ items: [], totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);

  // Filtros
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');

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
      const res = await getEquipos(page, pageSize, search, {
        categoria: filterCategoria,
        estado: filterEstado,
      });
      setData(res.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search, filterCategoria, filterEstado]);

  useEffect(() => {
    setPage(1);
  }, [search, filterCategoria, filterEstado]);

  const totalPages = Math.ceil(data.totalRecords / pageSize) || 1;

  const clearFilters = () => {
    setSearchInput('');
    setFilterCategoria('Todos');
    setFilterEstado('Todos');
    setPage(1);
  };

  const hasActiveFilters =
    searchInput || filterCategoria !== 'Todos' || filterEstado !== 'Todos';

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
      categoria: item.categoria,
      cantidad: item.cantidad,
      disponible: item.disponible,
      asignado: item.asignado,
      estado: item.estado,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (form.cantidad < 0) errors.cantidad = 'Debe ser positivo';
    if (form.disponible < 0) errors.disponible = 'Debe ser positivo';
    if (form.asignado < 0) errors.asignado = 'Debe ser positivo';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateEquipo(editing.id, form);
        toast.success('Equipo actualizado');
      } else {
        await createEquipo(form);
        toast.success('Equipo creado');
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
      await deleteEquipo(toDelete.id);
      toast.success('Equipo eliminado');
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
            Inventario de Equipos
          </h1>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} />
          Agregar Equipo
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
                placeholder="Buscar equipos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filtro Categoría */}
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Todos">Categoría: Todos</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Asignado">Asignado</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
            </select>

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
            icon={Package}
            title="No hay equipos"
            description={
              hasActiveFilters
                ? 'No se encontraron equipos con esos criterios.'
                : 'Comienza agregando tu primer equipo.'
            }
            action={
              !hasActiveFilters && (
                <Button onClick={openCreate}>
                  <Plus size={16} />
                  Agregar equipo
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
                      Nombre del Equipo
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Categoría
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Cantidad Total
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Disponible
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Asignado
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
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
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                        {item.cantidad}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            item.disponible === 0
                              ? 'text-red-500'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {item.disponible}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                        {item.asignado}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={estadoVariants[item.estado] || 'gray'}>
                          {item.estado}
                        </Badge>
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
                            onClick={() =>
                              toast.info(`Detalle: ${item.nombre}`)
                            }
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                    {item.categoria}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Total: {item.cantidad} · Disponibles:{' '}
                    <span
                      className={
                        item.disponible === 0
                          ? 'text-red-500 font-semibold'
                          : 'font-semibold'
                      }
                    >
                      {item.disponible}
                    </span>{' '}
                    · Asignados: {item.asignado}
                  </p>
                  <div className="flex justify-end gap-1 pt-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => toast.info(`Detalle: ${item.nombre}`)}
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
        title={editing ? 'Editar Equipo' : 'Agregar Equipo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del equipo"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            error={formErrors.nombre}
            placeholder="Ej. Proyector HD 4K"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Categoría
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Cantidad total"
              name="cantidad"
              type="number"
              min="0"
              value={form.cantidad}
              onChange={(e) =>
                setForm({ ...form, cantidad: Number(e.target.value) })
              }
              error={formErrors.cantidad}
            />
            <Input
              label="Disponible"
              name="disponible"
              type="number"
              min="0"
              value={form.disponible}
              onChange={(e) =>
                setForm({ ...form, disponible: Number(e.target.value) })
              }
              error={formErrors.disponible}
            />
            <Input
              label="Asignado"
              name="asignado"
              type="number"
              min="0"
              value={form.asignado}
              onChange={(e) =>
                setForm({ ...form, asignado: Number(e.target.value) })
              }
              error={formErrors.asignado}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Estado
            </label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>Disponible</option>
              <option>Asignado</option>
              <option>En Mantenimiento</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Guardar cambios' : 'Agregar equipo'}
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
          ¿Seguro que quieres eliminar el equipo{' '}
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