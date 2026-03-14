const { execSync } = require('child_process');

// The repo git state is slightly a mess because I've done file-level mods that were added to index or left as modified.
// Let's just forcibly inject the exact content needed for the 3 missing functions in `store.ts`
// and the type change in `Shell.tsx`.

const fs = require('fs');

let store = fs.readFileSync('lib/store.ts', 'utf8');

if (!store.includes('const addTodo = useCallback')) {
    store = store.replace(
        'const startTimer = useCallback(() => {',
        `const addTodo = useCallback((todo: any) => setTodos((prev: any) => [todo, ...prev]), []);
  const updateTodo = useCallback((id: string, updates: any) => setTodos((prev: any) => prev.map((t: any) => t.id === id ? { ...t, ...updates } : t)), []);
  const deleteTodo = useCallback((id: string) => setTodos((prev: any) => prev.filter((t: any) => t.id !== id)), []);

  const startTimer = useCallback(() => {`
    );
    fs.writeFileSync('lib/store.ts', store);
}

let shell = fs.readFileSync('components/layout/Shell.tsx', 'utf8');
shell = shell.replace('currentView: "dashboard" | "log" | "history" | "reports" | "team";', 'currentView: "dashboard" | "log" | "history" | "reports" | "team" | "settings";');
shell = shell.replace('onViewChange: (view: "dashboard" | "log" | "history" | "reports" | "team") => void;', 'onViewChange: (view: "dashboard" | "log" | "history" | "reports" | "team" | "settings") => void;');
fs.writeFileSync('components/layout/Shell.tsx', shell);
