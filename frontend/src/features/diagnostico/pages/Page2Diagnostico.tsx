import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpZone } from '../../../shared/components/HelpZone';
import { SymptomForm } from '../components/SymptomForm';
import { symptomsService } from '../services/symptoms.service';
import { CreateSymptomDto, Symptom } from '../types/symptom.types';
import { useAuthStore } from '../../auth/store/auth.store';
import api from '../../../shared/api/axios';

function getSymptomStatus(symptom: Symptom): 'complete' | 'incomplete' {
  const allFilled = symptom.what && symptom.who && symptom.when_field &&
    symptom.where_field && symptom.how && symptom.declaration;
  return allFilled ? 'complete' : 'incomplete';
}

function StatusDot({ status }: { status: 'complete' | 'incomplete' }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
      status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
    }`} />
  );
}

export function Page2Diagnostico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Check if editable
  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => { const { data } = await api.get(`/projects/${id}`); return data; },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
  const isEditable = project?.estado === 'en_progreso' && user?.role !== 'dev';

  const { data: symptoms = [], isLoading } = useQuery({
    queryKey: ['symptoms', id],
    queryFn: () => symptomsService.findAll(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSymptomDto) => symptomsService.create(id!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSavingId(null);
      setShowNewForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ symptomId, dto }: { symptomId: string; dto: Partial<CreateSymptomDto> }) =>
      symptomsService.update(id!, symptomId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSavingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (symptomId: string) => symptomsService.delete(id!, symptomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      if (editingId) setEditingId(null);
    },
  });

  const handleNewSymptom = (dto: CreateSymptomDto) => {
    setSavingId('new');
    createMutation.mutate(dto);
  };

  const handleUpdateSymptom = (symptomId: string, dto: CreateSymptomDto) => {
    setSavingId(symptomId);
    updateMutation.mutate({ symptomId, dto });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando síntomas...</div>;
  }

  return (
    <div>
      <HelpZone
        title="Diagnóstico 5WTH"
        description="Usá la técnica 5WTH para describir cada síntoma del problema. Cada campo es obligatorio para asegurar que el equipo de desarrollo reciba información completa."
        examples={[
          "Qué: El sistema se cae con 50+ usuarios",
          "Quién: Equipo de ventas y clientes premium",
          "Cuándo: Lunes a las 9am durante cierre de mes",
          "Dónde: Módulo de facturación",
          "Cómo: Timeout de 30s, error 500",
          "Declaración: El módulo de facturación colapsa en horas pico causando pérdida de ventas",
        ]}
      />

      <div className="space-y-4">
        {/* Symptoms List */}
        {symptoms.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Síntomas cargados ({symptoms.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {symptoms.map((symptom, index) => {
                const status = getSymptomStatus(symptom);
                const isEditing = editingId === symptom.id;

                return (
                  <li key={symptom.id}>
                    <button
                      onClick={() => isEditable && setEditingId(isEditing ? null : symptom.id)}
                      className={`w-full px-4 py-3 flex items-center text-left ${isEditable ? 'hover:bg-gray-50' : 'cursor-default'}`}
                    >
                      <StatusDot status={status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          <span className="font-medium">#{index + 1}</span>{' '}
                          {symptom.what || '(sin descripción)'}
                        </p>
                      </div>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {status === 'complete' ? 'Completo' : 'Incompleto'}
                      </span>
                    </button>

                    {/* Expanded edit form */}
                    {isEditing && isEditable && (
                      <div className="px-4 pb-4">
                        <SymptomForm
                          symptom={symptom}
                          onSave={(dto) => handleUpdateSymptom(symptom.id, dto)}
                          onDelete={() => deleteMutation.mutate(symptom.id)}
                          onCancel={() => setEditingId(null)}
                          isSaving={savingId === symptom.id}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {symptoms.length === 0 && !showNewForm && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            {isEditable
              ? 'No hay síntomas cargados. Hacé clic en "Agregar síntoma" para comenzar.'
              : 'No hay síntomas cargados.'}
          </div>
        )}

        {/* New symptom form */}
        {showNewForm && isEditable && (
          <SymptomForm
            key={`new-symptom-${Date.now()}`}
            onSave={handleNewSymptom}
            onCancel={() => setShowNewForm(false)}
            isSaving={savingId === 'new'}
          />
        )}

        {/* Add button or warning */}
        {!showNewForm && isEditable && (() => {
          const allComplete = symptoms.every(s => getSymptomStatus(s) === 'complete');
          if (symptoms.length > 0 && !allComplete) {
            return (
              <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                Completá todos los síntomas existentes antes de agregar uno nuevo.
              </div>
            );
          }
          return (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
            >
              + Agregar síntoma
            </button>
          );
        })()}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => navigate(`/projects/${id}/1-cliente`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Anterior
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/3-evidencia`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
