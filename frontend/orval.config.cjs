// Orval configuration for generating a typed API client
// Docs: https://orval.dev

/** @type {import('orval').ConfigFile} */
module.exports = {
  api: {
    input: 'src/api/openapi.json',
    output: {
      target: 'src/api/client/index.ts',
      client: 'fetch',
      clean: true,
      // Avoid generating mock files
      mock: false,
    },
    override: {
      // FastAPI schema often lacks servers; set base URL explicitly
      baseUrl: 'http://127.0.0.1:8001',
    },
  },
};

