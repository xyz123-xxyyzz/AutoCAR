global.chrome = {
  storage: { local: { get: () => {}, set: () => {} } },
  runtime: { onMessage: { addListener: () => {} } },
  tabs: { onUpdated: { addListener: () => {} } },
  scripting: { executeScript: () => {} }
};

import fs from 'fs';
import './background.js';
console.log("No runtime errors in initialization.");
