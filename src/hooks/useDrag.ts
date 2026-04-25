import { useEffect, useRef } from "react";
import { useDocumentActions } from "./useDocumentActions";

const DRAGGRABLE_ELEMENT_DOM_SELECTOR = "[data-block]";
const DRAG_BUTTON_DOM_SELECTOR = "[data-drag]";
const BODY_CSS_CLASS = "markdown-body";
const BLOCK_TRANSITION_DURATION = 0.2;
const BLOCK_TRANSITION_ANIM = "cubic-bezier(0.2, 0, 0, 1)";

const createPortal = () => {
  const portal = document.createElement("div");

  const mask = document.createElement("div");

  mask.style.position = "fixed";
  mask.style.inset = "0";
  mask.style.background = "transparent";
  mask.style.zIndex = "999";
  mask.style.pointerEvents = "auto";

  portal.classList.add(BODY_CSS_CLASS);

  portal.append(mask);
  document.body.append(portal);

  return { portal, mask };
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  mt: number;
  mb: number;
};

type Block = {
  id: string;
  el: HTMLElement;
} & Rect;

export function useDrag() {
  const { updateRootOrder } = useDocumentActions();

  const containerRef = useRef<HTMLDivElement>(null);

  const isDragStarted = useRef(false);

  const ghostBlockData = useRef<{
    el: HTMLElement;
    initialMousePos: { x: number; y: number };
    top: number;
    left: number;
  }>(null);
  const originalBlockData = useRef<{
    id: string;
    el: HTMLElement;
    index: number;
    initialBounds: Rect;
  }>(null);
  const dragButton = useRef<HTMLElement>(null);

  const portal = useRef<HTMLDivElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const blocks = useRef<Array<Block>>([]);
  const transformedBlocks = useRef<Array<Block>>([]);

  const mouseCoords = useRef({ x: 0, y: 0 });
  const ticking = useRef(false);
  const dropIndex = useRef(-1);

  const startDrag = (e: PointerEvent) => {
    if (!(e.target instanceof HTMLElement && e.target.closest(DRAG_BUTTON_DOM_SELECTOR))) return;
    const dragBtn = e.target.closest(DRAG_BUTTON_DOM_SELECTOR);
    if (dragBtn instanceof HTMLElement) {
      dragButton.current = dragBtn;
      dragButton.current.style.opacity = "1";
    }
    const targetEl = e.target.closest(DRAGGRABLE_ELEMENT_DOM_SELECTOR);
    if (!targetEl || !(targetEl instanceof HTMLElement)) return;

    isDragStarted.current = true;

    blocks.current = Array.from(containerRef.current?.querySelectorAll(DRAGGRABLE_ELEMENT_DOM_SELECTOR) ?? [])
      .filter((el) => el instanceof HTMLElement)
      .map((el) => {
        const { width, height, x, y } = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        const mt = parseFloat(styles.marginTop);
        const mb = parseFloat(styles.marginBottom);
        const id = el.dataset.id ?? "";
        return {
          id,
          el,
          width,
          height,
          x,
          y,
          mt,
          mb,
        };
      });
    const originalIndex = blocks.current.findIndex((block) => block.el === targetEl);
    const originalBounds = targetEl.getBoundingClientRect();
    const originalStyles = getComputedStyle(targetEl);
    const mt = parseFloat(originalStyles.marginTop);
    const mb = parseFloat(originalStyles.marginBottom);
    const id = targetEl.dataset.id ?? "";
    originalBlockData.current = {
      id,
      el: targetEl,
      index: originalIndex,
      initialBounds: {
        height: originalBounds.height,
        width: originalBounds.width,
        x: originalBounds.x,
        y: originalBounds.y,
        mt,
        mb,
      },
    };
    originalBlockData.current.el.style.opacity = "0";
    containerRef.current?.setPointerCapture(e.pointerId);

    const clone = originalBlockData.current.el.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return;

    ghostBlockData.current = {
      el: clone,
      initialMousePos: {
        x: e.clientX,
        y: e.clientY,
      },
      top: originalBounds.top,
      left: originalBounds.left,
    };

    const { el: ghostEl } = ghostBlockData.current;

    ghostEl.style.opacity = "0.5";
    ghostEl.style.position = "fixed";
    ghostEl.style.zIndex = "1000";
    ghostEl.style.margin = "0";
    ghostEl.style.top = `${originalBounds.top}px`;
    ghostEl.style.left = `${originalBounds.left}px`;
    ghostEl.style.width = `${originalBounds.width}px`;
    ghostEl.style.height = `${originalBounds.height}px`;
    ghostEl.style.transform = `translate3d(${0}px, ${0}px, 0)`;
    ghostEl.style.willChange = "transform";
    ghostEl.style.pointerEvents = "none";
    ghostEl.style.touchAction = "none";

    const { mask: maskEl, portal: portalEl } = createPortal();
    portal.current = portalEl;
    portal.current.append(ghostEl);
    mask.current = maskEl;
  };

  const drag = (e: PointerEvent) => {
    if (!(isDragStarted.current && ghostBlockData.current)) {
      return;
    }

    mouseCoords.current = { x: e.clientX, y: e.clientY };
    if (ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      if (!isDragStarted.current || !ghostBlockData.current) {
        ticking.current = false;
        return;
      }

      const { initialMousePos, el } = ghostBlockData.current!;
      const { y: pointerClientY, x: pointerClientX } = mouseCoords.current;
      const y = pointerClientY - initialMousePos.y;

      if (!mask.current) return;

      mask.current.style.pointerEvents = "none";
      const currentDomBlock = document.elementFromPoint(pointerClientX, pointerClientY)?.closest(DRAGGRABLE_ELEMENT_DOM_SELECTOR);
      mask.current.style.pointerEvents = "auto";

      if (mask.current && originalBlockData.current && currentDomBlock && currentDomBlock !== originalBlockData.current.el) {
        const currentBlock = blocks.current.find((block) => block.el === currentDomBlock)!;
        const currentBlockIndex = blocks.current.findIndex((block) => block.el === currentBlock.el)!;
        const onUpperHalf = pointerClientY < currentBlock.y + currentBlock.height / 2;
        dropIndex.current = onUpperHalf ? currentBlockIndex : currentBlockIndex + 1;
        if (dropIndex.current > originalBlockData.current.index) {
          dropIndex.current -= 1;
        }

        const virtualOrder = [...blocks.current];
        const [origBlock] = virtualOrder.splice(originalBlockData.current.index, 1);
        virtualOrder.splice(dropIndex.current, 0, origBlock);
        const virtualPositions = computeAbsoluteYOfBlocks(virtualOrder, blocks.current[0]);
        blocks.current.forEach((block) => {
          const { y: virtualAbsoluteY } = virtualPositions.positions[block.id];
          const y = virtualAbsoluteY - block.y;
          block.el.style.transition = `transform ${BLOCK_TRANSITION_DURATION}s ${BLOCK_TRANSITION_ANIM}`;
          block.el.style.transform = `translate3d(0, ${y}px, 0)`;
        });
        transformedBlocks.current = virtualPositions.list;
      }
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      ticking.current = false;
    });
  };

  const endDrag = () => {
    if (!isDragStarted.current) return;

    if (dropIndex.current !== originalBlockData.current?.index && dropIndex.current !== -1) {
      commitDrop();
    } else {
      revertDrop();
    }
  };

  const commitDrop = () => {
    if (!ghostBlockData.current) return;
    const { y: targetY, x: targetX } = transformedBlocks.current[dropIndex.current];
    const ghostY = ghostBlockData.current.top;
    const ghostX = ghostBlockData.current.left;

    const translateY = targetY - ghostY;
    const translateX = targetX - ghostX;
    isDragStarted.current = false;
    ghostBlockData.current.el.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName !== "transform" || !originalBlockData.current) return;
        originalBlockData.current.el.style.opacity = "1";
        resetBlockTransforms();
        cleanUpAfterDrag();
        const newOrder = transformedBlocks.current.map((b) => b.id);
        updateRootOrder(newOrder);
      },
      { once: true },
    );

    ghostBlockData.current.el.style.transition = `transform ${BLOCK_TRANSITION_DURATION}s ${BLOCK_TRANSITION_ANIM}`;
    ghostBlockData.current.el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  };

  const revertDrop = () => {
    if (blocks.current.length === 0 || !ghostBlockData.current) return;
    ghostBlockData.current.el.style.transition = `transform ${BLOCK_TRANSITION_DURATION}s ${BLOCK_TRANSITION_ANIM}`;
    ghostBlockData.current.el.style.transform = "translate3d(0,0,0)";
    ghostBlockData.current.el.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName !== "transform" || !originalBlockData.current) return;
        originalBlockData.current.el.style.opacity = "1";
        resetBlockTransforms();
        cleanUpAfterDrag();
      },
      { once: true },
    );
  };

  const computeMarginCollapse = (mb: number, mt: number) => {
    return Math.max(0, mb, mt);
  };

  const computeAbsoluteYOfBlocks = (blocks: Array<Block>, firstBlock: Block) => {
    const initialY = firstBlock.y - firstBlock.mt;
    let currentY = initialY;
    const positions: Record<string, Block> = {};

    for (let i = 0; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const prevBlock = blocks[i - 1];

      const collapsed = prevBlock ? computeMarginCollapse(prevBlock.mb, currentBlock.mt) : currentBlock.mt;
      const offset = i === 0 ? collapsed : collapsed + prevBlock.height;
      currentY += offset;
      positions[currentBlock.id] = {
        ...currentBlock,
        y: currentY,
      };
    }
    const list = Object.entries(positions).map(([_, v]) => v);
    return { positions, list };
  };

  const resetBlockTransforms = () => {
    if (blocks.current) {
      blocks.current.forEach((b) => {
        b.el.style.transition = "none";
        b.el.style.transform = "translate3d(0,0,0)";
      });
    }
  };

  const cleanUpAfterDrag = () => {
    isDragStarted.current = false;
    ticking.current = false;
    mouseCoords.current = { x: 0, y: 0 };
    originalBlockData.current = null;
    ghostBlockData.current = null;
    dropIndex.current = -1;
    portal.current?.remove();
    mask.current = null;
    blocks.current = [];
    if (dragButton.current) {
      dragButton.current.style.opacity = "0";
      dragButton.current = null;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ref = containerRef.current;

    ref.addEventListener("pointerdown", startDrag);
    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);

    return () => {
      ref.removeEventListener("pointerdown", startDrag);
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  return { containerRef };
}
