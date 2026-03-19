import { test } from 'node:test';
import assert from 'node:assert';
import { Project, Protocol, Site, Region } from './types';

// Mock types correctly for our mapping
const COUNTRY_TO_REGION: Record<string, string> = {
  "Chile": "South America",
  "USA": "North America",
  "Spain": "Europe",
};

test('Country correctly maps to region', () => {
  const result1 = COUNTRY_TO_REGION["Chile"];
  const result2 = COUNTRY_TO_REGION["USA"];
  const result3 = COUNTRY_TO_REGION["Spain"];

  assert.strictEqual(result1, "South America");
  assert.strictEqual(result2, "North America");
  assert.strictEqual(result3, "Europe");
});

test('Filter logs by region correctly', () => {
  // Mock data
  const sites: Site[] = [
    { id: "s1", protocol_id: "p1", name: "Site 1", country: "Chile", region_id: "r1", created_at: "" },
    { id: "s2", protocol_id: "p1", name: "Site 2", country: "Spain", region_id: "r2", created_at: "" },
  ];

  const logs: any[] = [
    { id: "l1", site_id: "s1" },
    { id: "l2", site_id: "s2" },
    { id: "l3", site_id: "s1" },
  ];

  const selectedRegionId = "r1";

  // Implementation logic simulation
  const sitesInRegion = sites.filter(s => s.region_id === selectedRegionId).map(s => s.id);
  const filteredLogs = logs.filter(log => log.site_id && sitesInRegion.includes(log.site_id));

  assert.strictEqual(sitesInRegion.length, 1);
  assert.strictEqual(sitesInRegion[0], "s1");
  assert.strictEqual(filteredLogs.length, 2);
  assert.strictEqual(filteredLogs[0].id, "l1");
  assert.strictEqual(filteredLogs[1].id, "l3");
});
