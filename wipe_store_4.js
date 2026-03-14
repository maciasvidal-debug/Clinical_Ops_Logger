const fs = require('fs');
let store = fs.readFileSync('lib/store.ts', 'utf8');

// The function is named `startTimer = () => {`, not `useCallback`
const target = 'const startTimer = () => {';
if (!store.includes('const addTodo =')) {
    const methodsStr = `const addTodo = (todo: any) => setTodos((prev: any) => [todo, ...prev]);
  const updateTodo = (id: string, updates: any) => setTodos((prev: any) => prev.map((t: any) => t.id === id ? { ...t, ...updates } : t));
  const deleteTodo = (id: string) => setTodos((prev: any) => prev.filter((t: any) => t.id !== id));`;

    // Manual injection using split
    const parts = store.split(target);
    if (parts.length === 2) {
        store = parts[0] + methodsStr + '\n\n  ' + target + parts[1];
        fs.writeFileSync('lib/store.ts', store);
    }
}
