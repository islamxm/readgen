import { useRef, type HTMLProps, useEffect } from "react";
import { useNode } from "./useNode";
import { useDocument } from "./useDocument";
import { useSelection } from "./useSelection";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useChildren } from "./useChildren";
import { useCursor } from "./useCursor";
import { useHistory } from "./useHistory";

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
  const { commitInlineEdit } = useDocument();
  const { isFocused, focuseNode, prevBlock } = useSelection();
  const { undo, redo } = useHistory();
  const ref = useRef<HTMLLIElement>(null);
  const { saveCursor, restoreCursor } = useCursor<HTMLLIElement>(ref);
  const focused = isFocused(nodeId);

  useEffect(() => {
    if (focused && ref.current) {
      // ref.current.focus();
    }
  }, [focused]);

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
          return;
        case "KeyI":
          e.preventDefault();
          applyFormat("italic");
          break;
        case "KeyB":
          e.preventDefault();
          applyFormat("bold");
          break;
        case "KeyZ":
          e.preventDefault();
          // тут надо учесть что отмена происходит только в рамках действий текущего блока
          undo();
          break;
      }
      return;
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      createItem();
      return;
    }
    if (e.key === "Backspace") {
      const isEmpty = !ref.current?.textContent;
      const isLastItem = parentChildren.length === 1;
      if (isEmpty) {
        deleteItem();
        if (isLastItem) {
          prevBlock();
        }
      }
    }
    if (e.key === "ArrowUp") {
      focusItem(index - 1);
    }
    if (e.key === "ArrowDown") {
      focusItem(index + 1);
    }
  };

  const editorProps: HTMLProps<HTMLLIElement> = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur,
    onKeyDown,
    onInput,
    onClick: onSelectBlock,
  };

  return {
    ref,
    editorProps,
    applyFormat,
  };
}
