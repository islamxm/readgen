import { shallowEqual } from "react-redux";
import { MOM } from "..";
import type { MOMAllContent, MOMMap, MOMText, MOMTextMarks } from "../types";
import type { CursorPosition, SelectionFragment } from "./editor.types";
import { nanoid } from "nanoid";

/** Применить форматирование текста */
export function applyFormat(format: keyof MOMTextMarks, nodes: Array<MOMAllContent>) {
  const selection = window.getSelection();
  if (!hasSelection(selection)) return;
  const range = getRange(selection);

  const rangeSnapshot = {
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    startContainer: range.startContainer,
    endContainer: range.endContainer,
  };

  const containedElements = getRangeContainedElements(range);

  const blockNode = getBlockNode(containedElements[0]);

  if (!blockNode) return;

  const parentId = blockNode.dataset.id as string;

  const normalizedNodes = normalizeBlockChildren(blockNode, nodes);

  if (containedElements.length === 1) {
    const p = containedElements[0].firstChild as Node;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    range.setStart(p, rangeSnapshot.startOffset);
    range.setEnd(p, rangeSnapshot.endOffset);
    sel?.addRange(range);
  }

  const fragments = getFragments(range, containedElements);

  const existingNodes = getExistingNodes(normalizedNodes, blockNode.children);
  const newNodes = buildNodes({
    fragments,
    format,
    parentId,
    existingNodes,
  });
  const modifiedNodes = modifiedBlock({
    allNodes: existingNodes,
    nodesBySpanId: newNodes,
  });
  const finalNodes = normalizeFormattedNodes(modifiedNodes);

  return {
    parentId,
    nodes: finalNodes,
    childrenIds: finalNodes.map((n) => n.id),
  };
}

/** Для склейки схожих по формату нод и очистки от нод-пустышек */
function normalizeFormattedNodes(nodes: Array<MOMText>): Array<MOMText> {
  if (nodes.length === 0) return [];

  return nodes.reduce((acc: Array<MOMText>, next: MOMText) => {
    if (next.value === "") {
      return acc;
    }
    const last = acc[acc.length - 1];
    if (!last) {
      acc.push({ ...next });
      return acc;
    }
    const isMarksEqual = shallowEqual(last.marks, next.marks);
    const isUrlEqual = last.url === next.url;
    if (isMarksEqual && isUrlEqual) {
      last.value += next.value;
    } else {
      acc.push({ ...next });
    }
    return acc;
  }, []);
}

/** получаем элементы которые вклчают выделение (не text node) */
function getRangeContainedElements(range: Range) {
  let rootElement = range.commonAncestorContainer as HTMLElement;
  if (rootElement.nodeType !== Node.ELEMENT_NODE) {
    rootElement = rootElement.parentElement as HTMLElement;
  }

  const selectedElements = new Set<HTMLElement>();
  const iter = document.createNodeIterator(rootElement, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });

  let currentNode;
  while ((currentNode = iter.nextNode())) {
    const parent = currentNode.parentElement;
    if (!parent || !rootElement.contains(parent)) continue;

    if (parent.tagName === "SPAN") {
      selectedElements.add(parent);
    } else if (parent === rootElement || parent.dataset.id) {
      const text = currentNode as Text;
      const span = wrapRawTextNode(text, parent);
      selectedElements.add(span);
    }
  }

  return Array.from(selectedElements);
}

/** Оборачиваем сырой текст на span */
function wrapRawTextNode(textNode: Text, blockNode: HTMLElement): HTMLSpanElement {
  const parentId = blockNode.getAttribute("data-id") ?? "";
  const newMomText = MOM.Engine.createText(textNode.textContent ?? "", parentId);

  const span = document.createElement("span");

  span.dataset.id = newMomText.id;
  span.dataset.type = "text";
  span.dataset.parentId = parentId;

  blockNode.insertBefore(span, textNode);
  span.appendChild(textNode);

  return span;
}

/** получаем мета-данные элемента из его data-аттрибутов */
function getElementData(element: Element) {
  const id = element.getAttribute("data-id");
  const type = element.getAttribute("data-type");
  const parentId = element.getAttribute("data-parent-id");

  return { id, type, parentId };
}

/** если есть какое то выделение */
function hasSelection(selection?: Selection | null): selection is Selection {
  return !!selection && !!selection.rangeCount && !selection.isCollapsed;
}

/** получаем диапазон выделения */
function getRange(selection: Selection) {
  return selection.getRangeAt(0);
}

