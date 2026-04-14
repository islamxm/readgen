# ReadGen

**ReadGen** is a specialized, block-based README builder. This project showcases low-level DOM manipulation skills, a deep understanding of the React lifecycle, and architectural maturity in building complex text-editing systems.

### 🚀 Key Features
* **Custom WYSIWYG Engine:** Built entirely from scratch without third-party frameworks (Tiptap, Slate, etc.). Features custom `contenteditable` management, including manual render control and programmatic HTML injection to bypass standard text-engine limitations.
* **MOM (Virtual Markdown Object Model):** A custom core built with pure TypeScript (Parser, Validator, Guard, Engine). Operates as a pure data-in-data-out system with zero external dependencies, ensuring total document structure predictability.
* **Render Optimization:** Node-level update isolation. Utilizing memoized selectors and stable Action Facades ensures $O(1)$ rendering complexity during content manipulation, maintaining consistent performance regardless of document size.
* **Normalized State:** A flat data structure in the store for O(1) node access and efficient README tree manipulation without recursive tree-walking in the UI layer.

### 🛠 Tech Stack
* **Core:** React 19 (Low-level DOM manipulation), TypeScript.
* **State Management:** Redux Toolkit (Thunks for complex business logic, distinct Document and Selection slices).
* **Architecture:** Layered Architecture (Shared, UI, MOM, Store) with heavy focus on core logic encapsulation.