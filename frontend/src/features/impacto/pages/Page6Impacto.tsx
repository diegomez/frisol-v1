import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpZone } from '../../../shared/components/HelpZone';
import { KpiForm } from '../components/KpiForm';
import { kpisService } from '../services/kpis.service';
import { CreateKpiDto, Kpi } from '../types/kpi.types';
import { useAuthStore } from '../../auth/store/auth.store';
import api from '../../../shared/api/axios';

function getKpiStatus(kpi: Kpi): 'complete' | 'incomplete' {
  return (kpi.nombre && kpi.valor_actual && kpi.valor_objetivo) ? 'complete' : 'incomplete';
}

function StatusDot({ status }: { status: 'complete' | 'incomplete' }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
      status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
    }`} />
  );
}

export function Page6Impacto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [savingKpiId, setSavingKpiId] = useState<string | null>(null);
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [showNewKpiForm, setShowNewKpiForm] = useState(false);

  // Fetch project directly for impacto text
  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
  const isEditable = project?.estado === 'en_progreso' && user?.role !== 'dev';

  const [impactoValue, setImpactoValue] = useState('');
  const [impactoStatus, setImpactoStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [impactoInitialized, setImpactoInitialized] = useState(false);

  useEffect(() => {
    if (project && !impactoInitialized) {
      setImpactoValue(project.impacto_negocio || '');
      setImpactoInitialized(true);
    }
  }, [project, impactoInitialized]);

  const handleImpactoChange = (value: string) => {
    setImpactoValue(value);
    setImpactoStatus('saving');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api.patch(`/projects/${id}/impacto`, { value })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['project', id] });
          queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
          setImpactoStatus('saved');
          setTimeout(() => setImpactoStatus('idle'), 2000);
        })
        .catch(() => setImpactoStatus('idle'));
    }, 500);
  };

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ['kpis', id],
    queryFn: () => kpisService.findAll(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateKpiDto) => kpisService.create(id!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSavingKpiId(null);
      setShowNewKpiForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ kpiId, dto }: { kpiId: string; dto: Partial<CreateKpiDto> }) =>
      kpisService.update(id!, kpiId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSavingKpiId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (kpiId: string) => kpisService.delete(id!, kpiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      if (editingKpiId) setEditingKpiId(null);
    },
  });

  const handleNewKpi = (dto: CreateKpiDto) => {
    setSavingKpiId('new');
    createMutation.mutate(dto);
  };

  const handleUpdateKpi = (kpiId: string, dto: CreateKpiDto) => {
    setSavingKpiId(kpiId);
    updateMutation.mutate({ kpiId, dto });
  };

  if (isLoading || !project) {
    return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  }

  return (
    <div>
      <HelpZone
        title="Impacto y Business Case"
        description="Describí cómo el problema afecta al negocio en términos de ingresos, eficiencia o riesgo. Luego cargá las métricas o KPIs que cuantifican el impacto."
        examples={[
          "Impacto: Pérdida estimada de $15,000/mes por demoras en facturación",
          "KPI: Tiempo de facturación | Actual: 45 min | Objetivo: 5 min",
          "KPI: Errores mensuales | Actual: 15 | Objetivo: 0",
        ]}
      />

      <div className="space-y-6">
        {/* Impact Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impacto en el negocio <span className="text-red-500">*</span>
          </label>
          <textarea
            value={impactoValue}
            onChange={(e) => isEditable && handleImpactoChange(e.target.value)}
            rows={5}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Describí cómo el problema afecta los ingresos, la eficiencia operativa o genera riesgo para el negocio..."
          />
          <div className="text-sm text-gray-500 mt-1">
            {impactoStatus === 'saving' && <span className="text-yellow-600">Guardando...</span>}
            {impactoStatus === 'saved' && <span className="text-green-600">✓ Guardado</span>}
          </div>
        </div>

        {/* KPIs List */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Métricas / KPIs <span className="text-red-500">*</span> (mínimo 1)
          </h3>

          {kpis.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
              <ul className="divide-y divide-gray-200">
                {kpis.map((kpi, index) => {
                  const status = getKpiStatus(kpi);
                  const isEditing = editingKpiId === kpi.id;

                  return (
                    <li key={kpi.id}>
                      <button
                        onClick={() => isEditable && setEditingKpiId(isEditing ? null : kpi.id)}
                        className={`w-full px-4 py-3 flex items-center text-left ${isEditable ? 'hover:bg-gray-50' : 'cursor-default'}`}
                      >
                        <StatusDot status={status} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">#{index + 1}</span>{' '}
                            {kpi.nombre || '(sin nombre)'}
                            {kpi.valor_actual && (
                              <span className="text-gray-500 ml-2">
                                Actual: {kpi.valor_actual} → Objetivo: {kpi.valor_objetivo}
                              </span>
                            )}
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
                          <KpiForm
                            kpi={kpi}
                            onSave={(dto) => handleUpdateKpi(kpi.id, dto)}
                            onDelete={() => deleteMutation.mutate(kpi.id)}
                            onCancel={() => setEditingKpiId(null)}
                            isSaving={savingKpiId === kpi.id}
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
          {kpis.length === 0 && !showNewKpiForm && (
            <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mb-3">
              {isEditable
                ? 'No hay KPIs cargados. Hacé clic en "Agregar KPI" para comenzar.'
                : 'No hay KPIs cargados.'}
            </div>
          )}

          {/* New KPI form */}
          {showNewKpiForm && isEditable && (
            <div className="mb-3">
              <KpiForm
                key={`new-kpi-${Date.now()}`}
                onSave={handleNewKpi}
                onCancel={() => setShowNewKpiForm(false)}
                isSaving={savingKpiId === 'new'}
              />
            </div>
          )}

          {/* Add button or warning */}
          {!showNewKpiForm && isEditable && (() => {
            const allComplete = kpis.every(k => getKpiStatus(k) === 'complete');
            if (kpis.length > 0 && !allComplete) {
              return (
                <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  Completá todos los KPIs existentes antes de agregar uno nuevo.
                </div>
              );
            }
            return (
              <button
                onClick={() => setShowNewKpiForm(true)}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
              >
                + Agregar KPI
              </button>
            );
          })()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => navigate(`/projects/${id}/5-causas`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Anterior
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/7-cierre`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
