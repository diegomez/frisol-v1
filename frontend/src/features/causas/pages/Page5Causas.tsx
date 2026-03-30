import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpZone } from '../../../shared/components/HelpZone';
import { CausaForm } from '../components/CausaForm';
import { causasService } from '../services/causas.service';
import { CreateCausaDto, Causa } from '../types/causa.types';
import { useAuthStore } from '../../auth/store/auth.store';
import api from '../../../shared/api/axios';

function getCausaStatus(causa: Causa): 'complete' | 'incomplete' {
  const hasMinWhys = causa.why_1 && causa.why_2 && causa.why_3;
  const hasOrigin = causa.origin_metodo || causa.origin_maquina || causa.origin_gobernanza;
  return (hasMinWhys && hasOrigin) ? 'complete' : 'incomplete';
}

function StatusDot({ status }: { status: 'complete' | 'incomplete' }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
      status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
    }`} />
  );
}

export function Page5Causas() {
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

  const { data: causas = [], isLoading } = useQuery({
    queryKey: ['causas', id],
    queryFn: () => causasService.findAll(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateCausaDto) => causasService.create(id!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causas', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSavingId(null);
      setShowNewForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ causaId, dto }: { causaId: string; dto: Partial<CreateCausaDto> }) =>
      causasService.update(id!, causaId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causas', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSavingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (causaId: string) => causasService.delete(id!, causaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causas', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      if (editingId) setEditingId(null);
    },
  });

  const handleNewCausa = (dto: CreateCausaDto) => {
    setSavingId('new');
    createMutation.mutate(dto);
  };

  const handleUpdateCausa = (causaId: string, dto: CreateCausaDto) => {
    setSavingId(causaId);
    updateMutation.mutate({ causaId, dto });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando causas...</div>;
  }

  return (
    <div>
      <HelpZone
        title="Análisis de Causas — 5 Porqués"
        description="Usá la técnica de los 5 Porqués para llegar a la causa raíz del problema. Comenzá con el síntoma y preguntá '¿por qué?' sucesivamente. Mínimo 3 porqués, máximo 5. El último por qué llenado será la causa raíz final sistémica."
        examples={[
          "¿Por qué 1? El sistema se cae porque no tiene cache",
          "¿Por qué 2? No tiene cache porque nunca se diseñó con performance en mente",
          "¿Por qué 3? No se diseñó porque no había requerimiento de performance",
          "Causa raíz: Falta de requerimientos de performance en el diseño inicial",
          "Origen: Método (proceso de relevamiento incompleto)",
        ]}
      />

      <div className="space-y-4">
        {/* Causas List */}
        {causas.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Causas cargadas ({causas.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {causas.map((causa, index) => {
                const status = getCausaStatus(causa);
                const isEditing = editingId === causa.id;

                return (
                  <li key={causa.id}>
                    <button
                      onClick={() => isEditable && setEditingId(isEditing ? null : causa.id)}
                      className={`w-full px-4 py-3 flex items-center text-left ${isEditable ? 'hover:bg-gray-50' : 'cursor-default'}`}
                    >
                      <StatusDot status={status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          <span className="font-medium">#{index + 1}</span>{' '}
                          {causa.why_1 || '(sin descripción)'}
                        </p>
                      </div>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {status === 'complete' ? 'Completa' : 'Incompleta'}
                      </span>
                    </button>

                    {/* Expanded edit form */}
                    {isEditing && isEditable && (
                      <div className="px-4 pb-4">
                        <CausaForm
                          causa={causa}
                          onSave={(dto) => handleUpdateCausa(causa.id, dto)}
                          onDelete={() => deleteMutation.mutate(causa.id)}
                          onCancel={() => setEditingId(null)}
                          isSaving={savingId === causa.id}
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
        {causas.length === 0 && !showNewForm && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            {isEditable
              ? 'No hay causas cargadas. Hacé clic en "Agregar causa" para comenzar.'
              : 'No hay causas cargadas.'}
          </div>
        )}

        {/* New causa form */}
        {showNewForm && isEditable && (
          <CausaForm
            key={`new-causa-${Date.now()}`}
            onSave={handleNewCausa}
            onCancel={() => setShowNewForm(false)}
            isSaving={savingId === 'new'}
          />
        )}

        {/* Add button or warning */}
        {!showNewForm && isEditable && (() => {
          const allComplete = causas.every(c => getCausaStatus(c) === 'complete');
          if (causas.length > 0 && !allComplete) {
            return (
              <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                Completá todas las causas existentes antes de agregar una nueva.
              </div>
            );
          }
          return (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
            >
              + Agregar causa
            </button>
          );
        })()}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => navigate(`/projects/${id}/4-voz-dolor`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Anterior
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/6-impacto`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
