import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import { projectsService } from '../../dashboard/services/projects.service';
import { Layout } from '../../../shared/components/Layout';
import { ProjectProgress } from '../../dashboard/types/project.types';

const pages = [
  { id: 1, name: 'Cliente', path: '1-cliente' },
  { id: 2, name: 'Diagnóstico', path: '2-diagnostico' },
  { id: 3, name: 'Evidencia', path: '3-evidencia' },
  { id: 4, name: 'Voz del Dolor', path: '4-voz-dolor' },
  { id: 5, name: 'Causas', path: '5-causas' },
  { id: 6, name: 'Impacto', path: '6-impacto' },
  { id: 7, name: 'Cierre', path: '7-cierre' },
];

const statusColors: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.findById(id!),
    enabled: !!id,
  });

  const { data: progress } = useQuery({
    queryKey: ['project-progress', id],
    queryFn: () => projectsService.getProgress(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  if (projectLoading) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">Cargando proyecto...</div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">Proyecto no encontrado</div>
      </Layout>
    );
  }

  const progressMap: Record<string, keyof ProjectProgress | null> = {
    '1-cliente': 'cliente',
    '2-diagnostico': 'diagnostico',
    '3-evidencia': 'evidencia',
    '4-voz-dolor': 'vozDolor',
    '5-causas': 'causas',
    '6-impacto': 'impacto',
    '7-cierre': null,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Project Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {project.nombre_proyecto || 'Nuevo proyecto'}
            </h2>
            <p className="text-sm text-gray-500">
              {project.nombre_cliente || 'Sin cliente'} — {pages.find(p => location.pathname.includes(p.path))?.name}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            {pages.map((page) => {
              const statusKey = progressMap[page.path];
              let status: string;
              if (statusKey) {
                status = progress?.[statusKey] || 'red';
              } else if (!progress) {
                status = 'red';
              } else {
                const values = Object.values(progress);
                status = values.every((s) => s === 'green')
                  ? 'green'
                  : values.some((s) => s === 'yellow')
                    ? 'yellow'
                    : 'red';
              }
              const isActive = location.pathname.includes(page.path);

              return (
                <button
                  key={page.id}
                  onClick={() => navigate(`/projects/${id}/${page.path}`)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${statusColors[status]}`} />
                  <span className={`text-xs ${isActive ? 'font-medium text-blue-700' : 'text-gray-600'}`}>
                    {page.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <Outlet context={{ project, progress }} />
        </div>
      </div>
    </Layout>
  );
}
