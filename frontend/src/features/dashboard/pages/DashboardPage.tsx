import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/auth.store';
import { projectsService } from '../services/projects.service';
import { Layout } from '../../../shared/components/Layout';
import api from '../../../shared/api/axios';

const stateColors: Record<string, { bg: string; text: string; label: string }> = {
  en_progreso: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'En Progreso' },
  terminado: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Terminado' },
  cerrado: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Cerrado' },
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', filter],
    queryFn: () => projectsService.findAll(filter),
  });

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${project.id}/1-cliente`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: (projectId: string) => api.patch(`/projects/${projectId}/estado`, { estado: 'en_progreso' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleDelete = (projectId: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(projectId);
    }
  };

  const handleReopen = (projectId: string) => {
    if (confirm('¿Reabrir este proyecto? Volverá a estado "En Progreso".')) {
      reopenMutation.mutate(projectId);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = !search ||
        (p.nombre_cliente?.toLowerCase().includes(search.toLowerCase())) ||
        (p.nombre_proyecto?.toLowerCase().includes(search.toLowerCase())) ||
        (p.internal_id?.toLowerCase().includes(search.toLowerCase())) ||
        (p.tribe_name?.toLowerCase().includes(search.toLowerCase()));
      const matchesState = stateFilter === 'all' || p.estado === stateFilter;
      return matchesSearch && matchesState;
    });
  }, [projects, search, stateFilter]);

  const counters = useMemo(() => ({
    en_progreso: projects.filter(p => p.estado === 'en_progreso').length,
    terminado: projects.filter(p => p.estado === 'terminado').length,
    cerrado: projects.filter(p => p.estado === 'cerrado').length,
  }), [projects]);

  const handleExportPdf = async (projectId: string, projectName: string) => {
    try {
      const response = await api.get(`/projects/${projectId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `frisol-${projectName || 'proyecto'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title + New Project */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          {user?.role === 'csm' && (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creando...' : '+ Nuevo proyecto'}
            </button>
          )}
        </div>

        {/* Filter Toggle (CSM only) */}
        {user?.role === 'csm' && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'mine'
                  ? 'bg-primary text-white shadow-card'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Mis proyectos
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-card'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Todos los proyectos
            </button>
          </div>
        )}

        {/* Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-headline text-on-surface">{counters.en_progreso}</div>
              <div className="text-xs text-on-surface-variant font-medium">En Progreso</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-headline text-on-surface">{counters.terminado}</div>
              <div className="text-xs text-on-surface-variant font-medium">Terminados</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-headline text-on-surface">{counters.cerrado}</div>
              <div className="text-xs text-on-surface-variant font-medium">Cerrados</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar por cliente, proyecto, ID o tribu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 input-field"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value="en_progreso">En Progreso</option>
            <option value="terminado">Terminados</option>
            <option value="cerrado">Cerrados</option>
          </select>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Cargando proyectos...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay proyectos</div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Progreso</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Proyecto</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Tribu</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Inicio</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const canEdit = project.estado === 'en_progreso' &&
                    (user?.role === 'po' || (user?.role === 'csm' && project.csm_id === user.id));

                  return (
                    <tr key={project.id} className="hover:bg-surface-container-low/40 transition-colors border-t border-outline-variant/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-on-surface-variant">
                        {project.internal_id || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {project.progress ? (
                          <div className="flex gap-1">
                            {Object.values(project.progress).map((status, i) => (
                              <span
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  status === 'green' ? 'bg-emerald-500'
                                  : status === 'yellow' ? 'bg-amber-500'
                                  : 'bg-red-400'
                                }`}
                                title={Object.keys(project.progress!)[i]}
                              />
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-on-surface">
                          {project.nombre_proyecto || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-on-surface-variant">{project.csm_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                        {project.nombre_cliente || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                        {project.tribe_name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                        {project.fecha_inicio || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={stateColors[project.estado].bg + ' ' + stateColors[project.estado].text + ' badge'}>
                          {stateColors[project.estado].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => navigate(`/projects/${project.id}/7-cierre`)}
                          className="text-primary hover:text-primary-container font-semibold transition-colors"
                        >
                          Ver
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/projects/${project.id}/1-cliente`)}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        {project.estado === 'en_progreso' && (user?.role === 'csm' || user?.role === 'po') && (
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                        {project.estado === 'cerrado' && user?.role === 'admin' && (
                          <button
                            onClick={() => handleReopen(project.id)}
                            className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                          >
                            Reabrir
                          </button>
                        )}
                        <button
                          onClick={() => handleExportPdf(project.id, project.nombre_proyecto || 'proyecto')}
                          className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}