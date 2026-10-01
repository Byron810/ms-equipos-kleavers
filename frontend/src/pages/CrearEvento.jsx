import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  AlertCircle,
  Minus,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { createEvento } from "../services/eventosService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

// 🚧 Datos mock de equipos (más adelante vendrán de APIM)
const EQUIPOS_DISPONIBLES = [
  {
    id: 1,
    nombre: "Proyector Epson HD",
    categoria: "AUDIOVISUAL",
    disponible: 2,
    total: 3,
  },
  {
    id: 2,
    nombre: "Sistema de Sonido Line Array",
    categoria: "AUDIOVISUAL",
    disponible: 2,
    total: 3,
  },
  {
    id: 3,
    nombre: "Mesa Redonda 1.8m",
    categoria: "MOBILIARIO",
    disponible: 40,
    total: 50,
  },
  {
    id: 4,
    nombre: "Carpas Impermeables 6×6",
    categoria: "ESTRUCTURA",
    disponible: 0,
    total: 10,
  },
  {
    id: 5,
    nombre: "Foco LED RGB Escenario",
    categoria: "ILUMINACIÓN",
    disponible: 12,
    total: 20,
  },
  {
    id: 6,
    nombre: "Escenario Modular 4×3",
    categoria: "ESTRUCTURA",
    disponible: 1,
    total: 4,
  },
  {
    id: 7,
    nombre: "Sillas de Boda Tiffany",
    categoria: "MOBILIARIO",
    disponible: 100,
    total: 200,
  },
  {
    id: 8,
    nombre: "Set de Decoración Floral",
    categoria: "DECORACIÓN",
    disponible: 5,
    total: 8,
  },
];

const STEPS = [
  { id: 1, label: "Cliente y Detalles" },
  { id: 2, label: "Equipos" },
  { id: 3, label: "Cotización y Resumen" },
];

const emptyForm = {
  nombre: "",
  cliente: "",
  fecha: "",
  ubicacion: "",
  estado: "Pendiente",
};