/** получаем блок в рамках которого можно редактировать */
function getBlockNode(element: Element) {
  // return element.parentElement;
  return element.closest("[data-editable]") as HTMLElement;
}

/** получение фрагментов для корректной модификации элементов */
function getFragments(range: Range, containedElements: Array<HTMLElement>): Array<SelectionFragment> {
  return containedElements.map((el) => {
    const fullText = el.textContent ?? "";
    const elRange = document.createRange();
    elRange.selectNodeContents(el);

    const startOffset = el === range.startContainer.parentElement ? range.startOffset : 0;
    const endOffset = el === range.endContainer.parentElement ? range.endOffset : fullText.length;

    return {
      spanId: el.dataset.id ?? "",
      spanElement: el,
      beforeText: fullText.slice(0, startOffset),
      selectedText: fullText.slice(startOffset, endOffset),
      afterText: fullText.slice(endOffset),
      isFullySelected: startOffset === 0 && endOffset === fullText.length,
    };
  });
}

/** На основе фрагментов из выеделенной области собирает мап из текстовых обьектов */
function buildNodes(opt: {
  fragments: Array<SelectionFragment>;
  format: keyof MOMTextMarks;
  parentId: string;
  existingNodes: MOMText[];
}): Map<string, MOMText[]> {
  const { fragments, format, parentId, existingNodes } = opt;

  const result = new Map<string, MOMText[]>();

  for (const fragment of fragments) {
    const existingNode = existingNodes.find((n) => n.id === fragment.spanId);
    const existingMarks = existingNode?.marks ?? {};
    const newMarks = {
      ...existingMarks,
      [format]: !existingMarks[format as keyof MOMTextMarks],
    };

    const parts: MOMText[] = [];

    if (fragment.beforeText) {
      parts.push({
        ...existingNode,
        ...MOM.Engine.createText(fragment.beforeText, parentId),
        id: fragment.spanId,
        marks: existingMarks,
        url: existingMarks.link ? existingNode?.url : undefined,
      });
    }
    if (fragment.selectedText) {
      parts.push({
        ...existingNode,
        ...MOM.Engine.createText(fragment.selectedText, parentId),
        marks: newMarks,
        url: existingMarks.link ? existingNode?.url : undefined,
      });
    }
    if (fragment.afterText) {
      parts.push({
        ...existingNode,
        ...MOM.Engine.createText(fragment.afterText, parentId),
        marks: existingMarks,
        url: existingMarks.link ? existingNode?.url : undefined,
      });
    }

    result.set(fragment.spanId, parts);
  }
  return result;
}

function modifiedBlock(opt: { allNodes: Array<MOMText>; nodesBySpanId: Map<string, MOMText[]> }): Array<MOMText> {
  const { allNodes, nodesBySpanId } = opt;
  const result: MOMText[] = [];

  for (const node of allNodes) {
    if (nodesBySpanId.has(node.id)) {
      result.push(...(nodesBySpanId.get(node.id) ?? []));
    } else {
      result.push(node);
    }
  }
  return result;
}

/** получаем ноды детей блок ноды в виде MOM из обьекта стора MOMMap и складываем в массив */
function getExistingNodes(nodes: Array<MOMAllContent>, children: HTMLCollection) {
  const result: Array<MOMText> = [];

  for (const child of children) {
    const { id, parentId } = getElementData(child);
    const node = nodes.find((n) => n.id === id);

    if (node?.type === "text") {
      result.push(node);
    } else if (id && child.tagName === "SPAN") {
      result.push({
        ...MOM.Engine.createText(child.textContent ?? "", parentId ?? ""),
        id,
        marks: {},
      });
    }
  }

  return result;
}

function normalizeBlockChildren(blockNode: HTMLElement, nodes: Array<MOMAllContent>): Array<MOMAllContent> {
  let modified = false;
  const result = [...nodes];

  for (const child of Array.from(blockNode.childNodes)) {
    if (child.nodeType !== Node.TEXT_NODE) continue;
    const text = child.textContent ?? "";
    if (!text) continue;

    modified = true;
    const parentId = blockNode.getAttribute("data-id") as string;

    const newTextNode: MOMText = {
      ...MOM.Engine.createText(text, parentId),
      marks: {},
    };

    const span = document.createElement("span");

    span.dataset.id = newTextNode.id;
    span.dataset.type = "text";
    span.dataset.parentId = parentId;

    blockNode.insertBefore(span, child);
    span.appendChild(child);

    result.push(newTextNode);
  }

  return modified ? result : nodes;
}

