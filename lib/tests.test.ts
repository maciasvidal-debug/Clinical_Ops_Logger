import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { calculateDailyTotal, testFormatHours, mockParseNaturalLanguage } from './tests';

describe('tests: calculateDailyTotal', () => {
  it('should return 0 for an empty logs array', () => {
    const logs: any[] = [];
    const targetDate = new Date('2026-03-12T12:00:00Z');
    assert.strictEqual(calculateDailyTotal(logs, targetDate), 0);
  });

  it('should sum durations for logs on the same day', () => {
    const logs = [
      { duration_minutes: 30, date: '2026-03-12' },
      { duration_minutes: 45, date: '2026-03-12' },
    ];
    const targetDate = new Date('2026-03-12T10:00:00Z');
    assert.strictEqual(calculateDailyTotal(logs, targetDate), 75);
  });

  it('should filter out logs from different days', () => {
    const logs = [
      { duration_minutes: 30, date: '2026-03-12' },
      { duration_minutes: 45, date: '2026-03-13' },
    ];
    const targetDate = new Date('2026-03-12T15:00:00Z');
    assert.strictEqual(calculateDailyTotal(logs, targetDate), 30);
  });

  it('should return 0 if no logs match the target date', () => {
    const logs = [
      { duration_minutes: 30, date: '2026-03-11' },
      { duration_minutes: 45, date: '2026-03-13' },
    ];
    const targetDate = new Date('2026-03-12T12:00:00Z');
    assert.strictEqual(calculateDailyTotal(logs, targetDate), 0);
  });
});

describe('tests: testFormatHours', () => {
  it('should format 0 minutes correctly', () => {
    assert.strictEqual(testFormatHours(0), '0h 0m');
  });

  it('should format exactly 1 hour correctly', () => {
    assert.strictEqual(testFormatHours(60), '1h 0m');
  });

  it('should format hours and minutes correctly', () => {
    assert.strictEqual(testFormatHours(125), '2h 5m');
  });
});

describe('tests: mockParseNaturalLanguage', () => {
  it('should parse "2 hours and 15 mins" correctly', () => {
    const result = mockParseNaturalLanguage('2 hours and 15 mins');
    assert.strictEqual(result.duration_minutes, 135);
    assert.strictEqual(result.success, true);
  });

  it('should parse "1 hour" correctly', () => {
    const result = mockParseNaturalLanguage('1 hour');
    assert.strictEqual(result.duration_minutes, 60);
    assert.strictEqual(result.success, true);
  });

  it('should parse "30 min" correctly', () => {
    const result = mockParseNaturalLanguage('30 min');
    assert.strictEqual(result.duration_minutes, 30);
    assert.strictEqual(result.success, true);
  });

  it('should return success false for invalid input', () => {
    const result = mockParseNaturalLanguage('working on something');
    assert.strictEqual(result.duration_minutes, 0);
    assert.strictEqual(result.success, false);
  });
});
