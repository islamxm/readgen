import { useRef, type HTMLProps, useEffect } from "react";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useChildren } from "./useChildren";
import { useCursor } from "./useCursor";
import { useDocumentActions } from "./useDocumentActions";
import { useSelectionActions } from "./useSelectionActions";
import { useNodeSelection } from "./useNodeSelection";

// рассмотреть в будущем фиксирования focusedId конкретного li в сторе для предсказуемого управления кареткой

export function useListEditor(
  nodeId: string,
  listNodeId: string,
  children: Array<MOMAllContent>,
  index: number,
  createItem?: any,
  deleteItem?: any,
  focusItem?: any,
) {
  const { commitInlineEdit } = useDocumentActions();
  const { focuseNode, blur } = useSelectionActions();
  const { isFocused } = useNodeSelection(listNodeId);
  const ref = useRef<HTMLLIElement>(null);
  const { saveCursor, restoreCursor } = useCursor<HTMLLIElement>(ref);
  const currentHtml = useRef<string>(undefined);

  useEffect(() => {
    if (!ref.current) return;

    const html =
      currentHtml.current ?? MOM.Serializer.momToHTML(children, nodeId);
    currentHtml.current = undefined;
    if (ref.current.innerHTML === html) return;
    ref.current.innerHTML = html;
    if (isFocused) {
      restoreCursor();
    }
  }, [children, nodeId, restoreCursor, isFocused]);

  const save = () => {
    if (!ref.current) return;
    currentHtml.current = undefined;
    const nodes = MOM.Parser.domToMom(ref.current);
    commitInlineEdit({ nodeId, nodes });
  };

  /** при отключении фокуса предварительно сохраняем результат*/
  const onBlur = () => {
    save();
    blur();
    if (ref.current) {
      ref.current.blur();
    }
  };

  /** при клике на блок гарантированно фиксируем в сторе*/
  const onSelectBlock = () => {
    focuseNode(listNodeId);
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current) return;
    saveCursor();
    const result = MOM.Editor.applyFormat(format, children);
    if (!result) return;
    currentHtml.current = undefined;
    commitInlineEdit({ nodeId, nodes: result.nodes });
  };

  /** чистим от форматирования вставляемый текст */
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    save();
  };

  /** очистка от браузерного мусора при каждом вводе и сохранение актуального состояния DOM в рефе */
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
    currentHtml.current = ref.current.innerHTML;
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

  const onKeyboardEvent = (e: React.KeyboardEvent<HTMLLIElement>) => {
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
    if (isFocused && index === 0) {
      ref.current?.focus();
    }
  }, [index, isFocused]);

  const editorProps: HTMLProps<HTMLLIElement> = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur,
    onKeyDown: onKeyboardEvent,
    onInput,
    onClick: onSelectBlock,
    tabIndex: -1,
    spellCheck: false,
    onPaste,
  };

  return {
    ref,
    editorProps,
    applyFormat,
  };
}
