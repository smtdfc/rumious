const yargs = require('yargs');
const path = require("path");
const tasks = require("./tasks");

yargs
  .command('init', 'Create a Rumious application ', {
    name: {
      description: 'App name',
      alias: 'n',
      type: 'string',
    },
  }, tasks.init)
  .demandOption('name', 'The name of the app is required to initialize')
  .command('build:dev', 'Built for development environment ', {},tasks.build.dev)
  .command('build:prod', 'Built for production environment ', {}, (argv) => {

  })
  .help()
  .argv;