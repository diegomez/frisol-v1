import { useState, useRef, useEffect } from 'react';
import { Kpi, CreateKpiDto } from '../types/kpi.types';

interface KpiFormProps {
  kpi?: Kpi;
  onSave: (data: CreateKpiDto) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function KpiForm({ kpi, onSave, onDelete, onCancel, isSaving }: KpiFormProps) {
  const [form, setForm] = useState<CreateKpiDto>({
    nombre: kpi?.nombre || '',
    valor_actual: kpi?.valor_actual || '',
    valor_objetivo: kpi?.valor_objetivo || '',
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (kpi) {
      setForm({
        nombre: kpi.nombre,
        valor_actual: kpi.valor_actual,
        valor_objetivo: kpi.valor_objetivo,
      });
    }
  }, [kpi]);

  const handleChange = (field: keyof CreateKpiDto, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);

    // Auto-save for existing KPIs
    if (kpi) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave(newForm);
      }, 500);
    }
  };

  const handleSaveNew = () => {
    if (hasAtLeastOne) {
      onSave(form);
    }
  };

  const hasAtLeastOne = Object.values(form).some(v => v.trim());
  const isComplete = Object.values(form).every(v => v.trim());

  return (
    <div className={`border rounded-lg p-4 ${
      isComplete ? 'border-green-300 bg-green-50'
      : hasAtLeastOne ? 'border-yellow-300 bg-yellow-50'
      : 'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          {kpi ? 'Editar KPI' : 'Nuevo KPI'}
          {isComplete && <span className="ml-2 text-green-600">✓</span>}
          {!isComplete && <span className="ml-2 text-yellow-600">⚠</span>}
        </h4>
        <div className="flex gap-2">
          {onDelete && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm">
              Eliminar
            </button>
          )}
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">
            {kpi ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Tiempo de respuesta"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Valor actual <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.valor_actual}
            onChange={(e) => handleChange('valor_actual', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: 45 segundos"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Valor objetivo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.valor_objetivo}
            onChange={(e) => handleChange('valor_objetivo', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: 5 segundos"
          />
        </div>
      </div>

      {/* Save button for NEW KPIs only */}
      {!kpi && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveNew}
            disabled={!hasAtLeastOne || isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : 'Guardar KPI'}
          </button>
        </div>
      )}

      {isSaving && kpi && <div className="mt-2 text-xs text-yellow-600">Guardando...</div>}
    </div>
  );
}
