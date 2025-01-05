const { ConnectionString } = require('connection-string');
const cs = new ConnectionString(process.env.DATABASE_URL);
const {
  user: USERNAME,
  password: PASSWORD,
  HOST = cs.host,
  DATABASE = cs.path && cs.path[0],
  SCHEMA = cs.params && cs.params.schema,
  SCHEMAS = cs.params && cs.params.schemas,
} = cs;

module.exports = {
  flywayArgs: {
    url: `jdbc:postgresql://${HOST}/${DATABASE}`,
    schemas: SCHEMAS || SCHEMA,
    defaultSchema: SCHEMA,
    locations: `filesystem:${
      process.env.DATABASE_MIGRATIONS_LOCATIONS || 'migrations'
    }`,
    user: USERNAME,
    password: PASSWORD,
    table: process.env.DATABASE_MIGRATIONS_TABLE
      ? `__migrations_${process.env.DATABASE_MIGRATIONS_TABLE}`
      : '__migrations',
    sqlMigrationSuffixes: '.sql',
    baselineOnMigrate: true,
  },
  // Use to configure environment variables used by flyway
  env: {
    JAVA_ARGS: '-Djava.util.logging.config.file=./conf/logging.properties',
  },
  version: '10.21.0', // optional, empty or missing will download the latest
  mavinPlugins: [
    {
      // optional, use to add any plugins (ie. logging)
      groupId: 'org.slf4j',
      artifactId: 'slf4j-api',
      version: '1.7.36',
      // This can be a specifc url to download that may be different then the auto generated url.
      downloadUrl:
        'https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar',
    },
    {
      groupId: 'org.slf4j',
      artifactId: 'slf4j-jdk14',
      version: '1.7.36',
    },
  ],
  downloads: {
    storageDirectory: `${__dirname}/tmp`, // optional, the specific directory to store the flyway downloaded files. The directory must be writable by the node app process' user.
    expirationTimeInMs: -1, // optional, -1 will never check for updates, defaults to 1 day.
  },
};
