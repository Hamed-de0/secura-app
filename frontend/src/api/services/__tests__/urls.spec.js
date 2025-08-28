import fs from 'fs';
import path from 'path';

function listJsFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listJsFiles(p));
    else if (e.isFile() && p.endsWith('.js')) out.push(p);
  }
  return out;
}

function findServiceCalls(code) {
  const calls = [];
  // naive matcher for getJSON/postJSON/putJSON/patchJSON/deleteJSON('...')
  const re = /(getJSON|postJSON|putJSON|patchJSON|deleteJSON)\(\s*(["'`])([\s\S]*?)\2/gi;
  let m;
  while ((m = re.exec(code))) {
    const url = m[3];
    calls.push({ fn: m[1], url, index: m.index });
  }
  return calls;
}

// Only check plain literals without template placeholders
function isPlainLiteral(u) {
  return typeof u === 'string' && !u.includes('${');
}

describe('Service URL trailing slashes', () => {
  const root = path.join(process.cwd(), 'src', 'api', 'services');
  const files = fs.existsSync(root) ? listJsFiles(root) : [];

  test('all service URLs in JSON helpers end with a trailing slash', () => {
    const offenders = [];
    for (const f of files) {
      const code = fs.readFileSync(f, 'utf8');
      for (const c of findServiceCalls(code)) {
        if (isPlainLiteral(c.url)) {
          // Allow query string at the end, but require the path part ends with '/'
          const [pathPart] = c.url.split('?');
          if (!pathPart.endsWith('/')) {
            offenders.push(`${path.relative(process.cwd(), f)}:${c.fn}(${c.url})`);
          }
        }
      }
    }
    if (offenders.length) {
      // Helpful failure for quick fixes
      // eslint-disable-next-line no-console
      console.error('\nTrailing slash offenders:\n' + offenders.join('\n'));
    }
    expect(offenders).toEqual([]);
  });
});

