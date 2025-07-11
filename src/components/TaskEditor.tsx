'use client';

import { useEffect, useState, RefObject } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { debounce } from 'lodash';
import { FileText, Trash2, Printer, ImageUp, X, Plus, Check, FilePlus2, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Popover from '@radix-ui/react-popover';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { ConfirmDeleteDialogRef } from './ConfirmDeleteDialog';
import { Resizable, ResizableProps } from 're-resizable';

interface TaskEditorProps {
  deleteDialogRef: RefObject<ConfirmDeleteDialogRef>;
}

export function TaskEditor({ deleteDialogRef }: TaskEditorProps) {
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

  // Ensure images are treated as an array
  const images = Array.isArray(selectedTask?.images) ? selectedTask.images : [];

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
      deleteDialogRef.current?.requestDelete(selectedTask.id);
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
            ${images ? images.map(img => `<img src="${img.url}" style="width: ${img.width || 500}px; max-width: 100%;" />`).join('') : ''}
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
        const newImage = { url: newImageUrl, width: 300, height: 200 }; // Default size
        const updatedImages = [...images, newImage];
        updateTask({ id: selectedTask.id, images: updatedImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!selectedTask) return;

    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onloadend = () => {
          const newImageUrl = reader.result as string;
          const newImage = { url: newImageUrl, width: 300, height: 200 }; // Default size
          const updatedImages = [...images, newImage];
          updateTask({ id: selectedTask.id, images: updatedImages });
        };
        reader.readAsDataURL(file);
        
        e.preventDefault(); 
      }
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    if (selectedTask) {
      const updatedImages = images.filter(img => img.url !== urlToRemove);
      updateTask({ id: selectedTask.id, images: updatedImages });
    }
  };

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
              <span className="text-lg mr-2">{selectedTask?.emoji || '🙂'}</span>
              Emoji
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={5} className="z-50">
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  if (selectedTask) {
                    updateTask({ id: selectedTask.id, emoji: emojiObject.emoji });
                  }
                }}
                emojiStyle={EmojiStyle.NATIVE}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <Button asChild variant="outline" className="h-10" disabled={!selectedTask}>
          <label className={`flex items-center justify-center gap-2 px-4 cursor-pointer text-muted-foreground transition-colors ${!selectedTask ? 'cursor-not-allowed opacity-50' : 'hover:text-foreground'}`}>
            <ImageUp className="h-4 w-4" />
            <span>Resim Ekle</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!selectedTask} />
          </label>
        </Button>
      </div>

      {/* Content Area */}
      {selectedTask ? (
        <div className="flex-1 flex flex-col overflow-y-auto p-6" onPaste={handlePaste}>
          {/* Header */}
          <div className="pb-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSave}
                className="w-full bg-transparent text-3xl font-bold focus:outline-none"
                autoFocus
              />
            ) : (
              <h1 onDoubleClick={handleTitleEdit} className="text-3xl font-bold cursor-pointer">{titleValue}</h1>
            )}
            <input
              type="text"
              placeholder="Kısa bir açıklama ekle..."
              value={description}
              onChange={handleDescriptionChange}
              className="w-full bg-transparent text-sm text-muted-foreground focus:outline-none mt-1"
            />
          </div>

          {/* Image Gallery */}
          {(images && images.length > 0) && (
            <div className="mb-6 flex flex-wrap gap-4">
              {images.map((image, index) => (
                <Resizable
                  key={index}
                  defaultSize={{
                    width: image.width || 300,
                    height: image.height || 200,
                  }}
                  onResizeStop={(e, direction, ref, d) => {
                    if (selectedTask) {
                      const updatedImages = images.map(img =>
                        img.url === image.url
                          ? { ...img, width: ref.offsetWidth, height: ref.offsetHeight }
                          : img
                      );
                      updateTask({ id: selectedTask.id, images: updatedImages });
                    }
                  }}
                  className="relative group border rounded-lg p-2"
                  minWidth={100}
                  minHeight={100}
                  maxWidth={800}
                  maxHeight={800}
                >
                  <img
                    src={image.url}
                    alt={`task-image-${index}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRemoveImage(image.url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Resizable>
              ))}
            </div>
          )}

          {/* Main Content Editor */}
          <textarea
            className="flex-1 w-full bg-transparent text-base focus:outline-none resize-none"
            placeholder="Notlarını buraya yaz..."
            value={content}
            onChange={handleContentChange}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <FileText className="h-12 w-12 mb-4" />
          <p className="text-xl">Lütfen düzenlemek için bir görev seçin.</p>
        </div>
      )}
    </div>
  );
} 