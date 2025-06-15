import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function replaceEnvs() {
  const clientBrowserPath = join(
    __dirname,
    '..',
    'client-authorizer',
    'browser',
  );
  if (existsSync(clientBrowserPath)) {
    const files = readdirSync(clientBrowserPath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const fullFilePath = join(clientBrowserPath, file);
        const content = readFileSync(fullFilePath).toString();
        writeFileSync(
          fullFilePath,
          content
            .replace(
              new RegExp('___CLIENT_AUTHORIZER_URL___', 'g'),
              process.env.SERVER_AUTHORIZER_AUTHORIZER_AUTHORIZER_URL ||
                'http://localhost:8080',
            )
            .replace(
              new RegExp('___CLIENT_MINIO_URL___', 'g'),
              process.env.SERVER_AUTHORIZER_MINIO_URL ||
                'http://localhost:9000',
            ),
        );
      }
    }
  }
}
