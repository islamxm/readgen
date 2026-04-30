import { produce } from "immer";
import { nanoid } from "nanoid";
import type { MOMAllContent, MOMDocument, MOMGroupMeta } from "../types";
import type { BatchOp, EngineResult, GroupOp, InsertOp, MOMOperation, MoveOp, RemoveOp, RenameGroupOp, UngroupOp, UpdateOp } from "./engine.types";
import { isParentNode } from "../guard/guard";
import { getDescendants, getGroup, getNodeById, getSiblingNodes, isDescendantOf } from "../selector/selectors";
import { canInsert } from "../validator/validator";

import {
  createParagraph,
  createHeading,
  createCode,
  createImage,
  createList,
  createListItem,
  createBlockquote,
  createAlert,
  createThematicBreak,
  createText,
  createInlineCode,
  createRaw,
  create,
} from "./engine.fabric";

/** Создание новой ноды и добавление его в обьект документа */
export function insertNode(opt: { doc: MOMDocument; node: MOMAllContent; parentId: string | null; index: number }): EngineResult {
  const { doc, node, parentId, index } = opt;

  const parentType = parentId === null ? "root" : getNodeById(parentId, doc.nodes)?.type;

  if (!parentType) {
    throw new Error(`insertNode: родитель "${parentId}" не найден`);
  }

  if (!canInsert(parentType, node.type)) {
    throw new Error(`insertNode: "${node.type}" не может быть ребёнком "${parentType}"`);
  }

  const newDoc = produce(doc, (draft) => {
    draft.nodes[node.id] = node;
    if (parentId === null) {
      draft.rootOrder.splice(index, 0, node.id);
    } else {
      const parent = getNodeById(parentId, draft.nodes);
      if (parent && isParentNode(parent)) {
        parent.children.splice(index, 0, node.id);
      }
    }
  });
  const op: InsertOp = {
    type: "insert",
    node,
    parentId,
    index,
  };

  return { op, doc: newDoc };
}

/** Создание нескольких нод и добавление в обьект документа как одна операция */
export function insertNodes(opt: {
  doc: MOMDocument;
  ops: Array<{
    node: MOMAllContent;
    parentId: string | null;
    index: number;
  }>;
}): EngineResult {
  const { doc, ops } = opt;
  let currentDoc = doc;

  const allOps: Array<MOMOperation> = [];

  for (const op of ops) {
    const result = insertNode({
      doc: currentDoc,
      node: op.node,
      parentId: op.parentId,
      index: op.index,
    });
    currentDoc = result.doc;
    allOps.push(result.op);
  }

  return {
    doc: currentDoc,
    op: { type: "batch", ops: allOps },
  };
}

/** Удаление ноды из документа */
export function removeNode(opt: { doc: MOMDocument; nodeId: string }): EngineResult {
  const { doc, nodeId } = opt;

  const node = getNodeById(nodeId, doc.nodes);
  if (!node) {
    throw new Error(`removeNode: Ноды с id=${nodeId} нет`);
  }
  const parentId = node.parentId;

  const siblings = parentId === null ? doc.rootOrder : ((doc.nodes[parentId] as any).children as string[]);
  const index = siblings.indexOf(nodeId);
  const descendantIds = getDescendants(doc.nodes, nodeId).map((n) => n.id);

  const newDoc = produce(doc, (draft) => {
    if (parentId === null) {
      draft.rootOrder.splice(index, 1);
    } else {
      const parent = getNodeById(parentId, draft.nodes);
      if (parent && isParentNode(parent)) {
        parent.children.splice(index, 1);
      }
    }
    delete draft.nodes[nodeId];
    descendantIds.forEach((id) => delete draft.nodes[id]);
  });

  const op: RemoveOp = {
    type: "remove",
    index,
    parentId,
    node,
    nodeId,
  };

  return { op, doc: newDoc };
}

/** Удаление нескольких нод из документа как одна операция */
export function removeNodes(opt: { doc: MOMDocument; nodeIds: Array<string> }): EngineResult {
  const { doc, nodeIds } = opt;
  let currentDoc = doc;

  const allOps: Array<MOMOperation> = [];

  for (const nodeId of nodeIds) {
    if (!currentDoc.nodes[nodeId]) {
      continue;
    }

    const result = removeNode({
      doc: currentDoc,
      nodeId,
    });

    currentDoc = result.doc;
    allOps.push(result.op);
  }
  if (allOps.length === 0) {
    return {
      doc,
      op: { type: "batch", ops: [] },
    };
  }

  return {
    doc: currentDoc,
    op: { type: "batch", ops: allOps },
  };
}

