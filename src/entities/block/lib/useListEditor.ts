import { useRef, type HTMLProps, useEffect } from "react";
import { shortcut } from "@shared/lib";
import type { MOMAllContent, MOMTextMarks } from "@/mom/types";
import { useCursor, useDocumentActions, useNodeSelection, useSelectionActions } from "@/hooks";
import { MOM } from "@/mom";

// рассмотреть в будущем фиксирования focusedId конкретного li в сторе для предсказуемого управления кареткой

export function useListEditor(
  nodeId: string,
  listNodeId: string,
  children: Array<MOMAllContent>,
  index: number,
  createItem?: any,
  deleteItem?: any,
  focusPrevItem?: (e: React.KeyboardEvent, index: number) => void,
  focusNextItem?: (e: React.KeyboardEvent, index: number) => void,
) {
  const { commitInlineEdit } = useDocumentActions();
  const { focuseNode, blur } = useSelectionActions();
  const { isFocused: isListItemFocused } = useNodeSelection(nodeId);
  const { isSelected: isListSelected } = useNodeSelection(listNodeId);
  const ref = useRef<HTMLLIElement>(null);
  const { saveCursor, restoreCursor } = useCursor<HTMLLIElement>(ref);

  useEffect(() => {
    if (!ref.current) return;
    const html = MOM.Serializer.momToHTML(children, nodeId);
    ref.current.innerHTML = html;
  }, [children, nodeId]);

  useEffect(() => {
    if (!ref.current) return;
    if (isListItemFocused) {
      ref.current.focus();
      restoreCursor();
    }
  }, [isListItemFocused, restoreCursor]);

  useEffect(() => {
    if (!ref.current) return;
  }, [isListItemFocused, isListSelected]);

  const save = () => {
    if (!ref.current) return;
    saveCursor();
    const nodes = MOM.Parser.domToMom(ref.current);
    const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(MOM.Serializer.momToHTML(children, nodeId), MOM.Serializer.momToHTML(nodes, nodeId));
    if (canSkipUpdate) return;
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

  const onFocus = () => {
    setTimeout(() => {
      saveCursor();
      focuseNode(nodeId);
    }, 0);
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current) return;
    saveCursor();
    const result = MOM.Editor.applyFormat(format, children);
    if (!result) return;

    const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(
      MOM.Serializer.momToHTML(MOM.Parser.domToMom(ref.current), nodeId),
      MOM.Serializer.momToHTML(result.nodes, nodeId),
    );
    if (canSkipUpdate) return;
    commitInlineEdit({ nodeId, nodes: result.nodes });
  };

  /** чистим от форматирования вставляемый текст */
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    MOM.Editor.pastePlainText(text);
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

  const onKeyDown = (e: React.KeyboardEvent) => {
    shortcut(e.nativeEvent, ["Ctrl", "U"], () => applyFormat("lineThrough"), true, true);
    shortcut(e.nativeEvent, ["Ctrl", "I"], () => applyFormat("italic"), true, true);
    shortcut(e.nativeEvent, ["Ctrl", "B"], () => applyFormat("bold"), true, true);
    shortcut(
      e.nativeEvent,
      ["Backspace"],
      () => {
        const isEmpty = !ref.current?.textContent;
        if (isEmpty) {
          e.preventDefault();
          deleteItem();
        }
      },
      false,
      true,
    );
    //два модификатора не обрабатываются функцией shortcut
    if (e.code === "Enter" && e.shiftKey) {
      e.preventDefault();
      createItem();
      return;
    }
    shortcut(e.nativeEvent, ["Shift", "Tab"], () => focusPrevItem?.(e, index), false, false);
    shortcut(e.nativeEvent, ["Tab"], () => focusNextItem?.(e, index), false, false);
  };

  // useEffect(() => {
  //   if (isFocused && index === 0) {
  //     ref.current?.focus();
  //   }
  // }, [index, isFocused]);

  const editorProps: HTMLProps<HTMLLIElement> = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur,
    onKeyDown,
    onInput,
    tabIndex: -1,
    spellCheck: false,
    onPaste,
    onFocus,
  };

  return {
    ref,
    editorProps,
    applyFormat,
  };
}
