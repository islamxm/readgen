import { useState, type ChangeEvent, type FC } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useNode } from "../../hooks";
import { MOM } from "../../mom";
import type { MOMCode } from "../../mom/types";
import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../shared";
import { getBlockColors } from "../tokens";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { useSelectionActions } from "@/hooks/useSelectionActions";
import { useNodeSelection } from "@/hooks/useNodeSelection";

type Props = {
  nodeId: string;
};

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

/**
 * этот блок нужно сделать динамическим, то есть будут два состояния:
 *
 * - активный (обычный превью)
 * - неактивный (включается редактор и селект языков)
 *
 * иначе даже 3 такого блока с инициализированным редактором (даже простым как *@uiw*) тормозят приложение
 * можно рассмотреть библиотеку *BlockNode* вместо *@uiw*
 */

export const CodeNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { updateNode, removeNode } = useDocumentActions();
  const { selectPrevBlock } = useSelectionActions();

  const [code, setCode] = useState<string>((node as MOMCode)?.value || "");
  const [language, setLanguage] = useState<string>(
    (node as any).lang || "javascript",
  );

  const isValidNode = MOM.Guard.isCodeNode(node);

  if (!isValidNode) return null;

  const { border } = getBlockColors(node.type);

  const onCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const onLangChange = (e: string) => {
    const newLang = e;
    setLanguage(newLang);
    updateNode<MOMCode>({
      nodeId,
      patch: {
        id: nodeId,
        parentId: node.parentId,
        value: code,
        lang: newLang,
        type: "code",
      },
    });
  };

  const onBlur = () => {
    updateNode<MOMCode>({
      nodeId,
      patch: {
        id: nodeId,
        value: code,
        type: "code",
        parentId: node.parentId,
        lang: language,
      },
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code) {
      selectPrevBlock(node.id);
      removeNode(nodeId);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      data-id={nodeId}
      data-type={node.type}
      data-parent-id={node.parentId ?? ""}
      className="block-node code-block p-[5px]"
    >
      <div className="code-block-header flex gap-2 justify-between">
        <Select value={language} onValueChange={onLangChange}>
          <SelectTrigger
            style={{ backgroundColor: border }}
            className="w-full max-w-48 shadow-none border-none rounded-sm"
          >
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select a language</SelectLabel>
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={copyToClipboard}
              variant={"outline"}
              className="bg-transparent"
              size={"icon"}
            >
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>

      <div className="code-block-body">
        {language && (
          <CodeEditor
            value={code}
            language={language}
            placeholder="..."
            onChange={onCodeChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className="code-block-editor"
          />
        )}
      </div>
    </div>
  );
};