export default function CrearEvento() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [seleccion, setSeleccion] = useState({}); // { [equipoId]: cantidad }
  const [saving, setSaving] = useState(false);

  // Cálculo del total simulado (precio ficticio por unidad)
  const preciosUnitarios = {
    1: 250,
    2: 400,
    3: 15,
    4: 120,
    5: 45,
    6: 800,
    7: 8,
    8: 180,
  };

  const totalCotizacion = useMemo(() => {
    return Object.entries(seleccion).reduce((acc, [id, cant]) => {
      return acc + (preciosUnitarios[id] || 0) * cant;
    }, 0);
  }, [seleccion]);

  const formatCosto = (n) =>
    "€" + Number(n).toLocaleString("es-ES", { minimumFractionDigits: 0 });

  /* ========= Validaciones por paso ========= */
  const validateStep1 = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!form.cliente.trim()) errors.cliente = "El cliente es obligatorio";
    if (!form.fecha) errors.fecha = "La fecha es obligatoria";
    if (!form.ubicacion.trim())
      errors.ubicacion = "La ubicación es obligatoria";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    if (Object.keys(seleccion).length === 0) {
      toast.warning("Selecciona al menos un equipo para continuar");
      return false;
    }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  /* ========= Selección de equipos ========= */
  const updateCantidad = (equipoId, delta, max) => {
    setSeleccion((prev) => {
      const actual = prev[equipoId] || 0;
      const nueva = Math.max(0, Math.min(actual + delta, max));
      const copy = { ...prev };
      if (nueva === 0) delete copy[equipoId];
      else copy[equipoId] = nueva;
      return copy;
    });
  };

  /* ========= Submit final (real: POST /eventos) ========= */
  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createEvento({
        nombreEvento: form.nombre,
        clienteNombre: form.cliente,
        fecha: form.fecha,
        lugar: form.ubicacion,
        estado: form.estado,
        equiposAsignados: Object.keys(seleccion).map(Number),
        montoTotal: totalCotizacion,
      });
      toast.success("Evento creado correctamente");
      navigate("/eventos");
    } catch (err) {
      toast.error("Error al crear el evento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Evento
          </h1>
        </div>
        {form.fecha && (
          <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg">
            <Calendar size={16} />
            Fecha del evento:{" "}
            <span className="font-semibold">
              {new Date(form.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Stepper */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition
                      ${
                        isComplete
                          ? "bg-teal-600 text-white"
                          : isActive
                            ? "bg-teal-600 text-white"
                            : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                      }
                    `}
                  >
                    {isComplete ? <Check size={16} /> : s.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      isActive || isComplete
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-2 ${
                      step > s.id
                        ? "bg-teal-600"
                        : "bg-gray-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ============ PASO 1: Cliente y Detalles ============ */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cliente y Detalles
          </h2>
          <div className="space-y-4">
            <Input
              label="Nombre del evento *"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={formErrors.nombre}
              placeholder="Ej. Boda García-López"
            />
            <Input
              label="Cliente *"
              name="cliente"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              error={formErrors.cliente}
              placeholder="Ej. Lucía García"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha del evento *"
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                error={formErrors.fecha}
              />
              <Input
                label="Ubicación *"
                name="ubicacion"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm({ ...form, ubicacion: e.target.value })
                }
                error={formErrors.ubicacion}
                placeholder="Ej. San José"
              />
            </div>
          </div>
        </Card>
      )}

      {/* ============ PASO 2: Equipos ============ */}
      {step === 2 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selección de Equipamientos *
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Asigne los recursos a inventariar necesarios para el evento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EQUIPOS_DISPONIBLES.map((eq) => {
              const cant = seleccion[eq.id] || 0;
              const agotado = eq.disponible === 0;
              const seleccionado = cant > 0;

              return (
                <div
                  key={eq.id}
                  className={`
                    relative rounded-xl border-2 p-4 transition
                    ${
                      agotado
                        ? "border-red-200 dark:border-red-900/50 opacity-60 bg-red-50/30 dark:bg-red-900/10"
                        : seleccionado
                          ? "border-teal-600 bg-teal-50/50 dark:bg-teal-900/10"
                          : "border-gray-200 dark:border-slate-700 hover:border-teal-400"
                    }
                  `}
                >
                  {/* Ícono + check */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300">
                      <Package size={18} />
                    </div>
                    {seleccionado && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 tracking-wider mb-1">
                    {eq.categoria}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                    {eq.nombre}
                  </p>

                  {agotado ? (
                    <Badge variant="red" className="text-[10px]">
                      NO DISPONIBLE
                    </Badge>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Disponible: {eq.disponible}
                    </p>
                  )}

                  {!agotado && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <button
                        onClick={() => updateCantidad(eq.id, -1, eq.disponible)}
                        disabled={cant === 0}
                        className="w-7 h-7 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Disminuir"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[24px] text-center">
                        {cant}
                      </span>
                      <button
                        onClick={() => updateCantidad(eq.id, 1, eq.disponible)}
                        disabled={cant >= eq.disponible}
                        className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Aumentar"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ============ PASO 3: Cotización y Resumen ============ */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumen de la Cotización
          </h2>

          {/* Info del evento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Evento
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {form.nombre}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Cliente
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {form.cliente}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Fecha
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {form.fecha &&
                  new Date(form.fecha + "T00:00:00").toLocaleDateString(
                    "es-ES",
                  )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Ubicación
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {form.ubicacion}
              </p>
            </div>
          </div>

          {/* Lista de equipos seleccionados */}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
            Equipos seleccionados
          </h3>
          <div className="space-y-2 mb-6">
            {Object.entries(seleccion).map(([id, cant]) => {
              const eq = EQUIPOS_DISPONIBLES.find((e) => e.id === Number(id));
              const precio = preciosUnitarios[id] || 0;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <Package
                        size={16}
                        className="text-gray-500 dark:text-slate-400"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {eq.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {cant} × {formatCosto(precio)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap ml-3">
                    {formatCosto(precio * cant)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
              <CheckCircle2 size={20} />
              <span className="font-semibold">Total estimado</span>
            </div>
            <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {formatCosto(totalCotizacion)}
            </p>
          </div>
        </Card>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={step === 1 ? () => navigate("/eventos") : prev}
        >
          <ChevronLeft size={16} />
          {step === 1 ? "Cancelar" : "Anterior"}
        </Button>

        {step < 3 ? (
          <Button onClick={next}>
            Siguiente
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={saving}>
            <Check size={16} />
            Crear Evento
          </Button>
        )}
      </div>
    </div>
  );
}
