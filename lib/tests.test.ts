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

  it('should format only minutes correctly', () => {
    assert.strictEqual(testFormatHours(45), '0h 45m');
  });

  it('should handle negative numbers gracefully', () => {
    assert.strictEqual(testFormatHours(-30), '0h 0m');
  });

  it('should handle decimal minutes gracefully', () => {
    assert.strictEqual(testFormatHours(65.5), '1h 6m');
  });

  it('should handle NaN gracefully', () => {
    assert.strictEqual(testFormatHours(NaN), '0h 0m');
  });

  it('should handle Infinity gracefully', () => {
    assert.strictEqual(testFormatHours(Infinity), '0h 0m');
  });

  it('should handle large amounts of minutes correctly', () => {
    assert.strictEqual(testFormatHours(1500), '25h 0m');
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

  it('should handle uppercase and mixed case inputs', () => {
    const result = mockParseNaturalLanguage('2 HOURS AND 15 MINS');
    assert.strictEqual(result.duration_minutes, 135);
    assert.strictEqual(result.success, true);
  });

  it('should parse times without spaces between number and unit', () => {
    const result = mockParseNaturalLanguage('2hours and 15mins');
    assert.strictEqual(result.duration_minutes, 135);
    assert.strictEqual(result.success, true);
  });

  it('should extract time from a larger sentence', () => {
    const result = mockParseNaturalLanguage('I worked for 2 hours and 30 mins on this task.');
    assert.strictEqual(result.duration_minutes, 150);
    assert.strictEqual(result.success, true);
  });

  it('should safely handle decimal hours and correctly parse them', () => {
    const result = mockParseNaturalLanguage('1.5 hours');
    assert.strictEqual(result.duration_minutes, 90);
    assert.strictEqual(result.success, true);
  });

  it('should safely handle negative values or ignore them', () => {
    const result = mockParseNaturalLanguage('-1 hour');
    assert.strictEqual(result.duration_minutes, 0);
    assert.strictEqual(result.success, false);
  });

  it('should handle zero values correctly', () => {
    const result = mockParseNaturalLanguage('0 hours');
    assert.strictEqual(result.duration_minutes, 0);
    assert.strictEqual(result.success, false);
  });

  it('should handle empty or whitespace-only inputs', () => {
    const result = mockParseNaturalLanguage('   ');
    assert.strictEqual(result.duration_minutes, 0);
    assert.strictEqual(result.success, false);
  });
});
