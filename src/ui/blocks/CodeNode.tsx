import { useState, type ChangeEvent, type FC } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useDocument, useNode, useSelection } from "../../hooks";
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
import {
  JavascriptOriginalIcon,
  TypescriptOriginalIcon,
  Html5OriginalIcon,
  MarkdownOriginalIcon,
  Css3OriginalIcon,
  SassOriginalIcon,
  LessPlainWordmarkIcon,
  JsonOriginalIcon,
  PythonOriginalIcon,
  JavaOriginalIcon,
  CsharpOriginalIcon,
  CplusplusOriginalIcon,
  COriginalIcon,
  GolandOriginalIcon,
  RustOriginalIcon,
  PhpOriginalIcon,
  RubyOriginalIcon,
  SwiftOriginalIcon,
  KotlinOriginalIcon,
  YamlOriginalIcon,
  DockerOriginalIcon,
  BashOriginalIcon,
  NginxOriginalIcon,
} from "@devicon/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type Props = {
  nodeId: string;
};

const LANGUAGE_OPTIONS = [
  {
    value: "javascript",
    label: "JavaScript",
    icon: <JavascriptOriginalIcon />,
  },
  {
    value: "typescript",
    label: "TypeScript",
    icon: <TypescriptOriginalIcon />,
  },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "html", label: "HTML", icon: <Html5OriginalIcon /> },
  { value: "markdown", label: "Markdown", icon: <MarkdownOriginalIcon /> },
  { value: "css", label: "CSS", icon: <Css3OriginalIcon /> },
  { value: "scss", label: "SCSS", icon: <SassOriginalIcon /> },
  { value: "sass", label: "Sass", icon: <SassOriginalIcon /> },
  { value: "less", label: "Less", icon: <LessPlainWordmarkIcon /> },
  { value: "json", label: "json", icon: <JsonOriginalIcon /> },
  { value: "python", label: "Python", icon: <PythonOriginalIcon /> },
  { value: "java", label: "Java", icon: <JavaOriginalIcon /> },
  { value: "csharp", label: "C#", icon: <CsharpOriginalIcon /> },
  { value: "cpp", label: "C++", icon: <CplusplusOriginalIcon /> },
  { value: "c", label: "C", icon: <COriginalIcon /> },
  { value: "go", label: "Golang", icon: <GolandOriginalIcon /> },
  { value: "rust", label: "Rust", icon: <RustOriginalIcon /> },
  { value: "php", label: "PHP", icon: <PhpOriginalIcon /> },
  { value: "ruby", label: "Ruby", icon: <RubyOriginalIcon /> },
  { value: "swift", label: "Swift", icon: <SwiftOriginalIcon /> },
  { value: "kotlin", label: "Kotlin", icon: <KotlinOriginalIcon /> },
  { value: "yaml", label: "YAML", icon: <YamlOriginalIcon /> },
  { value: "toml", label: "TOML" },
  { value: "docker", label: "Docker", icon: <DockerOriginalIcon /> },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "bash", icon: <BashOriginalIcon /> },
  { value: "nginx", label: "nginx", icon: <NginxOriginalIcon /> },
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
  const { updateNode, removeNode } = useDocument();
  const {prevBlock} = useSelection()

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
      prevBlock();
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
              {LANGUAGE_OPTIONS.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  {icon}
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
