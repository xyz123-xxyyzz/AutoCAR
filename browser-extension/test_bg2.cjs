const fs = require('fs');
global.chrome = {
  storage: { local: { get: () => {}, set: () => {} } },
  runtime: { onMessage: { addListener: () => {} } },
  tabs: { onUpdated: { addListener: () => {} } },
  scripting: { executeScript: () => {} }
};

let bgCode = fs.readFileSync('./background.js', 'utf8');
try {
  eval(bgCode);
  console.log("No runtime errors in initialization.");
} catch (e) {
  console.error("Runtime error:", e);
}
