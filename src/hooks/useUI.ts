import { useDispatch, useSelector } from "@/shared/lib";
import { uiStoreActions } from "@/store/slices/uiSlice";

export function useUI() {
  const dispatch = useDispatch();
  const blockHighlighting = useSelector(s => s.ui.blockHighlighting);

  function disableBlockHighlighting() {
    dispatch(uiStoreActions.disableBlockHighlighting());
  }

  function enableBlockHighlighting() {
    dispatch(uiStoreActions.enableBlockHighlighting());
  }

  function toggleBlockHighlighting() {
    if(blockHighlighting) {
      disableBlockHighlighting();
    } else {
      enableBlockHighlighting();
    }
  }

  return {
    blockHighlighting,

    disableBlockHighlighting,
    enableBlockHighlighting,
    toggleBlockHighlighting
  }
}