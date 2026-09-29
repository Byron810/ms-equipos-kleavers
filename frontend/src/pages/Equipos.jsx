import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
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

const emptyForm = { nombre: '', categoria: '', cantidad: 0, disponible: 0, estado: 'Activo' };

export default function Equipos() {
  const [data, setData] = useState({ items: [], totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEquipos(page, pageSize, search);
      setData(res.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.ceil(data.totalRecords / pageSize) || 1;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ nombre: item.nombre, categoria: item.categoria, cantidad: item.cantidad, disponible: item.disponible, estado: item.estado });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!form.categoria.trim()) errors.categoria = 'La categoría es obligatoria';
    if (form.cantidad < 0) errors.cantidad = 'Debe ser positivo';
    if (form.disponible < 0) errors.disponible = 'Debe ser positivo';
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

  const openDelete = (item) => { setToDelete(item); setDeleteOpen(true); };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Inventario de equipos disponibles.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} />
          Nuevo Equipo
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <Spinner className="py-12" />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No hay equipos"
            description={search ? 'No se encontraron equipos con esos criterios.' : 'Comienza agregando tu primer equipo.'}
            action={!search && <Button onClick={openCreate}><Plus size={16} />Crear equipo</Button>}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium">Categoría</th>
                    <th className="text-left px-4 py-3 font-medium">Cantidad</th>
                    <th className="text-left px-4 py-3 font-medium">Disponible</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.nombre}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.categoria}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.cantidad}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${item.disponible === 0 ? 'text-red-500' : 'text-gray-700 dark:text-slate-200'}`}>
                          {item.disponible}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.estado === 'Activo' ? 'green' : item.estado === 'Mantenimiento' ? 'amber' : 'gray'}>
                          {item.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300" aria-label="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => openDelete(item)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400" aria-label="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
              {data.items.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{item.nombre}</p>
                    <Badge variant={item.estado === 'Activo' ? 'green' : item.estado === 'Mantenimiento' ? 'amber' : 'gray'}>
                      {item.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{item.categoria}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-500">
                    Total: {item.cantidad} · Disponibles: <span className={item.disponible === 0 ? 'text-red-500 font-medium' : ''}>{item.disponible}</span>
                  </p>
                  <div className="flex justify-end gap-1 pt-2">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => openDelete(item)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} totalRecords={data.totalRecords} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar Equipo' : 'Nuevo Equipo'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={formErrors.nombre} placeholder="Ej. Proyector HD" />
          <Input label="Categoría" name="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} error={formErrors.categoria} placeholder="Ej. Audiovisual" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cantidad total" name="cantidad" type="number" min="0" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} error={formErrors.cantidad} />
            <Input label="Disponibles" name="disponible" type="number" min="0" value={form.disponible} onChange={(e) => setForm({ ...form, disponible: Number(e.target.value) })} error={formErrors.disponible} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option>Activo</option>
              <option>Mantenimiento</option>
              <option>Inactivo</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear equipo'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
          ¿Seguro que quieres eliminar el equipo <span className="font-semibold text-gray-900 dark:text-white">"{toDelete?.nombre}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}