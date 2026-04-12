import { useRef, type HTMLProps, useEffect } from "react";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useChildren } from "./useChildren";
import { useCursor } from "./useCursor";
import { useDocumentActions } from "./useDocumentActions";
import { useSelectionActions } from "./useSelectionActions";
import { useNodeSelection } from "./useNodeSelection";

export function useListEditor(
  nodeId: string,
  listNodeId: string,
  children: Array<MOMAllContent>,
  index: number,
  createItem?: any,
  deleteItem?: any,
  focusItem?: any,
) {
  const parentChildren = useChildren(listNodeId);
  // const listNode = useNode(listNodeId);
  const { commitInlineEdit } = useDocumentActions();
  const { focuseNode } = useSelectionActions();
  const { isFocused } = useNodeSelection(listNodeId);
  const ref = useRef<HTMLLIElement>(null);
  const { saveCursor, restoreCursor } = useCursor<HTMLLIElement>(ref);

  /** берем управление DOM в свои руки чтобы не было ошибки c [React]removeChildren() */
  useEffect(() => {
    if (!ref.current) return;
    const html = MOM.Serializer.momToHTML(children, nodeId);
    ref.current.innerHTML = html;
  }, [children]);

  const onSave = () => {
    if (!ref.current) return;
    // cursorRef.current = saveCursor(ref.current);
    const nodes = MOM.Parser.domToMom(ref.current);
    commitInlineEdit({ nodeId, nodes });
  };

  const onBlur = () => {
    onSave();
    // blur();
    // removeFromSelect(nodeId);

    // когда окно приложение скрывается нужно вручную сделать blur() чтобы отменить каректку из contenteditable
    if (ref.current) {
      ref.current.blur();
    }
  };

  const onSelectBlock = () => {
    focuseNode(listNodeId);
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current) return;
    saveCursor();
    const result = MOM.Editor.applyFormat(format, children);
    if (!result) return;
    commitInlineEdit({ nodeId, nodes: result.nodes });
  };

  /** чистим от форматирования вставляемый текст */
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    onSave();
  };

  /** очистка от браузерного мусора при каждом вводе */
  // надо подумать про перформанс
  const onInput = (e: React.FormEvent) => {
    if (!ref.current) return;
    saveCursor();
    MOM.Parser.sanitizeHtml(ref.current);
    restoreCursor();
    const target = e.currentTarget;
    if (target.textContent === "") {
      target.innerHTML = "";
    }
  };

  /** сброс браузерных стилей перед вводом */
  const onBeforeInput = (e: InputEvent) => {
    if (e.inputType && e.inputType.startsWith("format")) {
      e.preventDefault();
    }
  };

  /** обработка события beforeinput (оказывается реакт не имплементирует его - onBeforeInput что то другое) */
  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current;
    r.addEventListener("beforeinput", onBeforeInput);
    return () => {
      r?.removeEventListener("beforeinput", onBeforeInput);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.code) {
        case "KeyU":
          e.preventDefault();
          applyFormat("lineThrough");
          return;
        case "KeyI":
          e.preventDefault();
          applyFormat("italic");
          break;
        case "KeyB":
          e.preventDefault();
          applyFormat("bold");
          break;
      }
      return;
    }
    if (e.code === "Enter" && e.shiftKey) {
      e.preventDefault();
      createItem();
      return;
    }
    if (e.code === "Backspace") {
      const isEmpty = !ref.current?.textContent;
      if (isEmpty) {
        deleteItem();
      }
    }
    if (e.code === "ArrowUp") {
      focusItem(index - 1);
    }
    if (e.code === "ArrowDown") {
      focusItem(index + 1);
    }
  };

  useEffect(() => {
    if (isFocused) {
      console.log(isFocused);
      ref.current?.focus();
    }
  }, [isFocused]);

  const editorProps: HTMLProps<HTMLLIElement> = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur,
    onKeyDown,
    onInput,
    onClick: onSelectBlock,
    tabIndex: -1,
    spellCheck: false,
    onPaste
  };

  return {
    ref,
    editorProps,
    applyFormat,
  };
}
