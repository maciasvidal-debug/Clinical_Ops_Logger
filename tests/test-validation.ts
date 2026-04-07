import {
  validateUserProfile,
  validateLogEntry,
  validateTodo,
  validateCategory,
  validateProject,
  validateProtocol,
  validateSite
} from '../lib/validation.ts';
import assert from 'node:assert';
import { test, describe } from 'node:test';

describe('Validation Logic', () => {
  test('validateUserProfile should validate correct profile', () => {
    const profile = {
      id: '123',
      email: 'test@example.com',
      role: 'manager',
      status: 'active',
      first_name: 'John'
    };
    const validated = validateUserProfile(profile);
    assert.ok(validated);
    assert.strictEqual(validated?.id, '123');
    assert.strictEqual(validated?.role, 'manager');
  });

  test('validateUserProfile should return null for invalid role', () => {
    const profile = {
      id: '123',
      email: 'test@example.com',
      role: 'hacker',
      status: 'active'
    };
    const validated = validateUserProfile(profile);
    assert.strictEqual(validated, null);
  });

  test('validateLogEntry should validate correct log', () => {
    const log = {
      id: 'log1',
      user_id: 'user1',
      date: '2023-01-01',
      duration_minutes: 30,
      role: 'crc',
      category: 'cat1',
      activity: 'act1',
      notes: 'test note'
    };
    const validated = validateLogEntry(log);
    assert.ok(validated);
    assert.strictEqual(validated?.duration_minutes, 30);
  });

  test('validateLogEntry should reject invalid duration type', () => {
    const log = {
      id: 'log1',
      user_id: 'user1',
      date: '2023-01-01',
      duration_minutes: '30',
      role: 'crc',
      category: 'cat1',
      activity: 'act1',
      notes: 'test note'
    };
    const validated = validateLogEntry(log);
    assert.strictEqual(validated, null);
  });

  test('validateCategory should validate recursive structures', () => {
    const category = {
      id: 'cat1',
      name: 'Category 1',
      activity_tasks: [
        {
          id: 'task1',
          category_id: 'cat1',
          name: 'Task 1',
          activity_subtasks: [
            { id: 'sub1', task_id: 'task1', name: 'Sub 1' }
          ]
        },
        {
           id: 'task2',
           category_id: 'cat1',
           name: 'Invalid Task'
        }
      ]
    };
    const validated = validateCategory(category);
    assert.ok(validated);
    assert.strictEqual(validated?.activity_tasks?.length, 2);
    assert.strictEqual(validated?.activity_tasks?.[0].activity_subtasks?.length, 1);
  });

  test('validateCategory should filter out invalid subtasks', () => {
    const category = {
      id: 'cat1',
      name: 'Category 1',
      activity_tasks: [
        {
          id: 'task1',
          category_id: 'cat1',
          name: 'Task 1',
          activity_subtasks: [
            { id: 'sub1', task_id: 'task1' } // missing name
          ]
        }
      ]
    };
    const validated = validateCategory(category);
    assert.ok(validated);
    assert.strictEqual(validated?.activity_tasks?.[0].activity_subtasks?.length, 0);
  });

  test('validateSite should validate required fields', () => {
    const site = {
      id: 's1',
      protocol_id: 'p1',
      name: 'Site 1',
      country: 'US'
    };
    const validated = validateSite(site);
    assert.ok(validated);
    assert.strictEqual(validated?.country, 'US');
  });

  test('validateSite should reject missing country', () => {
    const site = {
      id: 's1',
      protocol_id: 'p1',
      name: 'Site 1'
    };
    const validated = validateSite(site);
    assert.strictEqual(validated, null);
  });
});
