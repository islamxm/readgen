import { useEffect, useRef, type HTMLProps } from "react";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useCursor } from "./useCursor";
import { useDocumentActions } from "./useDocumentActions";
import { useChildren } from "./useChildren";
import { useSelectionActions } from "./useSelectionActions";
import { useNodeSelection } from "./useNodeSelection";

/**
 * text - если разрешен только сырой текст (ex: h1,h2,...)
 *
 * parse - для форматируемого текста (ex: paragraph, blockquote,...)
 */
type ParseType = "deep" | "plain";

/**
 * Инкапсулирует в себя все методы и свойства для редактирования элементов, это то что будет использоваться в топ левел блоках с **contenteditable** атрибутом
 * @param {MOMAllContent} node Редактируемая MOM нода
 * @param {ParseType} parseType Способ парсинга содержимого html элемента в MOM структуру
 * @param {boolean} disableFormatting Отключение форматирование в редактируемой ноде
 * @returns
 */
export function useEditor<T extends HTMLElement>(
  node: MOMAllContent,
  parseType: ParseType = "deep",
  disableFormatting?: boolean,
) {
  const children = useChildren(node.id);
  const { focuseNode, blur } = useSelectionActions();
  const { isFocused } = useNodeSelection(node.id);
  const { commitInlineEdit, updateNode } = useDocumentActions();
  const ref = useRef<T | null>(null);
  const { restoreCursor, saveCursor } = useCursor<T>(ref);
  const currentHtml = useRef<string>(undefined);

  useEffect(() => {
    if (!ref.current) return;
    let html: string = "";
    if (parseType === "deep") {
      html = currentHtml.current ?? MOM.Serializer.momToHTML(children, node.id);
    }
    // программная вставка не работает
    if (parseType === "plain") {
      let value = ref.current.textContent;
      if("value" in node) {
        value = node.value
      }
      html = value
    }
    if (ref.current.innerHTML === html) return;
    ref.current.innerHTML = html;
    currentHtml.current = undefined;
    if (isFocused) {
      restoreCursor();
    }
  }, [children, parseType, node, restoreCursor, isFocused]);

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus();
    }
  }, [isFocused, restoreCursor]);

  /** сохранение результата редактирования (данные беруться из dom) */
  const save = () => {
    if (!ref.current) return;
    currentHtml.current = undefined;
    if (parseType === "plain") {
      updateNode({
        nodeId: node.id,
        patch: { ...node, value: ref.current.textContent },
      });
    }
    if (parseType === "deep") {
      const nodes = MOM.Parser.domToMom(ref.current);
      if (nodes.length === 0) return;
      commitInlineEdit({ nodeId: node.id, nodes });
    }
  };

  /** при отключении фокуса предварительно сохраняем результат*/
  const onBlur = () => {
    save();
    blur();
  };

  /** при клике на блок гарантированно фиксируем в сторе*/
  const onSelectBlock = () => {
    focuseNode(node.id);
  };

  /** обработка действий которые идут через клавишу */
  const onKeyboardEvent = (e: React.KeyboardEvent) => {
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
  };

  /** чистим от форматирования вставляемый текст */
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    save();
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current || disableFormatting) return;
    saveCursor();
    const result = MOM.Editor.applyFormat(format, children);
    if (!result) return;
    currentHtml.current = undefined;
    commitInlineEdit({ nodeId: node.id, nodes: result.nodes });
    // restoreCursor();
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

  const onFocus = () => {
    focuseNode(node.id);
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

  const editorProps: HTMLProps<T> = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onSelectBlock,
    onBlur,
    onKeyDown: onKeyboardEvent,
    onFocus,
    onPaste,
    onInput,
    tabIndex: -1,
    spellCheck: false,
  };

  return {
    ref,
    editorProps,
    applyFormat,
    save,
  };
}