/** Изменение ноды */
export function updateNode(opt: { doc: MOMDocument; nodeId: string; patch: Partial<MOMAllContent> }): EngineResult {
  const { doc, nodeId, patch } = opt;

  const node = getNodeById(nodeId, doc.nodes);

  if (!node) {
    throw new Error(`updateNode: Ноды с id=${nodeId} нет`);
  }

  if (patch.type !== undefined && node.type !== patch.type) {
    throw new Error("updateNode: Нельзя менять тип через updateNode, используйте convertNode");
  }
  const prevPatch = Object.fromEntries(Object.keys(patch).map((k) => [k, (node as any)[k]])) as Partial<MOMAllContent>;

  const newDoc = produce(doc, (draft) => {
    // @ts-ignore
    draft.nodes[nodeId] = { ...draft.nodes[nodeId], ...patch };
  });

  const op: UpdateOp = {
    type: "update",
    nodeId,
    patch,
    prevPatch,
  };

  return { op, doc: newDoc };
}

/** Перемещение ноды */
export function moveNode(opt: { doc: MOMDocument; nodeId: string; toParentId: string | null; toIndex: number }): EngineResult {
  const { doc, nodeId, toParentId, toIndex } = opt;

  const node = getNodeById(nodeId, doc.nodes);

  if (!node) {
    throw new Error(`moveNode: Ноды с id=${nodeId} нет`);
  }

  const fromParentId = node.parentId;
  const fromSiblings = fromParentId === null ? doc.rootOrder : ((doc.nodes[fromParentId] as any).children as string[]);
  const fromIndex = fromSiblings.indexOf(nodeId);

  if (toParentId !== null) {
    const toParent = getNodeById(toParentId, doc.nodes);
    if (!toParent) {
      throw new Error("moveNode: Такого родителя нет");
    }
    if (
      isDescendantOf({
        nodes: doc.nodes,
        nodeId: toParentId,
        potentialAncestorId: nodeId,
      })
    ) {
      throw new Error("moveNode: Нельзя переместить ноду внутрь собственного потомка");
    }
    if (!isParentNode(toParent)) {
      throw new Error("moveNode: Нода не может иметь детей");
    }
  }

  const newDoc = produce(doc, (draft) => {
    if (fromParentId === null) {
      draft.rootOrder.splice(fromIndex, 1);
    } else {
      (draft.nodes[fromParentId] as any).children.splice(fromIndex, 1);
    }
    draft.nodes[nodeId].parentId = toParentId;
    const adjustedIndex = fromParentId === toParentId && toIndex > fromIndex ? toIndex - 1 : toIndex;

    if (toParentId === null) {
      draft.rootOrder.splice(adjustedIndex, 0, nodeId);
    } else {
      (draft.nodes[toParentId] as any).children.splice(adjustedIndex, 0, nodeId);
    }
  });
  const op: MoveOp = {
    type: "move",
    nodeId,
    fromParentId,
    fromIndex,
    toParentId,
    toIndex,
  };

  return { op, doc: newDoc };
}

/** @deprecated */
export function groupNodes(opt: { doc: MOMDocument; nodeIds: string[]; label: string }): EngineResult {
  const { doc, nodeIds, label } = opt;

  if (nodeIds.length < 2) {
    throw new Error("groupNodes: группа должна содержать минимум 2 ноды");
  }

  for (const nodeId of nodeIds) {
    const node = getNodeById(nodeId, doc.nodes);
    if (!node) {
      throw new Error(`groupNodes: нода "${nodeId}" не найдена`);
    }
    if (node.parentId !== null) {
      throw new Error(`groupNodes: нода "${nodeId}" не является top-level`);
    }
  }

  const indices = nodeIds.map((id) => doc.rootOrder.indexOf(id)).sort((a, b) => a - b);

  const isContiguous = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
  if (!isContiguous) {
    throw new Error("groupNodes: ноды должны быть смежными в документе");
  }

  const groupId = nanoid();
  const group: MOMGroupMeta = {
    id: groupId,
    label,
    order: indices[0],
  };

  const newDoc = produce(doc, (draft) => {
    nodeIds.forEach((nodeId) => {
      draft.nodes[nodeId].groupId = groupId;
    });
    draft.groups[groupId] = group;
  });

  const op: GroupOp = {
    type: "group",
    nodeIds,
    fromIndex: indices[0],
    toIndex: indices[indices.length - 1],
    group,
  };

  return { op, doc: newDoc };
}

/** @deprecated */
export function ungroupNodes(opt: { doc: MOMDocument; groupId: string }): EngineResult {
  const { doc, groupId } = opt;

  const group = getGroup(doc, groupId);
  if (!group) {
    throw new Error(`ungroupNodes: группа "${groupId}" не найдена`);
  }

  const nodeIds = Object.values(doc.nodes)
    .filter((node) => node.groupId === groupId)
    .map((node) => node.id);

  const indices = nodeIds.map((id) => doc.rootOrder.indexOf(id)).sort((a, b) => a - b);

  const newDoc = produce(doc, (draft) => {
    nodeIds.forEach((nodeId) => {
      delete draft.nodes[nodeId].groupId;
    });
    delete draft.groups[groupId];
  });

  const op: UngroupOp = {
    type: "ungroup",
    groupId,
    nodeIds,
    fromIndex: indices[0],
    toIndex: indices[indices.length - 1],
    prevGroup: group,
  };

  return { op, doc: newDoc };
}