/** сбрасываем нативное поведение браузера когда он запоминает форматирование через шорткат */
function resetNativeFormattingExecCommands() {
  document.execCommand("removeFormat", false, undefined);

  if (document.queryCommandState("bold")) {
    document.execCommand("bold", false, undefined);
  }
  if (document.queryCommandState("italic")) {
    document.execCommand("italic", false, undefined);
  }
  if (document.queryCommandState("underline")) {
    document.execCommand("underline", false, undefined);
  }
  if (document.queryCommandState("strikeThrough")) {
    document.execCommand("strikeThrough", false, undefined);
  }
}

/** Сохранение позиции каретки */
export function saveCursor(element: HTMLElement): CursorPosition | null {
  const selection = window.getSelection();
  if (!hasSelection(selection) || !selection.anchorNode) return null;

  const inEditableContainer =
    selection.anchorNode.parentElement?.closest("[data-editable]") && selection.focusNode?.parentElement?.closest("[data-editable");

  if (!inEditableContainer) return null;

  const range = getRange(selection);

  const getOffset = (node: Node, offset: number) => {
    const preRange = document.createRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(node, offset);
    return preRange.toString().length;
  };

  const start = getOffset(range.startContainer, range.startOffset);

  const result = {
    start,
    end: selection.isCollapsed ? start : getOffset(range.endContainer, range.endOffset),
  };

  return result;
}

/** Восстановление позиции каретки */
export function restoreCursor(element: HTMLElement, position: CursorPosition | null) {
  if (!position) return;

  const selection = window.getSelection();
  if (!selection) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  let currentPos = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text;
    const len = textNode.length;

    if (!startNode && position.start <= currentPos + len) {
      startNode = textNode;
      startOffset = position.start - currentPos;
    }

    if (!endNode && position.end <= currentPos + len) {
      endNode = textNode;
      endOffset = position.end - currentPos;
    }

    currentPos += len;
    if (startNode && endNode) break;
  }

  if (!startNode || !endNode) return;

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  selection.removeAllRanges();
  selection.addRange(range);
}

/** функция для проверки возможности пропуска обнолвения стейта, проверяется состояние DOM в строковом виде с состоянием MOM в строковом виде */
export function shoulSkipUpdateState(prev: string, current: string) {
  return prev === current;
}

/** Вставка сырого текста */
export function pastePlainText(text: string) {
  const selection = window.getSelection();
  if (!hasSelection(selection)) return;
  const range = getRange(selection);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Вставка курсора в конец */
export function setCursorToEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const selection = window.getSelection();
  if (!hasSelection(selection)) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Копирование ноды */
const copyNode = (nodes: MOMMap, node: MOMAllContent) => {
  const newNodes: MOMMap = {};

  const cloneRec = (currentId: string, newParentId: string | null): string => {
    const originalNode = nodes[currentId];
    if (!originalNode) return "";
    const newNodeId = nanoid();
    const newNode: MOMAllContent = {
      ...originalNode,
      id: newNodeId,
      parentId: newParentId,
      ...("children" in originalNode ? { children: [] } : {}),
    };
    newNodes[newNodeId] = newNode;
    if ("children" in originalNode && "children" in newNode) {
      originalNode.children.forEach((childId) => cloneRec(childId, newNodeId));
    }
    return newNodeId;
  };
  cloneRec(node.id, node.parentId);
  const result = Object.entries(newNodes).map(([_, node]) => ({ node, parentId: node.parentId }));
  return result;
};

/** Получение позиции каретки в пустом contenteditable */
function getEmptyCaretRect(range: Range) {
  const node = range.startContainer;
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;

  if (!element) return new DOMRect();

  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);

  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;

  let lineHeight = parseFloat(style.lineHeight);
  if (isNaN(lineHeight)) {
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const borderBottom = parseFloat(style.borderBottomWidth) || 0;
    lineHeight = rect.height - (paddingTop + paddingBottom + borderTop + borderBottom);
  }

  const x = rect.left + paddingLeft + borderLeft;
  const y = rect.top + paddingTop + borderTop;

  return {
    width: 0,
    height: lineHeight,
    top: y,
    right: x,
    bottom: y + lineHeight,
    left: x,
    x: x,
    y: y,
    toJSON: () => "",
  } as DOMRect;
}

export const Editor = {
  applyFormat,
  hasSelection,
  resetNativeFormattingExecCommands,
  saveCursor,
  restoreCursor,
  shoulSkipUpdateState,
  pastePlainText,
  setCursorToEnd,
  copyNode,
  getEmptyCaretRect,
  getRange,
} as const;
