import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  WrapText,
} from 'lucide-react';
import { Button } from './ui/button';

type TiptapToolbarProps = {
  editor: Editor | null;
};

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 flex items-center gap-1 flex-wrap bg-card">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        title="Kalın"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        title="İtalik"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        title="Üstü Çizili"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="mx-2 h-6 w-px bg-border" />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size="sm"
        title="Başlık 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size="sm"
        title="Başlık 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size="sm"
        title="Başlık 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
       <div className="mx-2 h-6 w-px bg-border" />
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        title="Madde Listesi"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        title="Sıralı Liste"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="sm"
        title="Alıntı"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
        size="sm"
        title="Kod Bloğu"
      >
        <Code className="h-4 w-4" />
      </Button>
       <div className="mx-2 h-6 w-px bg-border" />
       <Button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        variant={'ghost'}
        size="sm"
        title="Formatı Temizle"
      >
        <WrapText className="h-4 w-4" />
      </Button>
    </div>
  );
} 