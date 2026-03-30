import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HelpZone } from './HelpZone';
import { useAuthStore } from '../../features/auth/store/auth.store';
import api from '../api/axios';

interface TextPageProps {
  title: string;
  fieldName: 'evidencia' | 'voz_dolor';
  helpTitle: string;
  helpDescription: string;
  helpExamples: string[];
  placeholder: string;
  prevPage: string;
  nextPage: string;
}

export function TextPage({
  title,
  fieldName,
  helpTitle,
  helpDescription,
  helpExamples,
  placeholder,
  prevPage,
  nextPage,
}: TextPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch project data directly to always get fresh data
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

  const [value, setValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [initialized, setInitialized] = useState(false);

  // Initialize value from project data when it loads
  useEffect(() => {
    if (project && !initialized) {
      setValue(project[fieldName] || '');
      setInitialized(true);
    }
  }, [project, fieldName, initialized]);

  const saveMutation = useMutation({
    mutationFn: (data: string) => api.patch(`/projects/${id}/${fieldName === 'voz_dolor' ? 'voz-dolor' : fieldName}`, { value: data }),
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

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setSaveStatus('saving');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate(newValue);
    }, 500);
  };

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        if (value.trim()) {
          saveMutation.mutate(value);
        }
      }
    };
  }, []);

  if (!project) {
    return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  }

  return (
    <div>
      <HelpZone
        title={helpTitle}
        description={helpDescription}
        examples={helpExamples}
      />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {title}
          </label>
          <textarea
            value={value}
            onChange={(e) => isEditable && handleChange(e.target.value)}
            rows={10}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder={placeholder}
          />
        </div>

        {/* Save Status + Navigation */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${id}/${prevPage}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Anterior
            </button>
            <div className="text-sm text-gray-500">
              {saveStatus === 'saving' && <span className="text-yellow-600">Guardando...</span>}
              {saveStatus === 'saved' && <span className="text-green-600">✓ Guardado</span>}
            </div>
          </div>
          <button
            onClick={() => navigate(`/projects/${id}/${nextPage}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
