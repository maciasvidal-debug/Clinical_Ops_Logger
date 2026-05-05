import { describe, it, mock } from 'node:test';
import * as assert from 'node:assert';

const localSaveProjectMock = mock.fn(async () => {});
const localSaveProtocolMock = mock.fn(async () => {});
const generateIdMock = mock.fn(() => 'test-id');

mock.module(import.meta.resolve('./local_db.ts'), {
  namedExports: {
    localSaveProject: localSaveProjectMock,
    generateId: generateIdMock,
    localSaveProtocol: localSaveProtocolMock,
    localSaveSite: mock.fn(async () => {}),
    localGetProfile: mock.fn(async () => null),
  }
});

describe('createProject', () => {
  it('successfully creates a project and saves it locally', async () => {
    const { createProject } = await import('./actions_structure.ts');
    const name = 'Test Project';
    const description = 'Test Description';

    const project = await createProject(name, description);

    assert.strictEqual(project.name, name);
    assert.strictEqual(project.description, description);
    assert.strictEqual(project.id, 'test-id');
    assert.ok(project.created_at);
    assert.ok(!isNaN(Date.parse(project.created_at)), 'created_at should be a valid date string');

    assert.strictEqual(localSaveProjectMock.mock.callCount(), 1);
    assert.deepStrictEqual(localSaveProjectMock.mock.calls[0].arguments[0], project);
  });
});

describe('createProtocol', () => {
  it('successfully creates a protocol and saves it locally', async () => {
    const { createProtocol } = await import('./actions_structure.ts');
    const projectId = 'project-123';
    const name = 'Test Protocol';

    const protocol = await createProtocol(projectId, name);

    assert.strictEqual(protocol.project_id, projectId);
    assert.strictEqual(protocol.name, name);
    assert.strictEqual(protocol.id, 'test-id');
    assert.ok(protocol.created_at);
    assert.ok(!isNaN(Date.parse(protocol.created_at)), 'created_at should be a valid date string');

    assert.strictEqual(localSaveProtocolMock.mock.callCount(), 1);
    assert.deepStrictEqual(localSaveProtocolMock.mock.calls[0].arguments[0], protocol);
  });
});
