const chromium = require('chromium');
const { SubProcess } = require('teen_process');
const path = require('path');

const InspectorPath = path.join(__dirname, 'dist', 'index.html');

async function openInspector () {
  let subproc = new SubProcess(chromium.path, [`--app=file\:///${InspectorPath}`]);
  await subproc.start();
}

if (require.main === module) {
  openInspector();
}

module.exports = openInspector;
