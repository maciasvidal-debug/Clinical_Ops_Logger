import { test } from 'node:test';
import assert from 'node:assert';
import { generateManagerInsights } from './actions.js';
import * as gemini from './gemini.js';

// Manual mock of genai
const mockGenaiInvalidJson = {
  models: {
    generateContent: async () => ({
      text: 'invalid json'
    })
  }
};

const mockGenaiHappyPath = {
  models: {
    generateContent: async () => ({
      text: JSON.stringify([{ title: 'Test Title', message: 'Test Message', type: 'info' }])
    })
  }
};

test('generateManagerInsights handles JSON parse error', async () => {
  const originalGenai = gemini.genai;
  gemini.setGenai(mockGenaiInvalidJson);

  try {
    const teamLogs = [{ userName: 'Test User', date: '2023-01-01', durationMinutes: 60, projectName: 'Test Project', activityName: 'Test Activity' }];
    const result = await generateManagerInsights(teamLogs);

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Failed to parse AI response into structured insights.");
  } finally {
    gemini.setGenai(originalGenai);
  }
});

test('generateManagerInsights handles happy path', async () => {
  const originalGenai = gemini.genai;
  gemini.setGenai(mockGenaiHappyPath);

  try {
    const teamLogs = [{ userName: 'Test User', date: '2023-01-01', durationMinutes: 60, projectName: 'Test Project', activityName: 'Test Activity' }];
    const result = await generateManagerInsights(teamLogs);

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.data[0].title, 'Test Title');
    }
  } finally {
    gemini.setGenai(originalGenai);
  }
});
