import { useSelector } from "../shared/lib";

export function useNode(nodeId: string) {
  const node = useSelector((s) => s.document.doc.nodes[nodeId]);
  return node;
}
