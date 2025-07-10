'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';

export interface ConfirmDeleteDialogRef {
  requestDelete: (id: string) => void;
}

export const ConfirmDeleteDialog = forwardRef<ConfirmDeleteDialogRef, {}>((props, ref) => {
  const { deleteTask, tasks } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string, title: string } | null>(null);
  const [deleteConfirmationEnabled, setDeleteConfirmation] = useState(true);

  const requestDelete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (deleteConfirmationEnabled) {
        setTaskToDelete({ id: task.id, title: task.title });
        setIsOpen(true);
      } else {
        deleteTask(id);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    requestDelete
  }));
  
  const handleConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
    }
    setIsOpen(false);
    setTaskToDelete(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTaskToDelete(null);
  };
  
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 data-[state=open]:animate-fade-in fixed inset-0 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-[90vw] max-w-md data-[state=open]:animate-fade-in">
          <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Görevi Silmeyi Onayla
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            &quot;{taskToDelete?.title || ''}&quot; görevini ve tüm alt görevlerini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              İptal
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Evet, Sil
            </button>
          </div>

          <Dialog.Close asChild>
            <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Kapat">
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

ConfirmDeleteDialog.displayName = "ConfirmDeleteDialog"; 