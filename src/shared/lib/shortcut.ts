type Combination = readonly [ModCode, ModCode, KeyCode] | readonly [ModCode, KeyCode] | readonly [KeyCode];

/**
 *
 * @param {KeyboardEvent} e - Обьект нативного DOM события keydown
 * @param {Combination} combination - Комбинация нажатых клавиш в виде кортежа
 * @param {(...args:any[]) => void} callback - Функция которая выполнится при выполнении условии
 * @param {boolean} preventDefault - нужно ли сделать e.preventDefault()
 * @param {boolean} stopPropagation - нужно ли остановить всплытие e.stopPropagation()
 */
export function shortcut(
  e: KeyboardEvent,
  combination: Combination,
  callback?: (...args: any[]) => any,
  preventDefault?: boolean,
  stopPropagation?: boolean,
) {
  const key = combination[combination.length - 1] as KeyCode;
  const mods = combination.slice(0, combination.length - 1) as Array<ModCode>;

  if (!keyDetect(e, key)) return false;

  const possibleMods: Array<ModCode> = ["Alt", "Ctrl", "Shift"];
  const modsMatch = possibleMods.every((mod) => {
    const isRequired = mods.includes(mod);
    const isPressed = modDetect[mod](e);
    return isRequired === isPressed;
  });

  if (modsMatch) {
    if (preventDefault) e.preventDefault();
    if (stopPropagation) e.stopPropagation();
    callback?.();
    return true;
  }
  return false;
}

const modDetect: Record<ModCode, any> = {
  Ctrl: (e: KeyboardEvent) => e.metaKey || e.ctrlKey,
  Alt: (e: KeyboardEvent) => e.altKey,
  Shift: (e: KeyboardEvent) => e.shiftKey,
};

const keyDetect = (e: KeyboardEvent, key: KeyCode) => e.code === keyCodes[key];

type ModCode = "Ctrl" | "Shift" | "Alt";
type KeyCode = keyof typeof keyCodes;
const keyCodes = {
  Tab: "Tab",
  Esc: "Escape",
  Enter: "Enter",
  Backspace: "Backspace",
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
  "7": "Digit7",
  "8": "Digit8",
  "9": "Digit9",
  "10": "Digit0",
  "-": "Minus",
  "=": "Equal",
  "[": "BracketLeft",
  "]": "BracketRight",
  "/": "Slash",
  "\\": "BackSlash",
  "'": "Quote",
  ":": "Semicolon",
  ",": "Comma",
  ".": "Period",
  "`": "Backquote",
  Q: "KeyQ",
  W: "KeyW",
  E: "KeyE",
  R: "KeyR",
  T: "KeyT",
  Y: "KeyY",
  U: "KeyU",
  I: "KeyI",
  O: "KeyO",
  P: "KeyP",
  A: "KeyA",
  S: "KeyS",
  D: "KeyD",
  F: "KeyF",
  G: "KeyG",
  H: "KeyH",
  J: "KeyJ",
  K: "KeyK",
  L: "KeyL",
  Z: "KeyZ",
  X: "KeyX",
  C: "KeyC",
  V: "KeyV",
  B: "KeyB",
  N: "KeyN",
  M: "KeyM",
} as const;

export const GlobalShortcuts = {
  REDO: ["Ctrl", "Shift", "Z"],
  SELECT_ALL_BLOCKS: ["Ctrl", "Shift", "A"],
  DELETE_SELECTED_BLOCKS: ["Shift", "Ctrl", "Backspace"],
  COPY_NODE: ["Shift", "Ctrl", "C"],
  PASTE_NODE: ["Shift", "Ctrl", "V"],
  UNDO: ["Ctrl", "Z"],
  REDO_LEGACY: ["Ctrl", "Y"],
  SAVE_DOCUMENT: ["Ctrl", "S"],
  SELECT_PREV_BLOCK: ["Shift", "Tab"],
  SELECT_NEXT_BLOCK: ["Tab"],
  CREATE_NEW_BLOCK: ["Enter"],
} as const satisfies Record<string, Combination>;
