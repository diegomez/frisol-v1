import { useState, useRef, useEffect } from 'react';
import { Symptom, CreateSymptomDto } from '../types/symptom.types';

interface SymptomFormProps {
  symptom?: Symptom;
  onSave: (data: CreateSymptomDto) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const fieldLabels: Record<keyof CreateSymptomDto, string> = {
  what: '¿Qué sucede?',
  who: '¿Quién está involucrado?',
  when_field: '¿Cuándo ocurre?',
  where_field: '¿Dónde pasa?',
  how: '¿Cómo se manifiesta?',
  declaration: 'Declaración del síntoma',
};

const fieldPlaceholders: Record<keyof CreateSymptomDto, string> = {
  what: 'Ej: El sistema se cae cuando hay más de 50 usuarios simultáneos',
  who: 'Ej: Equipo de ventas, clientes premium',
  when_field: 'Ej: Todos los lunes a las 9am, durante cierre de mes',
  where_field: 'Ej: Módulo de facturación, servidor de reportes',
  how: 'Ej: Timeout de 30 segundos, error 500 en pantalla',
  declaration: 'Ej: El módulo de facturación colapsa en horas pico causando pérdida de ventas',
};

export function SymptomForm({ symptom, onSave, onDelete, onCancel, isSaving }: SymptomFormProps) {
  const [form, setForm] = useState<CreateSymptomDto>({
    what: symptom?.what || '',
    who: symptom?.who || '',
    when_field: symptom?.when_field || '',
    where_field: symptom?.where_field || '',
    how: symptom?.how || '',
    declaration: symptom?.declaration || '',
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (symptom) {
      setForm({
        what: symptom.what,
        who: symptom.who,
        when_field: symptom.when_field,
        where_field: symptom.where_field,
        how: symptom.how,
        declaration: symptom.declaration,
      });
    }
  }, [symptom]);

  const handleChange = (field: keyof CreateSymptomDto, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);

    // Auto-save for existing symptoms
    if (symptom) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave(newForm);
      }, 500);
    }
  };

  const hasAtLeastOne = Object.values(form).some(v => v.trim());
  const isComplete = Object.values(form).every(v => v.trim());

  const handleSaveNew = () => {
    if (hasAtLeastOne) {
      onSave(form);
    }
  };
  const fields = (Object.keys(fieldLabels) as Array<keyof CreateSymptomDto>);

  return (
    <div className={`border rounded-lg p-4 ${
      isComplete ? 'border-green-300 bg-green-50'
      : hasAtLeastOne ? 'border-yellow-300 bg-yellow-50'
      : 'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {symptom ? 'Editar síntoma' : 'Nuevo síntoma'}
          {isComplete && <span className="ml-2 text-green-600">✓ Completo</span>}
          {!isComplete && <span className="ml-2 text-yellow-600">⚠ Incompleto</span>}
        </h3>
        <div className="flex gap-2">
          {onDelete && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm">
              Eliminar
            </button>
          )}
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">
            {symptom ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {fieldLabels[field]} <span className="text-red-500">*</span>
            </label>
            {field === 'declaration' ? (
              <textarea
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={fieldPlaceholders[field]}
              />
            ) : (
              <input
                type="text"
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={fieldPlaceholders[field]}
              />
            )}
          </div>
        ))}
      </div>

      {/* Save button for NEW symptoms only */}
      {!symptom && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveNew}
            disabled={!hasAtLeastOne || isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : 'Guardar síntoma'}
          </button>
        </div>
      )}

      {isSaving && symptom && (
        <div className="mt-2 text-xs text-yellow-600">Guardando...</div>
      )}
    </div>
  );
}
