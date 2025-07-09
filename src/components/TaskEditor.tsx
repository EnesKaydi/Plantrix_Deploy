'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { debounce } from 'lodash';
import { FileText, Trash2, Printer, ImageUp, X, Plus, Check, FilePlus2, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Popover from '@radix-ui/react-popover';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';


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
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-background">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Görev Seçilmedi</h3>
          <p className="text-sm">Görüntülemek için bir görev seçin veya yeni bir tane oluşturun.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground relative">
      {/* Toolbar */}
      <div className="flex items-center p-3 border-b bg-card gap-2">
        <Button onClick={handleAddPage} size="default">
          <FilePlus2 className="h-4 w-4 mr-2" />
          Sayfa Ekle
        </Button>
        <Button onClick={handleAddSubPage} variant="secondary" size="default" disabled={!selectedTask}>
          <GitFork className="h-4 w-4 mr-2" />
          Alt Sayfa Ekle
        </Button>
        <div className="flex-1" />
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={!selectedTask}
          size="default"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Sil
        </Button>
        <Button
          variant="ghost"
          onClick={handlePrint}
          disabled={!selectedTask}
          size="default"
        >
          <Printer className="h-4 w-4 mr-2" />
          Yazdır
        </Button>
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button variant="ghost" size="default" disabled={!selectedTask}>
              <span className="text-lg mr-2">{selectedTask.emoji || '🙂'}</span>
              Emoji
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={5} className="z-50">
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  updateTask({ id: selectedTask.id, emoji: emojiObject.emoji });
                }}
                emojiStyle={EmojiStyle.NATIVE}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <Button asChild variant="outline" className="h-32">
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <ImageUp className="h-6 w-6" />
            <span>Resim Ekle</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6">
        {/* Header */}
        <div className="pb-4">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSave}
              className="text-3xl font-bold hover:bg-muted/50 rounded-md px-2 py-1 -m-2 transition-colors cursor-pointer"
              autoFocus
            />
          ) : (
            <h2 className="text-3xl font-bold hover:bg-muted/50 rounded-md px-2 py-1 -m-2 transition-colors cursor-pointer" onClick={handleTitleEdit}>
              {selectedTask.title}
            </h2>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Seviye {selectedTask.level} • Son Güncelleme: {isMounted ? new Date(selectedTask.updatedAt).toLocaleString('tr-TR') : '...'}
          </p>
        </div>
        
        {/* Description Input */}
        <div className="mb-4">
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Kısa bir açıklama ekle..."
              className="w-full text-base bg-transparent p-2 -m-2 rounded-md border-none focus:outline-none focus:bg-muted/50 focus:ring-2 focus:ring-primary"
            />
        </div>
        
        {/* Image Gallery */}
        {selectedTask.imageUrls && selectedTask.imageUrls.length > 0 && (
          <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
            {selectedTask.imageUrls.map((url, index) => (
              <div key={index} className="relative group resizable-image-container w-[200px] h-[150px]">
                <img
                  src={url}
                  alt={`Uploaded content ${index + 1}`}
                  className="rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button asChild variant="outline" className="h-32">
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <ImageUp className="h-6 w-6" />
                <span>Resim Ekle</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </Button>
          </div>
        )}
        
        {/* Main Content Editor */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="İçerik eklemek için buraya yazın..."
            className="w-full h-full resize-none border-none outline-none bg-transparent text-foreground placeholder-muted-foreground"
            style={{ minHeight: '300px' }}
          />
        </div>
      </div>
    </div>
  );
} 