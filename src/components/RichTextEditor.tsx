"use client";

import { useState, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, ImageLink, Youtube as YoutubeIcon, Undo, Redo, Link as LinkIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    mode?: 'full' | 'simple';
}

const MenuBar = ({ editor, mode }: { editor: Editor | null; mode: 'full' | 'simple' }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL de l\'image');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('URL de la vidéo YouTube');
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
            });
        }
    };
    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL du lien', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/20">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
                title="Gras"
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
                title="Italique"
            >
                <Italic className="w-4 h-4" />
            </Button>

            {mode === 'full' && (
                <>
                    <div className="w-[1px] h-8 bg-border mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                        title="Titre 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                        title="Titre 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
                        title="Titre 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </Button>

                    <div className="w-[1px] h-8 bg-border mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                        title="Liste à puces"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                        title="Liste ordonnée"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </Button>

                    <div className="w-[1px] h-8 bg-border mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addImage}
                        title="Insérer une image"
                    >
                        <ImageLink className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={setLink}
                        className={editor.isActive('link') ? 'bg-muted' : ''}
                        title="Ajouter un lien"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addYoutubeVideo}
                        title="Insérer une vidéo YouTube"
                    >
                        <YoutubeIcon className="w-4 h-4" />
                    </Button>
                </>
            )}

            <div className="w-[1px] h-8 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Annuler"
            >
                <Undo className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Rétablir"
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, mode = 'full' }: RichTextEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            ...(mode === 'full' ? [
                Image,
                Youtube.configure({
                    inline: false,
                    HTMLAttributes: {
                        class: 'rounded-xl shadow-lg border border-border w-full aspect-video',
                    },
                }),
                Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'text-primary underline font-medium cursor-pointer',
                    },
                }),
            ] : []),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert max-w-none ${mode === 'simple' ? 'min-h-[150px]' : 'min-h-[400px]'} p-4 focus:outline-none`,
            },
        },
    });

    if (!mounted) {
        return (
            <div className={`w-full ${mode === 'simple' ? 'h-[200px]' : 'h-[450px]'} border border-border rounded-lg bg-card animate-pulse flex items-center justify-center text-muted-foreground`}>
                Chargement de l&apos;éditeur...
            </div>
        );
    }

    return (
        <div className="w-full border border-border rounded-lg overflow-hidden bg-card transition-all focus-within:ring-1 focus-within:ring-ring">
            <MenuBar editor={editor} mode={mode} />
            <EditorContent editor={editor} className="editor-content-youtube" />
        </div>
    );
}
