// Stubbed HTTP provider (no backend swap yet).
// When ready, implement these with real endpoints and auth.
const HttpProvider = {
  list() { throw new Error('HttpProvider not configured'); },
  save() { throw new Error('HttpProvider not configured'); },
  update() { throw new Error('HttpProvider not configured'); },
  delete() { throw new Error('HttpProvider not configured'); },
  getDefaultId() { throw new Error('HttpProvider not configured'); },
  setDefaultId() { throw new Error('HttpProvider not configured'); },
  get() { throw new Error('HttpProvider not configured'); },
};

export default HttpProvider;
