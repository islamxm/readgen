import { useSelector } from "../shared/lib";

/** Обертка над document slice - только для get */
export function useDocument() {
  const rootOrder = useSelector((s) => s.document.doc.rootOrder);
  const groups = useSelector((s) => s.document.doc.groups);

  return {
    rootOrder,
    groups,
  };
}
