import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// source

const files2: string[] = [
  'libs/core/auth/src/lib/generated/prisma-client/internal/class.ts',
  'apps/server-sso/src/app/generated/prisma-client/internal/class.ts',
  'apps/server-supabase/src/app/generated/prisma-client/internal/class.ts',
  'apps/server-authorizer/src/app/generated/prisma-client/internal/class.ts',
];
for (let file of files2) {
  writeFileSync(
    file,
    readFileSync(file)
      .toString()
      .split('("@prisma/client/runtime')
      .join('("node_modules/@prisma/client/runtime')
      .split('require.resolve(')
      .join("(await import('node:path')).resolve(")
  );
}

// buit

const files3: string[] = [
  'dist/libs/core/auth/src/lib/generated/prisma-client/internal/class.js',
];
for (let file of files3) {
  if (existsSync(file)) {
    writeFileSync(
      file,
      readFileSync(file)
        .toString()
        .split('require("node_modules/@prisma')
        .join('require("@prisma')
    );
  }
}
