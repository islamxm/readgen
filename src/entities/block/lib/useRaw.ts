import type { MOMRaw } from "@/mom/types";
import { useEffect, useRef, useState } from "react";
import { useDocumentActions } from "./useDocumentActions";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import { useNodeSelection } from "./useNodeSelection";
import type { Tabs } from "radix-ui";
import { MOM } from "@/mom";

type ViewType = "preview" | "raw";

export function useRaw(node: MOMRaw) {
  const { updateNode } = useDocumentActions();
  const { isFocused } = useNodeSelection(node.id);
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(node.value);
  const [viewType, setViewType] = useState<ViewType>("raw");

  const onValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const save = () => {
    const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(node.value, value);
    if (canSkipUpdate) return;
    updateNode<MOMRaw>({
      nodeId: node.id,
      patch: {
        id: node.id,
        value,
        type: "raw",
        parentId: node.parentId,
      },
    });
  };

  const blur = () => {
    if (!ref.current) return;
    ref.current.blur();
  };

  const onBlur = () => {
    save();
    blur();
  };

  const onViewTypeChange = (value: ViewType) => {
    setViewType(value);
    save();
  };

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus();
    }
  }, [isFocused]);

  const fieldProps: TextareaAutosizeProps = {
    value,
    onChange: onValueChange,
    placeholder: "...",
    minRows: 1,
    spellCheck: false,
    tabIndex: -1,
    onBlur,
  };

  const tabProps: React.ComponentProps<typeof Tabs.Root> = {
    value: viewType,
    onValueChange: (v) => onViewTypeChange(v as ViewType),
  };

  return {
    ref,
    fieldProps,
    tabProps,
  };
}
