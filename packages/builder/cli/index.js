#!/usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import init from './init.js';
import { dev, prod } from './build.js';

dotenv.config();

yargs(hideBin(process.argv))
  .scriptName('Rumious builder CLI')
  .command('init', 'Create a Rumious application', {
    name: {
      description: 'App name',
      alias: 'n',
      type: 'string',
    },
  }, init)
  .command('build:dev', 'Build for the development environment', {
    watch: {
      description: 'Enable watch mode',
      alias: 'w',
      type: 'boolean',
      default: false,
    },
  }, dev)
  .command('build:prod', 'Build for the production environment', {}, prod)
  .help()
  .argv;

