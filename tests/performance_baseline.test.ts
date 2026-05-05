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

const localSaveCategoryMock = mock.fn(async (cat: any) => {});

// Mock the module - Using .ts extension for the import specifier to match the requirement of --experimental-strip-types
mock.module(import.meta.resolve('../lib/local_db.ts'), {
    namedExports: {
        localGetCategories: localGetCategoriesMock,
        localSaveCategory: localSaveCategoryMock,
        generateId: () => "new-id"
    }
});

test("Baseline - deleteActivityTask call count", async (t) => {
    const { deleteActivityTask } = await import("../lib/actions_config.ts");

    localSaveCategoryMock.mock.resetCalls();
    await deleteActivityTask("task2");

    console.log(`deleteActivityTask localSaveCategory calls: ${localSaveCategoryMock.mock.callCount()}`);
    // Current implementation calls it inside the loop when found
    assert.strictEqual(localSaveCategoryMock.mock.callCount(), 1);
});

test("Baseline - deleteActivitySubtask call count", async (t) => {
    const { deleteActivitySubtask } = await import("../lib/actions_config.ts");

    localSaveCategoryMock.mock.resetCalls();
    await deleteActivitySubtask("sub2");

    console.log(`deleteActivitySubtask localSaveCategory calls: ${localSaveCategoryMock.mock.callCount()}`);
    // Current implementation calls it inside the nested loop when found
    assert.strictEqual(localSaveCategoryMock.mock.callCount(), 1);
});
