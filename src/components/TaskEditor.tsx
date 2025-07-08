'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Image } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { debounce } from '@/lib/utils';

export function TaskEditor() {
  const { 
    getSelectedTask, 
    addTask, 
    updateTask, 
    deleteTask, 
    selectedTaskId 
  } = useTaskStore();
  
  const selectedTask = getSelectedTask();
  const [content, setContent] = useState('');

  // Auto-save content with debounce
  const debouncedSave = debounce((newContent: string) => {
    if (selectedTask) {
      updateTask({ id: selectedTask.id, content: newContent });
    }
  }, 2000);

  useEffect(() => {
    if (selectedTask) {
      setContent(selectedTask.content || '');
    } else {
      setContent('');
    }
  }, [selectedTask]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleAddPage = () => {
    addTask({
      title: 'Yeni Başlık',
      content: '',
      parentId: null,
      level: 1,
    });
  };

  const handleAddSubPage = () => {
    if (!selectedTask) return;
    
    addTask({
      title: 'Yeni Alt Başlık',
      content: '',
      parentId: selectedTask.id,
      level: selectedTask.level + 1,
    });
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    
    if (confirm('Bu görevi ve tüm alt görevlerini silmek istediğinizden emin misiniz?')) {
      deleteTask(selectedTask.id);
    }
  };

  const handlePrint = () => {
    if (!selectedTask) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedTask.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              .content { margin-top: 20px; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${selectedTask.title}</h1>
            <div class="content">${selectedTask.content || 'İçerik bulunmuyor'}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Placeholder for image upload functionality
      console.log('Image upload:', file.name);
      // TODO: Implement image upload to server/storage
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="toolbar">
        <button
          onClick={handleAddPage}
          className="toolbar-button primary"
          title="Yeni Sayfa Ekle"
        >
          <FileText className="h-4 w-4 mr-2" />
          Sayfa Ekle
        </button>
        
        <button
          onClick={handleAddSubPage}
          disabled={!selectedTask}
          className="toolbar-button"
          title="Alt Sayfa Ekle"
        >
          <Plus className="h-4 w-4 mr-2" />
          Alt Sayfa Ekle
        </button>
        
        <button
          onClick={handleDeleteTask}
          disabled={!selectedTask}
          className="toolbar-button danger"
          title="Seçili Sayfayı Sil"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Sil
        </button>
        
        <button
          onClick={handlePrint}
          disabled={!selectedTask}
          className="toolbar-button"
          title="Yazdır"
        >
          <Printer className="h-4 w-4 mr-2" />
          Yazdır
        </button>

        <div className="flex-1" />

        <label className="toolbar-button cursor-pointer">
          <Image className="h-4 w-4 mr-2" />
          Resim Yükle
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedTask ? (
          <>
            {/* Task Title */}
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTask.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Level {selectedTask.level} • Son güncelleme: {' '}
                {new Intl.DateTimeFormat('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(selectedTask.updatedAt)}
              </p>
            </div>

            {/* Content Editor */}
            <div className="flex-1 p-4">
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="İçerik yazın..."
                className="w-full h-full resize-none border-none outline-none text-gray-900 placeholder-gray-400"
                style={{ minHeight: '400px' }}
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Görev Seçin</h3>
              <p className="text-sm">
                Sol panelden bir görev seçin veya yeni görev oluşturun
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 