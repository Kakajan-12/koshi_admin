import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { FaBold, FaItalic, FaListOl, FaListUl, FaUnderline } from "react-icons/fa";
import React, { useEffect } from "react";

function ToolButton({
    active,
    label,
    onClick,
    children,
}: {
    active?: boolean;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`flex size-8 cursor-pointer items-center justify-center rounded-md text-sm transition-colors ${
                active ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
        >
            {children}
        </button>
    );
}

const headingValue = (editor: Editor) => {
    for (const level of [1, 2, 3] as const) {
        if (editor.isActive("heading", { level })) return String(level);
    }
    return "p";
};

const TipTap = ({ content, onChange }: { content: string; onChange: (val: string) => void }) => {
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content,
        editorProps: {
            attributes: { class: "focus:outline-none" },
        },
        immediatelyRender: false,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return <div className="h-[270px] animate-pulse rounded-lg border border-slate-300 bg-slate-50" />;

    return (
        <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
                <select
                    value={headingValue(editor)}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v === "p") editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 }).run();
                    }}
                    aria-label="Text style"
                    className="h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
                >
                    <option value="p">Paragraph</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                </select>
                <span className="mx-1 h-5 w-px bg-slate-200" />
                <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <FaBold />
                </ToolButton>
                <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <FaItalic />
                </ToolButton>
                <ToolButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <FaUnderline />
                </ToolButton>
                <span className="mx-1 h-5 w-px bg-slate-200" />
                <ToolButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <FaListUl />
                </ToolButton>
                <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <FaListOl />
                </ToolButton>
            </div>
            <EditorContent editor={editor} className="tiptap-content px-3 py-2.5" />
        </div>
    );
};

export default TipTap;
