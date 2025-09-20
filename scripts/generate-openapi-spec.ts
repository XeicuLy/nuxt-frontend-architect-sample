import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import consola from 'consola';

async function generateOpenApiSpec() {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  const outputPath = join(process.cwd(), 'public', 'openapi.yaml');
  const forceGenerate = process.argv.includes('--force');

  // Check if file already exists and we're not forcing generation
  if (existsSync(outputPath) && !forceGenerate) {
    consola.info(`OpenAPI spec already exists at ${outputPath}`);
    consola.info('Use --force flag to regenerate');
    return;
  }

  try {
    consola.info(`Fetching OpenAPI spec from ${serverUrl}/api/openapi.yaml`);

    const response = await fetch(`${serverUrl}/api/openapi.yaml`, {
      headers: {
        Accept: 'text/yaml, application/x-yaml',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    const spec = await response.text();

    // Ensure directory exists
    mkdirSync(dirname(outputPath), { recursive: true });

    // Write the spec to file
    writeFileSync(outputPath, spec, 'utf-8');

    consola.success(`OpenAPI spec saved to ${outputPath}`);
  } catch (error) {
    consola.error('Failed to generate OpenAPI spec:', error);

    if (existsSync(outputPath)) {
      consola.warn('Using existing OpenAPI spec file');
      return;
    }

    consola.error('No existing OpenAPI spec found. Please ensure server is running or provide a static spec file.');
    process.exit(1);
  }
}

generateOpenApiSpec();
