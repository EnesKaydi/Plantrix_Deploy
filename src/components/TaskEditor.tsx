'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Image as ImageIcon, Check, X } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { debounce } from '@/lib/utils';
import Image from 'next/image';

export function TaskEditor() {
  const { 
    tasks,
    getSelectedTask, 
    addTask, 
    updateTask, 
    deleteTask,
  } = useTaskStore();
  
  const selectedTask = getSelectedTask();
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const debouncedContentSave = debounce((newContent: string) => {
    if (selectedTask) {
      updateTask({ id: selectedTask.id, content: newContent });
    }
  }, 1000);

  const debouncedDescriptionSave = debounce((newDescription: string) => {
    if (selectedTask) {
      updateTask({ id: selectedTask.id, description: newDescription });
    }
  }, 1000);

  useEffect(() => {
    if (selectedTask) {
      setContent(selectedTask.content || '');
      setDescription(selectedTask.description || '');
      setTitleValue(selectedTask.title);
      setIsEditingTitle(false);
    } else {
      setContent('');
      setDescription('');
      setTitleValue('');
      setIsEditingTitle(false);
    }
  }, [selectedTask?.id]); // FIX: Depend only on the task ID

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTitleEdit = () => {
    if (!selectedTask) return;
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (!selectedTask || !titleValue.trim()) {
      handleTitleCancel();
      return;
    }
    updateTask({ id: selectedTask.id, title: titleValue.trim() });
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    if (selectedTask) setTitleValue(selectedTask.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedContentSave(newContent);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    debouncedDescriptionSave(newDescription);
  };

  const handleAddPage = () => {
    const selectedTask = getSelectedTask();
    if (selectedTask) {
      // Create a sibling to the selected task
      const parentId = selectedTask.parentId;
      const level = selectedTask.level;
      const orderIndex = tasks.filter(t => t.parentId === parentId).length;
      addTask({
        title: 'Yeni Sayfa',
        parentId,
        orderIndex,
        level,
      });
    } else {
      // Create a new top-level task if nothing is selected
      const orderIndex = tasks.filter(t => t.parentId === null).length;
      addTask({ title: 'Yeni Sayfa', parentId: null, orderIndex, level: 1 });
    }
  };

  const handleAddSubPage = () => {
    if (!selectedTask) return;
    const orderIndex = tasks.filter(t => t.parentId === selectedTask.id).length;
    addTask({ title: 'Yeni Alt Sayfa', parentId: selectedTask.id, orderIndex, level: selectedTask.level + 1 });
  };

  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
    }
  };

  const handlePrint = () => {
    if (!selectedTask) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${selectedTask.title}</title></head>
          <body>
            <h1>${selectedTask.title}</h1>
            ${selectedTask.imageUrls ? selectedTask.imageUrls.map(url => `<img src="${url}" style="max-width: 100%;" />`).join('') : ''}
            <div style="white-space: pre-wrap; margin-top: 20px;">${selectedTask.content || ''}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTask) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageUrl = reader.result as string;
        const updatedImageUrls = [...(selectedTask.imageUrls || []), newImageUrl];
        updateTask({ id: selectedTask.id, imageUrls: updatedImageUrls });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    if (selectedTask) {
      const updatedImageUrls = (selectedTask.imageUrls || []).filter(url => url !== urlToRemove);
      updateTask({ id: selectedTask.id, imageUrls: updatedImageUrls });
    }
  };

  if (!selectedTask) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Görev Seçilmedi</h3>
          <p className="text-sm">Görüntülemek için bir görev seçin veya yeni bir tane oluşturun.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={handleAddPage} className="toolbar-button primary" title="Yeni Ana Görev Ekle">
          <FileText className="h-4 w-4 mr-2" /> Sayfa Ekle
        </button>
        <button onClick={handleAddSubPage} disabled={!selectedTask} className="toolbar-button" title="Seçili Göreve Alt Sayfa Ekle">
          <Plus className="h-4 w-4 mr-2" /> Alt Sayfa Ekle
        </button>
        <button onClick={handleDelete} disabled={!selectedTask} className="toolbar-button danger" title="Seçili Sayfayı Sil">
          <Trash2 className="h-4 w-4 mr-2" /> Sil
        </button>
        <button onClick={handlePrint} disabled={!selectedTask} className="toolbar-button" title="Yazdır">
          <Printer className="h-4 w-4 mr-2" /> Yazdır
        </button>
        <div className="flex-1" />
        <label className={`toolbar-button cursor-pointer ${!selectedTask ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}>
          <ImageIcon className="h-4 w-4 mr-2" /> Resim Yükle
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={!selectedTask} className="hidden" />
        </label>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSave}
                className="text-xl font-semibold text-gray-900 bg-gray-100 rounded px-2 py-1 flex-1"
                autoFocus
              />
              <button onClick={handleTitleSave} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Kaydet"><Check size={18} /></button>
              <button onClick={handleTitleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="İptal"><X size={18} /></button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold" onClick={handleTitleEdit}>
              {selectedTask.title}
            </h2>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Seviye {selectedTask.level} • Son Güncelleme: {isMounted ? new Date(selectedTask.updatedAt).toLocaleString('tr-TR') : '...'}
          </p>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Sol panelde görünecek kısa açıklama..."
            className="w-full text-sm mt-2 p-2 bg-gray-100 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="p-6 flex-1">
          {selectedTask.imageUrls && selectedTask.imageUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedTask.imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Uploaded content ${index + 1}`}
                    className="rounded-lg object-cover w-full h-32"
                  />
                  <button
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="İçerik eklemek için buraya yazın..."
            className="w-full h-full resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
            style={{ minHeight: '300px' }}
          />
        </div>
      </div>
    </div>
  );
} 