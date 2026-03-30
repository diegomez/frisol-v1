import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/auth.store';
import { HelpZone } from '../../../shared/components/HelpZone';
import { symptomsService } from '../../diagnostico/services/symptoms.service';
import { causasService } from '../../causas/services/causas.service';
import { kpisService } from '../../impacto/services/kpis.service';
import { ProjectProgress } from '../../dashboard/types/project.types';
import { Symptom } from '../../diagnostico/types/symptom.types';
import { Causa } from '../../causas/types/causa.types';
import { Kpi } from '../../impacto/types/kpi.types';
import { projectsService } from '../../dashboard/services/projects.service';
import api from '../../../shared/api/axios';

const pageNames: Record<string, string> = {
  cliente: 'Cliente',
  diagnostico: 'Diagnóstico',
  evidencia: 'Evidencia',
  vozDolor: 'Voz del Dolor',
  causas: 'Análisis de Causas',
  impacto: 'Impacto',
};

export function Page7Cierre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState<'terminado' | 'cerrado' | 'rechazar' | 'reabrir' | null>(null);

  // Fetch all data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.findById(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: progress } = useQuery({
    queryKey: ['project-progress', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}/progress`);
      return data as ProjectProgress;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: ['symptoms', id],
    queryFn: () => symptomsService.findAll(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: causas = [] } = useQuery({
    queryKey: ['causas', id],
    queryFn: () => causasService.findAll(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['kpis', id],
    queryFn: () => kpisService.findAll(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Estado mutations
  const terminarMutation = useMutation({
    mutationFn: () => api.patch(`/projects/${id}/estado`, { estado: 'terminado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowConfirm(null);
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: () => api.patch(`/projects/${id}/estado`, { estado: 'cerrado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowConfirm(null);
    },
  });

  const rechazarMutation = useMutation({
    mutationFn: () => api.patch(`/projects/${id}/estado`, { estado: 'en_progreso' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowConfirm(null);
    },
  });

  const handleExportPdf = async () => {
    try {
      const response = await api.get(`/projects/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `frisol-${project?.nombre_proyecto || 'proyecto'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (projectLoading || !project) {
    return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  }

  const allGreen = progress && Object.values(progress).every((s) => s === 'green');
  const notGreenPages = progress
    ? Object.entries(progress)
        .filter(([, s]) => s !== 'green')
        .map(([k]) => pageNames[k] || k)
    : [];

  const canTerminar =
    user?.role === 'csm' && project.csm_id === user.id && project.estado === 'en_progreso' && allGreen;
  const canCerrar = user?.role === 'po' && project.estado === 'terminado';
  const canRechazar = user?.role === 'po' && project.estado === 'terminado';
  const canExportPdf = project.estado === 'cerrado';

  return (
    <div>
      <HelpZone
        title="Resumen del Proyecto"
        description="Este es el resumen de toda la información cargada. Revisá que todo esté correcto antes de marcar como terminado."
        examples={[
          'Verificá que todos los síntomas tengan los 6 campos completos',
          'Confirmá que las causas tengan los 3 porqués mínimos y un origen',
          'Revisá que los KPIs tengan nombre, valor actual y valor objetivo',
        ]}
      />

      {/* Project Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Estado del proyecto</h3>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                project.estado === 'en_progreso'
                  ? 'bg-orange-100 text-orange-800'
                  : project.estado === 'terminado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {project.estado === 'en_progreso'
                ? 'En Progreso'
                : project.estado === 'terminado'
                  ? 'Terminado'
                  : 'Cerrado'}
            </span>
            {/* Audit trail */}
            {project.terminado_user && (
              <p className="text-xs text-gray-500 mt-1">
                Terminado por: <strong>{project.terminado_user.name}</strong> — {new Date(project.terminado_at).toLocaleString('es-AR')}
              </p>
            )}
            {project.cerrado_user && (
              <p className="text-xs text-gray-500 mt-1">
                Cerrado por: <strong>{project.cerrado_user.name}</strong> — {new Date(project.cerrado_at).toLocaleString('es-AR')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {canTerminar && (
              <button
                onClick={() => setShowConfirm('terminado')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Marcar como Terminado
              </button>
            )}
            {canCerrar && (
              <button
                onClick={() => setShowConfirm('cerrado')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
              >
                Marcar como Cerrado
              </button>
            )}
            {canRechazar && (
              <button
                onClick={() => setShowConfirm('rechazar')}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                Volver a En Progreso
              </button>
            )}
            {canExportPdf && (
              <button
                onClick={handleExportPdf}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
              >
                📄 Exportar PDF
              </button>
            )}
            {project.estado === 'en_progreso' && (user?.role === 'csm' || user?.role === 'po') && (
              <button
                onClick={() => {
                  if (confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) {
                    api.delete(`/projects/${id}`).then(() => navigate('/dashboard'));
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                🗑️ Eliminar proyecto
              </button>
            )}
            {project.estado === 'cerrado' && user?.role === 'admin' && (
              <button
                onClick={() => setShowConfirm('reabrir')}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                🔄 Reabrir proyecto
              </button>
            )}
          </div>
        </div>

        {/* Blocking pages warning */}
        {project.estado === 'en_progreso' && !allGreen && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Para marcar como terminado, todas las secciones deben estar en verde:
            </p>
            <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
              {notGreenPages.map((page) => (
                <li key={page}>{page}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Summary Sections */}
      <div className="space-y-6">
        {/* 1. Cliente */}
        <SummarySection
          title="1. Cliente"
          status={progress?.cliente || 'red'}
          onEdit={() => navigate(`/projects/${id}/1-cliente`)}
          editable={project.estado === 'en_progreso'}
        >
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">ID Interno:</dt>
            <dd className="text-gray-900 font-mono">{project.internal_id || '—'}</dd>
            <dt className="text-gray-500">Nombre del cliente:</dt>
            <dd className="text-gray-900">{project.nombre_cliente || '—'}</dd>
            <dt className="text-gray-500">Nombre del proyecto:</dt>
            <dd className="text-gray-900">{project.nombre_proyecto || '—'}</dd>
            <dt className="text-gray-500">ID CRM:</dt>
            <dd className="text-gray-900">{project.crm_id || '—'}</dd>
            <dt className="text-gray-500">Tribu:</dt>
            <dd className="text-gray-900">{project.tribe?.name || '—'}</dd>
            <dt className="text-gray-500">Fecha de inicio:</dt>
            <dd className="text-gray-900">{project.fecha_inicio || '—'}</dd>
            <dt className="text-gray-500">Interlocutores:</dt>
            <dd className="text-gray-900 whitespace-pre-wrap">{project.interlocutores || '—'}</dd>
          </dl>
        </SummarySection>

        {/* 2. Diagnóstico */}
        <SummarySection
          title="2. Diagnóstico 5WTH"
          status={progress?.diagnostico || 'red'}
          onEdit={() => navigate(`/projects/${id}/2-diagnostico`)}
          editable={project.estado === 'en_progreso'}
        >
          {symptoms.length === 0 ? (
            <p className="text-sm text-gray-500">No hay síntomas cargados.</p>
          ) : (
            <div className="space-y-3">
              {symptoms.map((s: Symptom, i: number) => {
                const isComplete = s.what && s.who && s.when_field && s.where_field && s.how && s.declaration;
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-md text-sm ${isComplete ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                      <span className="font-medium">Síntoma #{i + 1}</span>
                    </div>
                    {s.what && <p><strong>Qué:</strong> {s.what}</p>}
                    {s.who && <p><strong>Quién:</strong> {s.who}</p>}
                    {s.when_field && <p><strong>Cuándo:</strong> {s.when_field}</p>}
                    {s.where_field && <p><strong>Dónde:</strong> {s.where_field}</p>}
                    {s.how && <p><strong>Cómo:</strong> {s.how}</p>}
                    {s.declaration && <p><strong>Declaración:</strong> {s.declaration}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </SummarySection>

        {/* 3. Evidencia */}
        <SummarySection
          title="3. Evidencia"
          status={progress?.evidencia || 'red'}
          onEdit={() => navigate(`/projects/${id}/3-evidencia`)}
          editable={project.estado === 'en_progreso'}
        >
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {project.evidencia || 'No hay datos cargados.'}
          </p>
        </SummarySection>

        {/* 4. Voz del Dolor */}
        <SummarySection
          title="4. Voz del Dolor"
          status={progress?.vozDolor || 'red'}
          onEdit={() => navigate(`/projects/${id}/4-voz-dolor`)}
          editable={project.estado === 'en_progreso'}
        >
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {project.voz_dolor || 'No hay datos cargados.'}
          </p>
        </SummarySection>

        {/* 5. Análisis de Causas */}
        <SummarySection
          title="5. Análisis de Causas"
          status={progress?.causas || 'red'}
          onEdit={() => navigate(`/projects/${id}/5-causas`)}
          editable={project.estado === 'en_progreso'}
        >
          {causas.length === 0 ? (
            <p className="text-sm text-gray-500">No hay causas cargadas.</p>
          ) : (
            <div className="space-y-3">
              {causas.map((c: Causa & { root_cause: string }, i: number) => {
                const hasMinWhys = c.why_1 && c.why_2 && c.why_3;
                const hasOrigin = c.origin_metodo || c.origin_maquina || c.origin_gobernanza;
                const isComplete = hasMinWhys && hasOrigin;
                const origins = [
                  c.origin_metodo && 'Método',
                  c.origin_maquina && 'Máquina',
                  c.origin_gobernanza && 'Gobernanza',
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-md text-sm ${isComplete ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                      <span className="font-medium">Causa #{i + 1}</span>
                    </div>
                    {c.why_1 && <p><strong>Por qué 1:</strong> {c.why_1}</p>}
                    {c.why_2 && <p><strong>Por qué 2:</strong> {c.why_2}</p>}
                    {c.why_3 && <p><strong>Por qué 3:</strong> {c.why_3}</p>}
                    {c.why_4 && <p><strong>Por qué 4:</strong> {c.why_4}</p>}
                    {c.why_5 && <p><strong>Por qué 5:</strong> {c.why_5}</p>}
                    <p className="mt-1">
                      <strong>Causa raíz:</strong>{' '}
                      <span className="text-purple-700">{c.root_cause}</span>
                    </p>
                    {origins && <p><strong>Origen:</strong> {origins}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </SummarySection>

        {/* 6. Impacto */}
        <SummarySection
          title="6. Impacto y Business Case"
          status={progress?.impacto || 'red'}
          onEdit={() => navigate(`/projects/${id}/6-impacto`)}
          editable={project.estado === 'en_progreso'}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Impacto en el negocio:</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {project.impacto_negocio || 'No hay datos cargados.'}
              </p>
            </div>
            {kpis.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">KPIs:</p>
                <div className="space-y-1">
                  {kpis.map((k: Kpi, i: number) => (
                    <div key={k.id} className="text-sm flex items-center gap-2">
                      <span className="font-medium">#{i + 1}</span>
                      <span>{k.nombre}</span>
                      <span className="text-gray-500">| Actual: {k.valor_actual}</span>
                      <span className="text-gray-500">&rarr; Objetivo: {k.valor_objetivo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SummarySection>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => navigate(`/projects/${id}/6-impacto`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          &larr; Anterior
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showConfirm === 'terminado'
                ? '¿Marcar como Terminado?'
                : showConfirm === 'cerrado'
                  ? '¿Marcar como Cerrado?'
                  : showConfirm === 'reabrir'
                    ? '¿Reabrir proyecto?'
                    : '¿Volver a En Progreso?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {showConfirm === 'terminado'
                ? 'Una vez marcado como terminado, el CSM no podrá editar la información. El PO podrá revisarlo y cerrarlo o devolverlo.'
                : showConfirm === 'cerrado'
                  ? 'El proyecto se cerrará definitivamente y se entregará al equipo de desarrollo.'
                  : showConfirm === 'reabrir'
                    ? 'El proyecto volverá a estado "En Progreso". El CSM podrá editar la información nuevamente. Se limpiarán los datos de auditoría de terminado y cerrado.'
                    : 'El proyecto volverá a estado "En Progreso" y el CSM podrá editar la información nuevamente.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (showConfirm === 'terminado') terminarMutation.mutate();
                  else if (showConfirm === 'cerrado') cerrarMutation.mutate();
                  else rechazarMutation.mutate(); // rechazar and reabrir both go to en_progreso
                }}
                disabled={terminarMutation.isPending || cerrarMutation.isPending || rechazarMutation.isPending}
                className={`px-4 py-2 text-white rounded-md ${
                  showConfirm === 'terminado'
                    ? 'bg-green-600 hover:bg-green-700'
                    : showConfirm === 'cerrado'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {terminarMutation.isPending || cerrarMutation.isPending || rechazarMutation.isPending
                  ? 'Procesando...'
                  : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Summary Section Component
function SummarySection({
  title,
  status,
  onEdit,
  editable,
  children,
}: {
  title: string;
  status: string;
  onEdit: () => void;
  editable: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              status === 'green' ? 'bg-green-500' : status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        {editable && (
          <button onClick={onEdit} className="text-sm text-blue-600 hover:text-blue-800">
            Editar
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}