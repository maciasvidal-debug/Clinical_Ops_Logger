
const PROJECTS_COUNT = 100;
const PROTOCOLS_COUNT = 500;
const SITES_COUNT = 1000;
const LOGS_COUNT = 5000;

const projects = Array.from({ length: PROJECTS_COUNT }, (_, i) => ({ id: `PRJ-${i}`, name: `Project ${i}` }));
const protocols = Array.from({ length: PROTOCOLS_COUNT }, (_, i) => ({ id: `PROT-${i}`, name: `Protocol ${i}` }));
const sites = Array.from({ length: SITES_COUNT }, (_, i) => ({ id: `SITE-${i}`, name: `Site ${i}` }));

const logs = Array.from({ length: LOGS_COUNT }, (_, i) => ({
  id: `LOG-${i}`,
  projectId: `PRJ-${Math.floor(Math.random() * PROJECTS_COUNT)}`,
  protocolId: `PROT-${Math.floor(Math.random() * PROTOCOLS_COUNT)}`,
  siteId: `SITE-${Math.floor(Math.random() * SITES_COUNT)}`,
}));

function benchmarkArrayFind() {
  const start = performance.now();
  const result = logs.map(log => {
    const project = projects.find(p => p.id === log.projectId);
    const protocol = protocols.find(p => p.id === log.protocolId);
    const site = sites.find(s => s.id === log.siteId);
    return { project, protocol, site };
  });
  const end = performance.now();
  return end - start;
}

function benchmarkMapLookup() {
  const start = performance.now();
  const projectMap = new Map(projects.map(p => [p.id, p]));
  const protocolMap = new Map(protocols.map(p => [p.id, p]));
  const siteMap = new Map(sites.map(s => [s.id, s]));

  const result = logs.map(log => {
    const project = projectMap.get(log.projectId);
    const protocol = protocolMap.get(log.protocolId);
    const site = siteMap.get(log.siteId);
    return { project, protocol, site };
  });
  const end = performance.now();
  return end - start;
}

console.log(`Benchmarking with ${LOGS_COUNT} logs...`);
const arrayTime = benchmarkArrayFind();
console.log(`Array.find() approach: ${arrayTime.toFixed(4)}ms`);

const mapTime = benchmarkMapLookup();
console.log(`Map lookup approach: ${mapTime.toFixed(4)}ms`);

const improvement = ((arrayTime - mapTime) / arrayTime) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
