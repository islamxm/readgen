import { useSelector } from "../shared/lib";

/** Обертка над document slice - только для get */
export function useDocument() {
  const rootOrder = useSelector((s) => s.document.doc.rootOrder);
  const groups = useSelector((s) => s.document.doc.groups);
  const nodes = useSelector((s) => s.document.doc.nodes);
  const doc = useSelector((s) => s.document.doc);
  const id = useSelector((s) => s.document.id);

  return {
    rootOrder,
    groups,
    nodes,
    doc,
    id
  };
}
