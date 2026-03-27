import test from 'node:test';
import assert from 'node:assert';
import { getTranslationProxy } from './proxy';
import { dictionaries } from './dictionaries';

test('I18n Proxy - English (base language)', () => {
  const enDict = getTranslationProxy('en');

  // Should get existing keys directly
  assert.strictEqual(enDict.common.save, dictionaries.en.common.save);

  // Missing key in English should return the path
  assert.strictEqual((enDict.common as any).nonExistentKey, 'common.nonExistentKey');
});

test('I18n Proxy - Spanish with fallbacks', () => {
  const esDict = getTranslationProxy('es');

  // Should get existing Spanish translation
  assert.strictEqual(esDict.common.save, dictionaries.es.common.save);

  // If a key somehow doesn't exist in Spanish but does in English, it should fall back to English
  // We simulate this by mutating the in-memory ES dictionary for this test
  const originalEsLoading = dictionaries.es.common.loading;
  (dictionaries.es.common as any).loading = undefined;

  assert.strictEqual(esDict.common.loading, dictionaries.en.common.loading);

  // Restore
  dictionaries.es.common.loading = originalEsLoading;

  // Ultimate fallback if missing everywhere
  assert.strictEqual((esDict.common as any).nonExistentKey, 'common.nonExistentKey');
});

test('I18n Proxy - Portuguese with fallbacks', () => {
  const ptDict = getTranslationProxy('pt');

  // Existing Portuguese key
  assert.strictEqual(ptDict.common.cancel, dictionaries.pt.common.cancel);

  // Fallback to English
  const originalPtRefresh = dictionaries.pt.common.refresh;
  (dictionaries.pt.common as any).refresh = undefined;

  assert.strictEqual(ptDict.common.refresh, dictionaries.en.common.refresh);

  // Restore
  dictionaries.pt.common.refresh = originalPtRefresh;

  // Ultimate fallback
  assert.strictEqual((ptDict.common as any).somethingMissing, 'common.somethingMissing');
});

test('I18n Proxy - Object Fallbacks', () => {
  const esDict = getTranslationProxy('es');

  // Completely clear an entire category to test object fallback wrapping
  const originalEsAuth = dictionaries.es.auth;
  (dictionaries.es as any).auth = undefined;

  // Since auth is missing in Spanish, the proxy should return a proxy wrapping the English 'auth' object
  assert.strictEqual(esDict.auth.signIn, dictionaries.en.auth.signIn);

  // Verify that ultimate fallback works even nested within the fallen-back object
  assert.strictEqual((esDict.auth as any).deepMissingKey, 'auth.deepMissingKey');

  // Restore
  dictionaries.es.auth = originalEsAuth;
});
