function base64urlEncode(str) {
  if (typeof window !== 'undefined' && window.btoa) {
    const utf8 = unescape(encodeURIComponent(str));
    return window.btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlDecode(str) {
  const pad = (s) => s + '==='.slice((s.length + 3) % 4);
  const normalized = pad(str.replace(/-/g, '+').replace(/_/g, '/'));
  if (typeof window !== 'undefined' && window.atob) {
    const bin = window.atob(normalized);
    try { return decodeURIComponent(escape(bin)); } catch { return bin; }
  }
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export function serializeViewParam(snapshot) {
  try {
    return base64urlEncode(JSON.stringify(snapshot));
  } catch (e) {
    console.error('serializeViewParam failed', e);
    return '';
  }
}

export function parseViewParam(value) {
  if (!value) return null;
  try {
    const json = base64urlDecode(value);
    return JSON.parse(json);
  } catch (e) {
    console.warn('parseViewParam failed; ignoring v param');
    return null;
  }
}