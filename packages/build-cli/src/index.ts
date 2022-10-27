#!/usr/bin/env node
/* eslint-disable quotes */
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import fs from 'fs-extra';
import webpackService from '@tuzki/scaffold-webpack-service';
import checkNodeVersion from './utils/checkNodeVersion.js';
import start from './start.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const packageInfo = await fs.readJSON(
    path.join(__dirname, '../package.json')
  );
  checkNodeVersion(packageInfo.engines.node, packageInfo.name);

  program
    .version(packageInfo.version, '-v, --version')
    .usage('<command> [options]');

  program
    .command('start')
    .description('start server')
    .allowUnknownOption()
    .option('--config <config>', 'custom config path')
    .option('-h, --host <host>', 'dev server host')
    .option('-p, --port <port>', 'dev server port')
    .option('--rootDir <rootDir>', 'project root directory')
    .action(async () => {
      await start();
    });

  program
    .command('build')
    .description('build project')
    .allowUnknownOption()
    .option('--config <config>', 'use custom config')
    .option('--rootDir <rootDir>', 'project root directory')
    .action(async ({ rootDir, ...commandArgs }) => {
      process.env.NODE_ENV = 'production';
      await webpackService.run({
        command: 'build',
        rootDir,
        commandArgs,
      });
    });

  program.parse();

  const proc = (program as any).runningCommand;

  if (proc) {
    proc.on('close', process.exit.bind(process));
    proc.on('error', () => {
      process.exit(1);
    });
  }

  const subCmd = program.args[0];
  if (!subCmd) {
    program.help();
  }
}

init();
