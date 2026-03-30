import { useState, useRef, useEffect } from 'react';
import { Causa, CreateCausaDto } from '../types/causa.types';

interface CausaFormProps {
  causa?: Causa;
  onSave: (data: CreateCausaDto) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const whyLabels = [
  '¿Por qué 1?',
  '¿Por qué 2?',
  '¿Por qué 3? (mínimo)',
  '¿Por qué 4? (opcional)',
  '¿Por qué 5? (opcional)',
];

const whyPlaceholders = [
  'Ej: Porque el sistema no tiene cache de consultas',
  'Ej: Porque nunca se implementó cache al diseñar la arquitectura',
  'Ej: Porque no había requerimiento de performance en el proyecto original',
  'Ej: Porque el cliente no sabía que necesitaba performance',
  '',
];

export function CausaForm({ causa, onSave, onDelete, onCancel, isSaving }: CausaFormProps) {
  const [form, setForm] = useState<CreateCausaDto>({
    why_1: causa?.why_1 || '',
    why_2: causa?.why_2 || '',
    why_3: causa?.why_3 || '',
    why_4: causa?.why_4 || '',
    why_5: causa?.why_5 || '',
    origin_metodo: causa?.origin_metodo || false,
    origin_maquina: causa?.origin_maquina || false,
    origin_gobernanza: causa?.origin_gobernanza || false,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (causa) {
      setForm({
        why_1: causa.why_1,
        why_2: causa.why_2,
        why_3: causa.why_3,
        why_4: causa.why_4 || '',
        why_5: causa.why_5 || '',
        origin_metodo: causa.origin_metodo,
        origin_maquina: causa.origin_maquina,
        origin_gobernanza: causa.origin_gobernanza,
      });
    }
  }, [causa]);

  const handleChange = (field: keyof CreateCausaDto, value: string | boolean) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);

    // Auto-save for existing causas
    if (causa) {
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

  const hasMinWhys = form.why_1.trim() && form.why_2.trim() && form.why_3.trim();
  const hasOrigin = form.origin_metodo || form.origin_maquina || form.origin_gobernanza;
  const isComplete = hasMinWhys && hasOrigin;
  const hasAtLeastOne = form.why_1.trim() || form.why_2.trim() || form.why_3.trim() || form.why_4?.trim() || form.why_5?.trim() || hasOrigin;

  const rootCausePreview = form.why_5?.trim() || form.why_4?.trim() || form.why_3?.trim() || '';

  return (
    <div className={`border rounded-lg p-4 ${
      isComplete ? 'border-green-300 bg-green-50'
      : hasAtLeastOne ? 'border-yellow-300 bg-yellow-50'
      : 'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {causa ? 'Editar causa' : 'Nueva causa'}
          {isComplete && <span className="ml-2 text-green-600">✓ Completa</span>}
          {!isComplete && <span className="ml-2 text-yellow-600">⚠ Incompleta</span>}
        </h3>
        <div className="flex gap-2">
          {onDelete && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm">
              Eliminar
            </button>
          )}
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">
            {causa ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>

      {/* 5 Whys */}
      <div className="space-y-3 mb-4">
        {['why_1', 'why_2', 'why_3', 'why_4', 'why_5'].map((field, i) => {
          const isRequired = i < 3;
          return (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {whyLabels[i]} {isRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={form[field as keyof CreateCausaDto] as string}
                onChange={(e) => handleChange(field as keyof CreateCausaDto, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={whyPlaceholders[i]}
              />
            </div>
          );
        })}
      </div>

      {/* Root Cause Preview */}
      {rootCausePreview && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
          <label className="block text-xs font-medium text-purple-700 mb-1">
            🎯 Causa raíz final sistémica (auto)
          </label>
          <p className="text-sm text-purple-900">{rootCausePreview}</p>
        </div>
      )}

      {/* Origins */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Origen (selección múltiple) <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {[
            { key: 'origin_metodo', label: 'Método' },
            { key: 'origin_maquina', label: 'Máquina' },
            { key: 'origin_gobernanza', label: 'Gobernanza' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key as keyof CreateCausaDto] as boolean}
                onChange={(e) => handleChange(key as keyof CreateCausaDto, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        {!hasOrigin && (
          <p className="text-xs text-red-500 mt-1">Seleccioná al menos un origen</p>
        )}
      </div>

      {/* Save button for NEW causas only */}
      {!causa && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveNew}
            disabled={!hasAtLeastOne || isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : 'Guardar causa'}
          </button>
        </div>
      )}

      {isSaving && causa && (
        <div className="mt-2 text-xs text-yellow-600">Guardando...</div>
      )}
    </div>
  );
}