/** @deprecated */
export function renameGroup(opt: { doc: MOMDocument; groupId: string; label: string }): EngineResult {
  const { doc, groupId, label } = opt;

  const group = getGroup(doc, groupId);
  if (!group) {
    throw new Error(`renameGroup: группа "${groupId}" не найдена`);
  }

  const prevLabel = group.label;

  const newDoc = produce(doc, (draft) => {
    draft.groups[groupId].label = label;
  });

  const op: RenameGroupOp = {
    type: "renameGroup",
    groupId,
    label,
    prevLabel,
  };

  return { op, doc: newDoc };
}

/** Применение операции к документу */
export function applyOp(opt: { doc: MOMDocument; op: MOMOperation }): MOMDocument {
  const { doc, op } = opt;

  switch (op.type) {
    case "insert":
      return insertNode({
        doc,
        node: op.node,
        parentId: op.parentId,
        index: op.index,
      }).doc;

    case "remove":
      return removeNode({
        doc,
        nodeId: op.nodeId,
      }).doc;

    case "update":
      return updateNode({
        doc,
        nodeId: op.nodeId,
        patch: op.patch,
      }).doc;

    case "move":
      return moveNode({
        doc,
        nodeId: op.nodeId,
        toParentId: op.toParentId,
        toIndex: op.toIndex,
      }).doc;

    case "group":
      return groupNodes({
        doc,
        nodeIds: op.nodeIds,
        label: op.group.label,
      }).doc;

    case "ungroup":
      return ungroupNodes({
        doc,
        groupId: op.groupId,
      }).doc;

    case "renameGroup":
      return renameGroup({
        doc,
        groupId: op.groupId,
        label: op.label,
      }).doc;

    case "batch":
      return op.ops.reduce((currentDoc: any, currentOp: any) => applyOp({ doc: currentDoc, op: currentOp }), doc);

    default:
      throw new Error(`applyOp: неизвестный тип операции`);
  }
}

/** Отмена операции в документе */
export function invertOp(op: MOMOperation): MOMOperation {
  switch (op.type) {
    case "insert":
      return {
        type: "remove",
        nodeId: op.node.id,
        parentId: op.parentId,
        index: op.index,
        node: op.node,
      } satisfies RemoveOp;

    case "remove":
      return {
        type: "insert",
        node: op.node,
        parentId: op.parentId,
        index: op.index,
      } satisfies InsertOp;

    case "update":
      return {
        type: "update",
        nodeId: op.nodeId,
        patch: op.prevPatch,
        prevPatch: op.patch,
      } satisfies UpdateOp;

    case "move":
      return {
        type: "move",
        nodeId: op.nodeId,
        fromParentId: op.toParentId,
        fromIndex: op.toIndex,
        toParentId: op.fromParentId,
        toIndex: op.fromIndex,
      } satisfies MoveOp;

    case "group":
      return {
        type: "ungroup",
        groupId: op.group.id,
        nodeIds: op.nodeIds,
        fromIndex: op.fromIndex,
        toIndex: op.toIndex,
        prevGroup: op.group,
      } satisfies UngroupOp;

    case "ungroup":
      return {
        type: "group",
        nodeIds: op.nodeIds,
        fromIndex: op.fromIndex,
        toIndex: op.toIndex,
        group: op.prevGroup,
      } satisfies GroupOp;

    case "renameGroup":
      return {
        type: "renameGroup",
        groupId: op.groupId,
        label: op.prevLabel,
        prevLabel: op.label,
      } satisfies RenameGroupOp;

    case "batch":
      // Обратный порядок + каждая операция инвертирована
      return {
        type: "batch",
        ops: [...op.ops].reverse().map(invertOp),
      } satisfies BatchOp;

    default:
      throw new Error(`invertOp: неизвестный тип операции`);
  }
}

export const Engine = {
  insertNode,
  insertNodes,
  removeNode,
  removeNodes,
  updateNode,
  moveNode,
  groupNodes,
  ungroupNodes,
  renameGroup,
  applyOp,
  invertOp,

  //fabrics
  create,
  createParagraph,
  createHeading,
  createCode,
  createImage,
  createList,
  createListItem,
  createBlockquote,
  createAlert,
  createThematicBreak,
  createText,
  createInlineCode,
  createRaw,
} as const;
