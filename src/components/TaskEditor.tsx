'use client';

import { useEffect, useState, RefObject, useCallback } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { debounce } from 'lodash';
import { FileText, Trash2, Printer, ImageUp, X, Plus, Check, FilePlus2, GitFork, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Popover from '@radix-ui/react-popover';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { ConfirmDeleteDialogRef } from './ConfirmDeleteDialog';
import { Resizable, ResizableProps } from 're-resizable';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import DOMPurify from 'isomorphic-dompurify';
import { TiptapToolbar } from './TiptapToolbar';
import ImageResizeView from './ImageResize';


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
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageResizeView);
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (selectedTask) {
        debouncedContentSave(html);
      }
    },
  });

  const debouncedContentSave = useCallback(
    debounce((newContent: string) => {
    if (selectedTask) {
        const sanitizedContent = DOMPurify.sanitize(newContent);
        updateTask({ id: selectedTask.id, content: sanitizedContent });
    }
    }, 1000),
    [selectedTask, updateTask]
  );

  const debouncedDescriptionSave = debounce((newDescription: string) => {
    if (selectedTask) {
      updateTask({ id: selectedTask.id, description: newDescription });
    }
  }, 1000);

  useEffect(() => {
    if (selectedTask && editor) {
      const currentContent = editor.getHTML();
      const newContent = selectedTask.content || '';
      if (currentContent !== newContent) {
        // Defer this command to prevent flushSync error during render
        setTimeout(() => {
          editor.commands.setContent(newContent);
        }, 0);
      }
      setDescription(selectedTask.description || '');
      setTitleValue(selectedTask.title);
      setIsEditingTitle(false);
    } else if (!selectedTask && editor) {
      editor.commands.clearContent();
      setDescription('');
      setTitleValue('');
    }
  }, [selectedTask, editor]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      debouncedContentSave.cancel();
    };
  }, [debouncedContentSave]);


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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    debouncedDescriptionSave(newDescription);
  };

  const handleAddPage = () => {
    const selectedTask = getSelectedTask();
    if (selectedTask) {
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
    if (!selectedTask || !editor) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedTask.title}</title>
            <style>
              body { font-family: sans-serif; }
              img { max-width: 100%; height: auto; }
              .prose { max-width: 80ch; }
            </style>
          </head>
          <body>
            <h1>${selectedTask.title}</h1>
            <div class="prose">${editor.getHTML()}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus(); // Focus on the new window is important for some browsers
      setTimeout(() => {
          printWindow.print();
          printWindow.close();
      }, 500);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageUrl = reader.result as string;
        editor.chain().focus().setImage({ src: newImageUrl }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isMounted) {
    return (
        <div className="h-full flex flex-col bg-background text-foreground relative items-center justify-center">
            <p>Yükleniyor...</p>
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
          variant="ghost"
          onClick={() => setIsToolbarOpen(!isToolbarOpen)}
          disabled={!selectedTask}
          size="default"
          className={isToolbarOpen ? 'bg-muted' : ''}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          ZMD
        </Button>
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
        <label htmlFor="image-upload" className="cursor-pointer">
            <Button variant="ghost" size="default" disabled={!selectedTask} asChild>
                <span>
                    <ImageUp className="h-4 w-4 mr-2" />
                    Resim Ekle
                </span>
            </Button>
            <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
          </label>
      </div>

      {selectedTask ? (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Title and Description */}
          <div className="p-4 border-b">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSave}
                  className="text-4xl font-bold bg-transparent outline-none w-full"
                autoFocus
              />
                <Button size="icon" variant="ghost" onClick={handleTitleSave}>
                  <Check className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleTitleCancel}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <h1
                className="text-4xl font-bold cursor-pointer"
                onClick={handleTitleEdit}
              >
                {selectedTask.title}
              </h1>
            )}
            <input
              type="text"
              placeholder="Kısa bir açıklama ekle..."
              value={description}
              onChange={handleDescriptionChange}
              className="mt-2 w-full bg-transparent text-muted-foreground italic outline-none"
            />
          </div>

          {/* Editor */}
          <div className="flex-1 p-4">
             {isToolbarOpen && <TiptapToolbar editor={editor} />}
             <EditorContent editor={editor} className="mt-2"/>
            </div>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <p>Başlamak için bir görev seçin veya yeni bir tane oluşturun.</p>
          </div>
        </div>
      )}
    </div>
  );
} 