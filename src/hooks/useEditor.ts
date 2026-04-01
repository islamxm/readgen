import { useEffect, useRef, type HTMLProps } from "react";
import { useSelection } from "./useSelection";
import { useNode } from "./useNode";
import { useDocument } from "./useDocument";
import { MOM } from "../mom";
import type { MOMAllContent, MOMTextMarks } from "../mom/types";
import { useHistory } from "./useHistory";
import { nanoid } from "nanoid";
import { useCursor } from "./useCursor";

/**
 * text - если разрешен только сырой текст (ex: h1,h2,...)
 *
 * parse - для форматируемого текста (ex: paragraph, blockquote,...)
 */
type ParseType = "deep" | "plain";

/** Инкапсулирует в себя все методы и свойства для редактирования элементов, это то что будет использоваться в Block */
export function useEditor<T extends HTMLElement>(
  nodeId: string,
  children: Array<MOMAllContent>,
  parseType: ParseType = "deep",
  disableFormatting?: boolean
) {
  const node = useNode(nodeId);
  const {
    isSelected,
    removeFromSelect,
    isFocused,
    nextBlock,
    prevBlock,
    focuseNode,
    focusNewNode,
    blur,
  } = useSelection();
  const { commitInlineEdit, updateNode, removeNode, insertNode } =
    useDocument();
  const { undo } = useHistory();
  const ref = useRef<T | null>(null);
  const { restoreCursor, saveCursor } = useCursor<T>(ref);
  const selected = isSelected(nodeId);
  const focused = isFocused(nodeId);
  const isActive = selected && focused;

  /** для того чтобы нормально вставлять html в зависимости от измененного стейта (отбираем контрол у реакта) */
  useEffect(() => {
    if (!ref.current) return;
    let html: string = "";
    // тут тоже приходится проверить так как некоторые блоки не могут в себе содержать детей кроме plainText, (пока только heading)
    if (parseType === "deep") {
      html = MOM.Serializer.momToHTML(children, nodeId);
    }
    if(parseType === "plain") {
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
    if (selected) {
      console.log("focus" in ref.current);
      ref.current.focus();
    }
  }, [selected]);

  /** сохранение результата редактирования (данные беруться из dom) */
  const onSave = () => {
    if (!ref.current) return;
    if (parseType === "plain") {
      updateNode({
        nodeId,
        patch: { ...node, value: ref.current.textContent },
      });
    }
    if (parseType === "deep") {
      const nodes = MOM.Parser.domToMom(ref.current);
      commitInlineEdit({ nodeId, nodes });
    }
  };

  /** при отключении фокуса предварительно сохраняем результат и сбрасываем выделение (надо пересмотреть когда вернемся к множественному выделению блоков - группировка) */
  const onBlur = () => {
    onSave();
    blur();
    removeFromSelect(nodeId);

    // когда окно приложение скрывается нужно вручную сделать blur() чтобы отменить каректку из contenteditable
    if (ref.current) {
      ref.current.blur();
    }
  };

  /** фиксируем факт DOM фокуса (реакция на программный focus()) в сторе */
  const onFocus = () => {
    focuseNode(nodeId);
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
          e.preventDefault();
          onBlur();
          prevBlock();
          break;
      }
      return;
    }
    if (e.code === "Tab") {
      e.preventDefault();
      // onSave();
      onBlur()
      nextBlock();
      return;
    }
    if (e.code === "Enter") {
      e.preventDefault();
      onSave();
      createNewBlock();
      return;
    }
    if (e.code === "Backspace") {
      if (!ref.current?.textContent) {
        console.warn(
          "Тут стирается последний символ из блока куда переходит фокус, то есть такое двойное удаление символа",
        );
        prevBlock();
        removeNode(nodeId);
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
        });
        break;
      case "blockquote":
        insertNode({
          node: { ...MOM.Engine.createBlockquote(node.parentId), id },
          parentId: null,
        });
        break;
      case "heading":
        insertNode({
          node: { ...MOM.Engine.createHeading(node.depth, node.parentId), id },
          parentId: null,
        });
        break;
    }
    // selectOne(id);
    // focuseNode(id);
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
    commitInlineEdit({ nodeId, nodes: result.nodes });
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
    selected,
    applyFormat,
    save: onSave,
  };
}
