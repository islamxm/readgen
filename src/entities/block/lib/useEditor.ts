import { useEffect, useRef, type HTMLProps } from "react";
import { shortcut } from "@shared/lib";
import type { MOMAllContent, MOMTextMarks } from "@/mom/types";
import { useChildren, useCursor, useDocumentActions, useNodeSelection, useSelectionActions } from "@/hooks";
import { MOM } from "@/mom";

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
export function useEditor<T extends HTMLElement>(node: MOMAllContent, parseType: ParseType = "deep", disableFormatting?: boolean) {
  const children = useChildren(node.id);
  const { focuseNode, blur } = useSelectionActions();
  const { isFocused } = useNodeSelection(node.id);
  const { commitInlineEdit, updateNode } = useDocumentActions();
  const ref = useRef<T | null>(null);
  const { restoreCursor, saveCursor } = useCursor<T>(ref);

  // синхронизация при изменении стейта
  useEffect(() => {
    if (!ref.current || !node) return;
    let html = "";
    if (parseType === "plain" && "value" in node) {
      html = node.value;
    }
    if (parseType === "deep") {
      html = MOM.Serializer.momToHTML(children, node.id);
    }
    ref.current.innerHTML = html;
  }, [children, parseType, node]);

  useEffect(() => {
    if (!ref.current) return;
    if (isFocused) {
      ref.current.focus();
      restoreCursor();
    }
  }, [isFocused, restoreCursor]);

  /** сохранение результата редактирования (данные беруться из dom) */
  const save = () => {
    if (!ref.current) return;
    saveCursor();
    if (parseType === "plain" && "value" in node) {
      const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(ref.current.textContent, node.value);
      if (canSkipUpdate) return;
      updateNode({
        nodeId: node.id,
        patch: { ...node, value: ref.current.textContent },
      });
    }
    if (parseType === "deep") {
      const nodes = MOM.Parser.domToMom(ref.current);

      const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(MOM.Serializer.momToHTML(children, node.id), MOM.Serializer.momToHTML(nodes, node.id));
      if (nodes.length === 0 || canSkipUpdate) return;
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
  const onKeyDown = (e: React.KeyboardEvent) => {
    shortcut(e.nativeEvent, ["Ctrl", "U"], () => applyFormat("lineThrough"), true, true);
    shortcut(e.nativeEvent, ["Ctrl", "I"], () => applyFormat("italic"), true, true);
    shortcut(e.nativeEvent, ["Ctrl", "B"], () => applyFormat("bold"), true, true);
  };

  /** чистим от форматирования вставляемый текст */
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    MOM.Editor.pastePlainText(text);
    save();
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current || disableFormatting) return;
    saveCursor();
    const result = MOM.Editor.applyFormat(format, children);
    if (!result) return;
    const canSkipUpdate = MOM.Editor.shoulSkipUpdateState(
      MOM.Serializer.momToHTML(MOM.Parser.domToMom(ref.current), node.id),
      MOM.Serializer.momToHTML(result.nodes, node.id),
    );

    if (canSkipUpdate) return;
    commitInlineEdit({ nodeId: node.id, nodes: result.nodes });
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

  const onFocus = () => {
    setTimeout(() => {
      saveCursor();
      focuseNode(node.id);
    }, 0);
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
    onKeyDown,
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
