const fs = require('fs');

// The functions weren't correctly placed in `store.ts` when I ran my script due to regex replacement failing
let store = fs.readFileSync('lib/store.ts', 'utf8');

// The issue is that the actual functions aren't defined in the file, only in the return block.
const methodsStr = `  const addTodo = useCallback((todo: any) => setTodos((prev: any) => [todo, ...prev]), []);
  const updateTodo = useCallback((id: string, updates: any) => setTodos((prev: any) => prev.map((t: any) => t.id === id ? { ...t, ...updates } : t)), []);
  const deleteTodo = useCallback((id: string) => setTodos((prev: any) => prev.filter((t: any) => t.id !== id)), []);`;

if (!store.includes('const addTodo = useCallback')) {
    store = store.replace(
        '  const startTimer = useCallback',
        methodsStr + '\n\n  const startTimer = useCallback'
    );
    fs.writeFileSync('lib/store.ts', store);
}
