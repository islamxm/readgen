import { useEffect, useRef, type HTMLProps } from "react";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useHistory } from "./useHistory";
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
  const { isSelected, isFocused, isOnlySelected } = useNodeSelection(node.id);
  const { commitInlineEdit, updateNode } = useDocumentActions();
  const ref = useRef<T | null>(null);
  const { restoreCursor, saveCursor } = useCursor<T>(ref);

  /** для того чтобы нормально вставлять html в зависимости от измененного стейта (отбираем контроль у реакта) */
  useEffect(() => {
    if (!ref.current) return;
    let html: string = "";

    if (parseType === "deep") {
      html = MOM.Serializer.momToHTML(children, node.id);
      if (children.length === 0) {
        const mom = MOM.Parser.domToMom(ref.current);
        html = MOM.Serializer.momToHTML(mom, node.id);
      }
    }
    if (parseType === "plain") {
      html = ref.current.textContent;
    }
    ref.current.innerHTML = html;

    if (isFocused) {
      restoreCursor();
    }
  }, [children, isFocused, parseType]);

  /** сохранение результата редактирования (данные беруться из dom) */
  const save = () => {
    if (!ref.current) return;
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

  /** при отключении фокуса предварительно сохраняем результат и сбрасываем выделение (надо пересмотреть когда вернемся к множественному выделению блоков - группировка) */
  const onBlur = () => {
    save();
    blur();
  };

  /** при клике на блок гарантированно фиксируем в сторе (дефолтный клик)*/
  const onSelectBlock = () => {
    focuseNode(node.id);
  };

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus();
    }
  }, [isFocused]);

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
    commitInlineEdit({ nodeId: node.id, nodes: result.nodes });
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

  const editorProps: HTMLProps<T> = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onSelectBlock,
    onBlur,
    onKeyDown: onKeyboardEvent,
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
