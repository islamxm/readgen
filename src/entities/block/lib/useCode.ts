import { useDocumentActions, useNodeSelection, useSelectionActions } from "@/hooks";
import type { MOMCode } from "@/mom/types";
import type { TextareaCodeEditorProps } from "@uiw/react-textarea-code-editor";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "@shared/lib";

const LANGUAGE_OPTIONS = [
  {
    value: "javascript",
    label: "JavaScript",
  },
  {
    value: "typescript",
    label: "TypeScript",
  },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "html", label: "HTML" },
  { value: "markdown", label: "Markdown" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sass", label: "Sass" },
  { value: "less", label: "Less" },
  { value: "json", label: "json" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Golang" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
  { value: "docker", label: "Docker" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "bash" },
  { value: "nginx", label: "nginx" },
  { value: "makefile", label: "Makefile" },
];

export function useCode(node: MOMCode) {
  const { updateNode } = useDocumentActions();
  const { isFocused } = useNodeSelection(node.id);
  const { blur } = useSelectionActions();
  const [language, setLanguage] = useState<string>((node as any).lang || "javascript");
  const ref = useRef<HTMLTextAreaElement>(null);
  const languageLabel = LANGUAGE_OPTIONS.find((f) => f.value === language)?.label;
  const value = (node as MOMCode)?.value || "";

  const onLangChange = (e: string) => {
    if (!ref.current) return;
    const newLang = e;
    setLanguage(newLang);
    updateNode<MOMCode>({
      nodeId: node.id,
      patch: {
        id: node.id,
        parentId: node.parentId,
        value: ref.current.value,
        lang: newLang,
        type: "code",
      },
    });
  };

  const save = () => {
    if (!ref.current) return;
    updateNode<MOMCode>({
      nodeId: node.id,
      patch: {
        id: node.id,
        value: ref.current.value,
        type: "code",
        parentId: node.parentId,
        lang: language,
      },
    });
  };

  const lazySave = useDebounceCallback(save, 800);

  const onBlur = () => {
    save();
    blur();
  };

  const copyToClipboard = async () => {
    if (!ref.current) return;
    try {
      await navigator.clipboard.writeText(ref.current.value);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus();
    }
  }, [isFocused]);

  const fieldProps: TextareaCodeEditorProps = {
    placeholder: "...",
    value,
    onInput: lazySave,
    onBlur,
    language,
    tabIndex: -1,
    spellCheck: false,
  };

  return {
    ref,
    onLangChange,
    languageLabel,
    copyToClipboard,
    LANGUAGE_OPTIONS,
    fieldProps,
  };
}
