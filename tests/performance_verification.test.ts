import { test, mock } from "node:test";
import assert from "node:assert";

// Mocking local_db functions
const localGetCategoriesMock = mock.fn(async () => {
    return [
        {
            id: "cat1",
            name: "Cat 1",
            is_active: true,
            activity_tasks: [
                {
                    id: "task1",
                    name: "Task 1",
                    is_active: true,
                    activity_subtasks: [
                        { id: "sub1", name: "Sub 1", is_active: true }
                    ]
                },
                {
                    id: "task2",
                    name: "Task 2",
                    is_active: true,
                    activity_subtasks: [
                        { id: "sub2", name: "Sub 2", is_active: true }
                    ]
                }
            ]
        }
    ];
});

const localSaveCategoryMock = mock.fn(async (cat: any) => {
    // console.log("Saving category:", cat.id);
});

// Mock the module
mock.module(import.meta.resolve('../lib/local_db.ts'), {
    namedExports: {
        localGetCategories: localGetCategoriesMock,
        localSaveCategory: localSaveCategoryMock,
        generateId: () => "new-id"
    }
});

test("Optimized - deleteActivityTask call count", async (t) => {
    const { deleteActivityTask } = await import("../lib/actions_config.ts");

    localSaveCategoryMock.mock.resetCalls();
    await deleteActivityTask("task2");

    const callCount = localSaveCategoryMock.mock.callCount();
    console.log(`deleteActivityTask localSaveCategory calls: ${callCount}`);
    assert.strictEqual(callCount, 1, "Should call localSaveCategory exactly once");

    const savedCat = localSaveCategoryMock.mock.calls[0].arguments[0];
    const task2 = savedCat.activity_tasks.find((t: any) => t.id === "task2");
    assert.strictEqual(task2.is_active, false, "Task should be deactivated");
});

test("Optimized - deleteActivitySubtask call count", async (t) => {
    const { deleteActivitySubtask } = await import("../lib/actions_config.ts");

    localSaveCategoryMock.mock.resetCalls();
    await deleteActivitySubtask("sub2");

    const callCount = localSaveCategoryMock.mock.callCount();
    console.log(`deleteActivitySubtask localSaveCategory calls: ${callCount}`);
    assert.strictEqual(callCount, 1, "Should call localSaveCategory exactly once");

    const savedCat = localSaveCategoryMock.mock.calls[0].arguments[0];
    const task2 = savedCat.activity_tasks.find((t: any) => t.id === "task2");
    const sub2 = task2.activity_subtasks.find((s: any) => s.id === "sub2");
    assert.strictEqual(sub2.is_active, false, "Subtask should be deactivated");
});

test("Optimized - deleteActivityTask when not found", async (t) => {
    const { deleteActivityTask } = await import("../lib/actions_config.ts");

    localSaveCategoryMock.mock.resetCalls();
    await deleteActivityTask("non-existent");

    const callCount = localSaveCategoryMock.mock.callCount();
    console.log(`deleteActivityTask (not found) localSaveCategory calls: ${callCount}`);
    assert.strictEqual(callCount, 0, "Should NOT call localSaveCategory if not found");
});
