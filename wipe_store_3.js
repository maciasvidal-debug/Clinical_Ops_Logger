const fs = require('fs');
let store = fs.readFileSync('lib/store.ts', 'utf8');

// The replacement keeps failing to put the methods inside the body of the function `useAppStore()`
// where they are accessible by the `return {}` block.

const target = 'const startTimer = useCallback(() => {';
if (!store.includes('const addTodo = useCallback')) {
    const methodsStr = `const addTodo = useCallback((todo: any) => setTodos((prev: any) => [todo, ...prev]), []);
  const updateTodo = useCallback((id: string, updates: any) => setTodos((prev: any) => prev.map((t: any) => t.id === id ? { ...t, ...updates } : t)), []);
  const deleteTodo = useCallback((id: string) => setTodos((prev: any) => prev.filter((t: any) => t.id !== id)), []);`;

    // Manual injection using split
    const parts = store.split(target);
    if (parts.length === 2) {
        store = parts[0] + methodsStr + '\n\n  ' + target + parts[1];
        fs.writeFileSync('lib/store.ts', store);
    }
}
