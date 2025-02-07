#!/usr/bin/env node

require('dotenv').config();
const yargs = require('yargs');
const tasks = require('./tasks');

yargs
  .command('init', 'Create a Rumious application', {
    name: {
      description: 'App name',
      alias: 'n',
      type: 'string',
    },
  }, tasks.init)
  .command('build:dev', 'Build for the development environment', {
    watch: {
      description: 'Enable watch mode',
      alias: 'w',
      type: 'boolean',
      default: false,
    },
  }, tasks.build.dev)
  .command('build:prod', 'Build for the production environment', {}, tasks.build.prod)
  .help()
  .argv;