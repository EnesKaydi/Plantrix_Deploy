'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';

export function ConfirmDeleteDialog() {
  const {
    isConfirmDialogOpen,
    cancelDelete,
    confirmDelete,
    deleteConfirmationEnabled,
    setDeleteConfirmation,
    tasks,
    taskToDeleteId,
  } = useTaskStore();

  const task = tasks.find(t => t.id === taskToDeleteId);

  return (
    <Dialog.Root open={isConfirmDialogOpen} onOpenChange={cancelDelete}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 data-[state=open]:animate-fade-in fixed inset-0 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-[90vw] max-w-md data-[state=open]:animate-fade-in">
          <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Görevi Silmeyi Onayla
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            "{task?.title || ''}" görevini ve tüm alt görevlerini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Dialog.Description>
          
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="dont-ask-again"
              checked={!deleteConfirmationEnabled}
              onChange={(e) => setDeleteConfirmation(!e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="dont-ask-again" className="text-sm text-gray-600">
              Bir daha sorma
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Dialog.Close asChild>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
            </Dialog.Close>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Evet, Sil
            </button>
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Kapat">
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 