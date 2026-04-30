import { useRef, type HTMLProps, useEffect } from "react";
import { shortcut } from "@shared/lib";
import type { MOMAllContent, MOMTextMarks } from "@/mom/types";
import { useCursor, useDocumentActions, useNodeSelection, useSelectionActions } from "@/hooks";
import { MOM } from "@/mom";
import { useDebounceCallback } from "usehooks-ts";

// рассмотреть в будущем фиксирования focusedId конкретного li в сторе для предсказуемого управления кареткой
/**
 * Инкапсулирует в себя все методы и свойтсва для редактирования элемента списка с **contenteditable** атрибутом
 * @param nodeId ID элемента списка
 * @param listNodeId ID списка
 * @param children Дети элемента списка
 * @param index Текущий индекс элемента списка
 * @param createItem Создание нового элемента списка
 * @param deleteItem Удаление элемента списка
 * @param focusPrevItem Переход к предыдущему элементу списка
 * @param focusNextItem Переход к следующему элементу списка
 */
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
  // const { isSelected: isListSelected } = useNodeSelection(listNodeId);
  const ref = useRef<HTMLLIElement>(null);
  const { saveCursor, restoreCursor } = useCursor<HTMLLIElement>(ref);

  const save = () => {
    if (!ref.current) return;
    const nodes = MOM.Parser.domToMom(ref.current);
    const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(MOM.Serializer.momToHTML(children, nodeId), MOM.Serializer.momToHTML(nodes, nodeId));
    if (canSkipUpdate) return;
    commitInlineEdit({ nodeId, nodes });
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current) return;
    const result = MOM.Editor.applyFormat(format, children);
    if (!result) return;
    const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(
      MOM.Serializer.momToHTML(MOM.Parser.domToMom(ref.current), nodeId),
      MOM.Serializer.momToHTML(result.nodes, nodeId),
    );
    if (canSkipUpdate) return;
    commitInlineEdit({ nodeId, nodes: result.nodes });
  };

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

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    MOM.Editor.pastePlainText(text);
    save();
  };

  const onInput = (e: React.FormEvent) => {
    if (!ref.current) return;
    saveCursor();
    MOM.Parser.sanitizeHtml(ref.current);
    restoreCursor();
    const target = e.currentTarget;
    if (target.textContent === "") {
      target.innerHTML = "";
    }
    lazySave();
  };

  const onBeforeInput = (e: InputEvent) => {
    if (e.inputType && e.inputType.startsWith("format")) {
      e.preventDefault();
    }
  };

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
    if (e.code === "Enter" && e.shiftKey) {
      e.preventDefault();
      createItem();
      return;
    }
    shortcut(e.nativeEvent, ["Shift", "Tab"], () => focusPrevItem?.(e, index), false, false);
    shortcut(e.nativeEvent, ["Tab"], () => focusNextItem?.(e, index), false, false);
  };

  const lazySave = useDebounceCallback(save, 800);
  const lazySaveCursor = useDebounceCallback(saveCursor, 70);

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
    const r = ref.current;
    r.addEventListener("beforeinput", onBeforeInput);
    return () => {
      r?.removeEventListener("beforeinput", onBeforeInput);
    };
  }, []);

  useEffect(() => {
    if (!isListItemFocused) return;
    document.addEventListener("selectionchange", lazySaveCursor);
    return () => {
      document.removeEventListener("selectionchange", lazySaveCursor);
    };
  }, [lazySaveCursor, isListItemFocused]);

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
