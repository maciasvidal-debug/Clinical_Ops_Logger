const fs = require('fs');

// We need to exactly put `addTodo` above `startTimer` inside `useAppStore()`.
let store = fs.readFileSync('lib/store.ts', 'utf8');

if (!store.includes('const addTodo = useCallback')) {
    const target = '  const startTimer = useCallback(() => {';
    store = store.replace(target, `  const addTodo = useCallback((todo: any) => setTodos((prev: any) => [todo, ...prev]), []);
  const updateTodo = useCallback((id: string, updates: any) => setTodos((prev: any) => prev.map((t: any) => t.id === id ? { ...t, ...updates } : t)), []);
  const deleteTodo = useCallback((id: string) => setTodos((prev: any) => prev.filter((t: any) => t.id !== id)), []);\n\n` + target);
    fs.writeFileSync('lib/store.ts', store);
}

// In app/page.tsx, there's a type conflict. The original type View was maybe defined differently.
let page = fs.readFileSync('app/page.tsx', 'utf8');
page = page.replace('export type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";', '');
page = page.replace('type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";', '');
page = page.replace('export default function App() {', 'export type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";\n\nexport default function App() {');
fs.writeFileSync('app/page.tsx', page);

// Shell
let shell = fs.readFileSync('components/layout/Shell.tsx', 'utf8');
shell = shell.replace('import { View } from "@/app/page";', ''); // Let's avoid importing View and just use a string
shell = shell.replace('currentView: View;', 'currentView: string;');
shell = shell.replace('onViewChange: (view: View) => void;', 'onViewChange: (view: any) => void;');
shell = shell.replace('currentView: "dashboard" | "log" | "history" | "reports" | "team" | "settings";', 'currentView: string;');
shell = shell.replace('onViewChange: (view: "dashboard" | "log" | "history" | "reports" | "team" | "settings") => void;', 'onViewChange: (view: any) => void;');
fs.writeFileSync('components/layout/Shell.tsx', shell);
