import type { MOMHtml } from "@/mom/types";
import { useEffect, useRef, useState } from "react";
import { useDocumentActions } from "./useDocumentActions";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import { useSelectionActions } from "./useSelectionActions";
import { useNodeSelection } from "./useNodeSelection";

export function useHtml(node: MOMHtml) {
  const { updateNode } = useDocumentActions();
  const { removeFromSelect } = useSelectionActions();
  const { isFocused } = useNodeSelection(node.id);
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(node.value);

  const onValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const save = () => {
    updateNode<MOMHtml>({
      nodeId: node.id,
      patch: {
        id: node.id,
        value,
        type: "html",
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
    removeFromSelect(node.id);
  };

  const onPaste = () => {};

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
    onPaste,
    onBlur,
  };

  return {
    ref,
    fieldProps,
  };
}
