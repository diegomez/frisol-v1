import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/auth.store';
import { projectsService } from '../services/projects.service';
import { Layout } from '../../../shared/components/Layout';
import api from '../../../shared/api/axios';

const stateColors: Record<string, { bg: string; text: string; label: string }> = {
  en_progreso: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En Progreso' },
  terminado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminado' },
  cerrado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cerrado' },
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
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'mine'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mis proyectos
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos los proyectos
            </button>
          </div>
        )}

        {/* Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600">{counters.en_progreso}</div>
            <div className="text-sm text-orange-800">En Progreso</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{counters.terminado}</div>
            <div className="text-sm text-green-800">Terminados</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-600">{counters.cerrado}</div>
            <div className="text-sm text-gray-800">Cerrados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar por cliente o proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tribu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const state = stateColors[project.estado];
                  const canEdit = project.estado === 'en_progreso' &&
                    (user?.role === 'po' || (user?.role === 'csm' && project.csm_id === user.id));

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {project.internal_id || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {project.progress ? (
                          <div className="flex gap-1">
                            {Object.values(project.progress).map((status, i) => (
                              <span
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  status === 'green' ? 'bg-green-500'
                                  : status === 'yellow' ? 'bg-yellow-500'
                                  : 'bg-red-500'
                                }`}
                                title={Object.keys(project.progress!)[i]}
                              />
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {project.nombre_proyecto || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">{project.csm_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.nombre_cliente || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.tribe_name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.fecha_inicio || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${state.bg} ${state.text}`}>
                          {state.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => navigate(`/projects/${project.id}/7-cierre`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/projects/${project.id}/1-cliente`)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Editar
                          </button>
                        )}
                        {project.estado === 'en_progreso' && (user?.role === 'csm' || user?.role === 'po') && (
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        )}
                        {project.estado === 'cerrado' && (
                          <button
                            onClick={() => handleExportPdf(project.id, project.nombre_proyecto || 'proyecto')}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            PDF
                          </button>
                        )}
                        {project.estado === 'cerrado' && user?.role === 'admin' && (
                          <button
                            onClick={() => handleReopen(project.id)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Reabrir
                          </button>
                        )}
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