import { performance } from 'perf_hooks';

const availableCategories = Array.from({ length: 50 }).map((_, i) => ({
  id: `cat-${i}`,
  name: `Category ${i}`,
  tasks: Array.from({ length: 10 }).map((_, j) => ({
    id: `task-${i}-${j}`,
    name: `Task ${i}-${j}`,
    subTasks: Array.from({ length: 5 }).map((_, k) => ({
      id: `sub-${i}-${j}-${k}`,
      name: `SubTask ${i}-${j}-${k}`,
    }))
  }))
}));

const categoryId = 'cat-49';
const activityId = 'task-49-9';
const subTaskId = 'sub-49-9-4';

const ITERATIONS = 1000000;

// Baseline
const startBaseline = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const categoryName = availableCategories.find(c => c.id === categoryId)?.name || categoryId;
  const task = availableCategories
    .find(c => c.id === categoryId)?.tasks
    .find(t => t.id === activityId);
  const activityName = task?.name || activityId;
  const subTaskName = task?.subTasks?.find(s => s.id === subTaskId)?.name;
}
const endBaseline = performance.now();
console.log(`Baseline: ${endBaseline - startBaseline}ms`);

// Optimized (reusing references)
const currentCategory = availableCategories.find(c => c.id === categoryId);
const currentTask = currentCategory?.tasks.find(t => t.id === activityId);
const currentSubTask = currentTask?.subTasks?.find(s => s.id === subTaskId);

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const categoryName = currentCategory?.name || categoryId;
  const activityName = currentTask?.name || activityId;
  const subTaskName = currentSubTask?.name;
}
const endOptimized = performance.now();
console.log(`Optimized (reusing references): ${endOptimized - startOptimized}ms`);

// Optimized (Map)
const catMap = new Map(availableCategories.map(c => [c.id, c]));
const taskMap = new Map(availableCategories.flatMap(c => c.tasks.map(t => [t.id, t])));
const subMap = new Map(availableCategories.flatMap(c => c.tasks.flatMap(t => (t.subTasks || []).map(s => [s.id, s]))));

const startMap = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const categoryName = catMap.get(categoryId)?.name || categoryId;
  const activityName = taskMap.get(activityId)?.name || activityId;
  const subTaskName = subMap.get(subTaskId)?.name;
}
const endMap = performance.now();
console.log(`Optimized (Map lookup): ${endMap - startMap}ms`);
