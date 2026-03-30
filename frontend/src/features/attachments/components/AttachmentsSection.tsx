import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Attachment } from '../types/attachment.types';
import { attachmentsService } from '../services/attachments.service';

interface AttachmentsSectionProps {
  projectId: string;
  isEditable: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function AttachmentsSection({ projectId, isEditable }: AttachmentsSectionProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', projectId],
    queryFn: () => attachmentsService.findAll(projectId),
    enabled: !!projectId,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      attachmentsService.upload(projectId, title, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', projectId] });
      setTitle('');
      setSelectedFile(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => attachmentsService.delete(projectId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', projectId] });
    },
  });

  const handleUpload = () => {
    if (title.trim() && selectedFile) {
      uploadMutation.mutate({ title: title.trim(), file: selectedFile });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-400">Cargando adjuntos...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Archivos adjuntos ({attachments.length})
        </label>
        {isEditable && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Agregar adjunto
          </button>
        )}
      </div>

      {/* Existing attachments list */}
      {attachments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
          <ul className="divide-y divide-gray-100">
            {attachments.map((att: Attachment) => (
              <li key={att.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{att.title}</p>
                    <p className="text-xs text-gray-500">
                      {att.original_name} · {formatFileSize(att.file_size)} · {formatDate(att.uploaded_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <a
                    href={attachmentsService.getDownloadUrl(projectId, att.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    download
                  >
                    Descargar
                  </a>
                  {isEditable && (
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar este adjunto?')) {
                          deleteMutation.mutate(att.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {attachments.length === 0 && !showForm && (
        <div className="text-center py-4 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg mb-3">
          No hay archivos adjuntos.
        </div>
      )}

      {/* Upload form */}
      {showForm && isEditable && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Captura del sistema actual"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Archivo <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={!title.trim() || !selectedFile || uploadMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? 'Subiendo...' : 'Subir adjunto'}
            </button>
            <button
              onClick={() => { setShowForm(false); setTitle(''); setSelectedFile(null); }}
              className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
