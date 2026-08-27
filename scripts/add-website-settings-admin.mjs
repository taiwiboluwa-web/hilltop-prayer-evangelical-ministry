import fs from 'node:fs';

// This script is intentionally non-destructive. The AdminPortal source is
// restored/maintained by the canonical build scripts, so an exact-string
// source rewrite is unsafe and can break deployments when the dashboard
// structure changes. Website Settings should be integrated directly into
// AdminPortal rather than mutating it with brittle markers.
const path = 'src/pages/AdminPortal.tsx';
const exists = fs.existsSync(path);
console.log(exists
  ? 'Website Settings integration build step skipped safely; AdminPortal source left unchanged.'
  : 'Website Settings integration skipped safely; AdminPortal source is not present.');
