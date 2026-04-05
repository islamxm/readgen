import { useEffect, useRef, type HTMLProps } from "react";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useHistory } from "./useHistory";
import { nanoid } from "nanoid";
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
  const {
    removeFromSelect,
    selectNextBlock,
    selectPrevBlock,
    focuseNode,
    focusNewNode,
    blur,
  } = useSelectionActions();
  const { isSelected, isFocused } = useNodeSelection(node.id);
  const { commitInlineEdit, updateNode, removeNode, insertNode } =
    useDocumentActions();
  const { undo } = useHistory();
  const ref = useRef<T | null>(null);
  const { restoreCursor, saveCursor } = useCursor<T>(ref);
  const isActive = isSelected && isFocused;

  /** для того чтобы нормально вставлять html в зависимости от измененного стейта (отбираем контрол у реакта) */
  useEffect(() => {
    if (!ref.current) return;
    let html: string = "";
    // тут тоже приходится проверить так как некоторые блоки не могут в себе содержать детей кроме plainText, (пока только heading)
    if (parseType === "deep") {
      html = MOM.Serializer.momToHTML(children, node.id);
    }
    if (parseType === "plain") {
      // undo/redo не восстанавливает в хедингах
      html = ref.current.textContent;
    }
    ref.current.innerHTML = html;
    // для восстановления после applyFormat, onSave и тд
    if (isActive) {
      restoreCursor();
    }
  }, [children, isActive, parseType]);

  /** обработка случая когда блок выбран (нажато вне contenteditable), чтобы сразу был фокус
   * наверное это временный костыль пока не поправим стили отступов - нужно чтобы они были у Block а не у contenteditable
   */
  useEffect(() => {
    if (!ref.current) return;
    if (isSelected) {
      ref.current.focus();
    }
  }, [isSelected]);

  /** сохранение результата редактирования (данные беруться из dom) */
  const onSave = () => {
    if (!ref.current) return;
    if (parseType === "plain") {
      updateNode({
        nodeId: node.id,
        patch: { ...node, value: ref.current.textContent },
      });
    }
    if (parseType === "deep") {
      const nodes = MOM.Parser.domToMom(ref.current);
      commitInlineEdit({ nodeId: node.id, nodes });
    }
  };

  /** при отключении фокуса предварительно сохраняем результат и сбрасываем выделение (надо пересмотреть когда вернемся к множественному выделению блоков - группировка) */
  const onBlur = () => {
    onSave();
    blur();
    removeFromSelect(node.id);

    // когда окно приложение скрывается нужно вручную сделать blur() чтобы отменить каректку из contenteditable
    if (ref.current) {
      // ref.current.blur();
    }
  };

  /** фиксируем факт DOM фокуса (реакция на программный focus()) в сторе */
  const onFocus = () => {
    focuseNode(node.id);
  };

  /** при клике на блок гарантированно фиксируем в сторе (дефолтный клик)*/
  const onSelectBlock = () => {
    focuseNode(node.id);
  };

  /** обработка действий которые идут через клавишу */
  const onKeyboardEvent = (e: React.KeyboardEvent) => {
    // продумать маппер
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
    if (e.shiftKey) {
      switch (e.code) {
        case "Tab":
          console.warn(
            "когда прыгает к самому начальному блоку то введенные данные в текущем блоке не сохраняютсяы",
          );
          e.preventDefault();
          onBlur();
          selectPrevBlock(node.id);
          break;
      }
      return;
    }
    if (e.code === "Tab") {
      console.warn(
        "когда прыгает к самому начальному блоку то введенные данные в текущем блоке не сохраняютсяы",
      );
      e.preventDefault();
      onBlur();
      selectNextBlock(node.id);
      return;
    }
    if (e.code === "Enter") {
      e.preventDefault();
      onSave();
      createNewBlock();
      return;
    }
    if (e.code === "Backspace") {
      const isEmpty = !ref.current?.textContent;
      if (isEmpty) {
        console.warn(
          "Тут стирается последний символ из блока куда переходит фокус, то есть такое двойное удаление символа",
        );
        selectPrevBlock(node.id);
        removeNode(node.id);
      }
      return;
    }
  };

  /** создание нового подобного блока (в основном при нажатии на Enter) */
  const createNewBlock = () => {
    const type = node.type;
    const id = nanoid();

    switch (type) {
      case "paragraph":
        insertNode({
          node: { ...MOM.Engine.createParagraph(node.parentId), id },
          parentId: null,
          afterNodeId: node.id,
        });
        break;
      case "blockquote":
        insertNode({
          node: { ...MOM.Engine.createBlockquote(node.parentId), id },
          parentId: null,
          afterNodeId: node.id,
        });
        break;
      case "heading":
        insertNode({
          node: { ...MOM.Engine.createHeading(node.depth, node.parentId), id },
          parentId: null,
          afterNodeId: node.id,
        });
        break;
      case "alert":
        insertNode({
          node: { ...MOM.Engine.createAlert(node.parentId, node.variant), id },
          parentId: null,
          afterNodeId: node.id,
        });
    }
    focusNewNode(id);
  };

  /** чистим от форматирования вставляемый текст */
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    onSave();
  };

  const applyFormat = (format: keyof MOMTextMarks) => {
    if (!ref.current || disableFormatting) return;
    saveCursor();
    console.warn(
      "Частичное форматирование в сыром тексте не работает, применяется ко всем символам",
    );
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
    onFocus,
  };

  return {
    ref,
    editorProps,
    applyFormat,
    save: onSave,
  };
}
