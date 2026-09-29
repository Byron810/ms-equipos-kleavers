import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
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

// 🚧 Cambiar a clientesService cuando APIM esté listo
import {
  mockGetClientes as getClientes,
  mockCreateCliente as createCliente,
  mockUpdateCliente as updateCliente,
  mockDeleteCliente as deleteCliente,
} from '../services/mockClientes';

const emptyForm = { nombre: '', email: '', telefono: '', empresa: '', estado: 'Activo' };

export default function Clientes() {
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
      const res = await getClientes(page, pageSize, search);
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
    setForm({ nombre: item.nombre, email: item.email, telefono: item.telefono, empresa: item.empresa, estado: item.estado });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) errors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email inválido';
    if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCliente(editing.id, form);
        toast.success('Cliente actualizado');
      } else {
        await createCliente(form);
        toast.success('Cliente creado');
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
      await deleteCliente(toDelete.id);
      toast.success('Cliente eliminado');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Gestiona la cartera de clientes.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} />
          Nuevo Cliente
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
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <Spinner className="py-12" />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay clientes"
            description={search ? 'No se encontraron clientes con esos criterios.' : 'Comienza agregando tu primer cliente.'}
            action={!search && <Button onClick={openCreate}><Plus size={16} />Crear cliente</Button>}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                    <th className="text-left px-4 py-3 font-medium">Empresa</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.nombre}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.email}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.telefono}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.empresa}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.estado === 'Activo' ? 'green' : 'gray'}>{item.estado}</Badge>
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
                    <Badge variant={item.estado === 'Activo' ? 'green' : 'gray'}>{item.estado}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{item.email}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-500">{item.telefono} · {item.empresa}</p>
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
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={formErrors.nombre} placeholder="Ej. Familia García" />
          <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} placeholder="cliente@example.com" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Teléfono" name="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} error={formErrors.telefono} placeholder="+506 8888-8888" />
            <Input label="Empresa" name="empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Ej. BBVA" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear cliente'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
          ¿Seguro que quieres eliminar el cliente <span className="font-semibold text-gray-900 dark:text-white">"{toDelete?.nombre}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}