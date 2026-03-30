import { useEffect, useState, useRef } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HelpZone } from '../../../shared/components/HelpZone';
import { AttachmentsSection } from '../../attachments/components/AttachmentsSection';
import { useAuthStore } from '../../auth/store/auth.store';
import api from '../../../shared/api/axios';

interface ClienteForm {
  nombre_cliente: string;
  nombre_proyecto: string;
  crm_id: string;
  fecha_inicio: string;
  interlocutores: string;
  tribe_id: string;
}

export function Page1Cliente() {
  const { id } = useParams<{ id: string }>();
  const { project: outletProject } = useOutletContext<{ project: any }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch project directly to get fresh data
  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => { const { data } = await api.get(`/projects/${id}`); return data; },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    initialData: outletProject,
  });

  const isEditable = project?.estado === 'en_progreso' && user?.role !== 'dev';

  // Fetch tribes
  const { data: tribes = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['tribes'],
    queryFn: async () => { const { data } = await api.get('/tribes'); return data; },
  });

  const [form, setForm] = useState<ClienteForm>({
    nombre_cliente: '',
    nombre_proyecto: '',
    crm_id: '',
    fecha_inicio: '',
    interlocutores: '',
    tribe_id: '',
  });

  const [initialized, setInitialized] = useState(false);

  // Initialize form from project data
  useEffect(() => {
    if (project && !initialized) {
      setForm({
        nombre_cliente: project.nombre_cliente || '',
        nombre_proyecto: project.nombre_proyecto || '',
        crm_id: project.crm_id || '',
        fecha_inicio: project.fecha_inicio || '',
        interlocutores: project.interlocutores || '',
        tribe_id: project.tribe_id || '',
      });
      setInitialized(true);
    }
  }, [project, initialized]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveMutation = useMutation({
    mutationFn: (data: ClienteForm) => api.patch(`/projects/${id}/cliente`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project-progress', id] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      setSaveStatus('idle');
    },
  });

  const handleChange = (field: keyof ClienteForm, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    setSaveStatus('saving');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate(newForm);
    }, 500);
  };

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        saveMutation.mutate(form);
      }
    };
  }, []);

  return (
    <div>
      <HelpZone
        title="Descripción del Cliente"
        description="Cargá los datos básicos del cliente que visitaste. Esta información ayudará al equipo de desarrollo a entender el contexto del problema."
        examples={[
          "Cliente: 'TechCorp S.A.' — Empresa de software con 200 empleados",
          "Proyecto: 'Automatización de reportes financieros'",
          "CRM ID: 'OPP-2026-001234' — ID de la oportunidad en el CRM",
          "Interlocutores: 'Juan Pérez (CFO), María García (Controller)'",
        ]}
      />

      <div className="space-y-4">
        {/* Internal ID — read only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Interno
          </label>
          <input
            type="text"
            value={project.internal_id || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre_cliente}
            onChange={(e) => isEditable && handleChange('nombre_cliente', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ej: TechCorp S.A."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del proyecto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre_proyecto}
            onChange={(e) => isEditable && handleChange('nombre_proyecto', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ej: Automatización de reportes financieros"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID CRM <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.crm_id}
            onChange={(e) => isEditable && handleChange('crm_id', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ej: OPP-2026-001234"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tribu
          </label>
          <select
            value={form.tribe_id}
            onChange={(e) => isEditable && handleChange('tribe_id', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Sin tribu</option>
            {tribes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => isEditable && handleChange('fecha_inicio', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interlocutores
          </label>
          <textarea
            value={form.interlocutores}
            onChange={(e) => isEditable && handleChange('interlocutores', e.target.value)}
            disabled={!isEditable}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ej: Juan Pérez (CFO) — jperez@techcorp.com — +54 11 1234-5678"
          />
        </div>

        {/* Attachments */}
        <div className="border-t border-gray-100 pt-4">
          <AttachmentsSection projectId={id!} isEditable={isEditable} />
        </div>

        {/* Save Status */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {saveStatus === 'saving' && <span className="text-yellow-600">Guardando...</span>}
            {saveStatus === 'saved' && <span className="text-green-600">✓ Guardado</span>}
          </div>
          <button
            onClick={() => navigate(`/projects/${id}/2-diagnostico`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
