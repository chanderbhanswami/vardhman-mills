const fs = require('fs');
const path = require('path');

const routesDir = './src/routes';
const outputFile = './COMPREHENSIVE_API_ENDPOINTS.md';

// Parse route file to extract endpoints
function parseRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const endpoints = [];
  
  // Extract route definitions
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const [, method, routePath] = match;
    endpoints.push({
      method: method.toUpperCase(),
      path: routePath,
      file: fileName
    });
  }
  
  // Extract .route() style
  const routeStyleRegex = /\.route\s*\(\s*['"`]([^'"`]+)['"`]\s*\)[\s\S]*?\.(get|post|put|patch|delete)/g;
  while ((match = routeStyleRegex.exec(content)) !== null) {
    const [, routePath, method] = match;
    endpoints.push({
      method: method.toUpperCase(),
      path: routePath,
      file: fileName
    });
  }
  
  return endpoints;
}

// Get all route files
function getAllRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllRouteFiles(filePath));
    } else if (file.endsWith('.ts') && !file.includes('.test.')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Main execution
console.log('📊 Analyzing all route files...\n');

const routeFiles = getAllRouteFiles(routesDir);
let allEndpoints = [];
const fileStats = {};

routeFiles.forEach(file => {
  const endpoints = parseRouteFile(file);
  const fileName = path.basename(file);
  fileStats[fileName] = endpoints.length;
  allEndpoints = allEndpoints.concat(endpoints.map(ep => ({
    ...ep,
    fullFile: file
  })));
});

// Generate report
let report = `# COMPREHENSIVE API ENDPOINTS AUDIT\n\n`;
report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
report += `## Summary\n\n`;
report += `- **Total Route Files:** ${routeFiles.length}\n`;
report += `- **Total Endpoints Detected:** ${allEndpoints.length}\n`;
report += `- **Currently Tested:** 60\n`;
report += `- **Coverage:** ${((60 / allEndpoints.length) * 100).toFixed(2)}%\n\n`;

report += `## Endpoints by File\n\n`;
Object.entries(fileStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([file, count]) => {
    report += `- **${file}**: ${count} endpoints\n`;
  });

report += `\n## All Detected Endpoints\n\n`;
report += `| Method | Path | File |\n`;
report += `|--------|------|------|\n`;

allEndpoints
  .sort((a, b) => a.path.localeCompare(b.path))
  .forEach(ep => {
    report += `| ${ep.method} | \`${ep.path}\` | ${ep.file} |\n`;
  });

// Group by base path
report += `\n## Endpoints by Base Path\n\n`;
const grouped = {};
allEndpoints.forEach(ep => {
  const basePath = ep.path.split('/')[1] || 'root';
  if (!grouped[basePath]) grouped[basePath] = [];
  grouped[basePath].push(ep);
});

Object.entries(grouped)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([base, endpoints]) => {
    report += `### /${base} (${endpoints.length} endpoints)\n\n`;
    endpoints.forEach(ep => {
      report += `- **${ep.method}** \`${ep.path}\` (${ep.file})\n`;
    });
    report += '\n';
  });

fs.writeFileSync(outputFile, report);
console.log(`✅ Report generated: ${outputFile}`);
console.log(`\n📈 Statistics:`);
console.log(`   Total Endpoints: ${allEndpoints.length}`);
console.log(`   Currently Tested: 60`);
console.log(`   Missing Tests: ${allEndpoints.length - 60}`);
console.log(`   Coverage: ${((60 / allEndpoints.length) * 100).toFixed(2)}%`);
