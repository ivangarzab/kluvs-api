/// <reference lib="deno.window" />

async function validateOpenAPI(): Promise<void> {
  const specPath = './openapi.json';

  console.log('🔍 Validating OpenAPI specification...\n');

  try {
    const content = await Deno.readTextFile(specPath);
    const spec = JSON.parse(content);

    const errors: string[] = [];

    if (!spec.openapi) errors.push('Missing required field: openapi');

    if (!spec.info) {
      errors.push('Missing required field: info');
    } else {
      if (!spec.info.title) errors.push('Missing required field: info.title');
      if (!spec.info.version) errors.push('Missing required field: info.version');
      if (!spec.info.description) errors.push('Missing required field: info.description');
    }

    if (!spec.paths) {
      errors.push('Missing required field: paths');
    } else {
      const pathCount = Object.keys(spec.paths).length;
      if (pathCount === 0) {
        errors.push('No API paths defined in spec.paths');
      } else {
        console.log(`✓ Found ${pathCount} endpoint(s)`);
      }
    }

    if (!spec.servers || !Array.isArray(spec.servers) || spec.servers.length === 0) {
      errors.push('Missing or empty servers array');
    } else {
      console.log(`✓ Found ${spec.servers.length} server(s)`);
    }

    if (!spec.components?.securitySchemes?.bearerAuth) {
      errors.push('Missing security scheme: bearerAuth');
    } else {
      console.log('✓ Security scheme configured');
    }

    if (errors.length > 0) {
      console.error('\n❌ Validation failed:\n');
      errors.forEach((err) => console.error(`  - ${err}`));
      Deno.exit(1);
    }

    console.log(`✓ Info: ${spec.info.title} (v${spec.info.version})`);
    console.log(`✓ OpenAPI version: ${spec.openapi}`);
    console.log('\n✅ OpenAPI specification is valid!\n');
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.error(`❌ OpenAPI file not found: ${specPath}`);
      Deno.exit(1);
    }
    if (err instanceof SyntaxError) {
      console.error(`❌ Invalid JSON in ${specPath}: ${err.message}`);
      Deno.exit(1);
    }
    console.error(`❌ Validation error: ${err.message}`);
    Deno.exit(1);
  }
}

await validateOpenAPI();
