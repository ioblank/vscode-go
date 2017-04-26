/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import vscode = require('vscode');
import cp = require('child_process');
import path = require('path');
import { existsSync } from 'fs';
import { win32ToWslPath } from './goPath';

export type ChildProcess = cp.ChildProcess;

export function execFile(file: string, args?: string[], options?: cp.ExecFileOptions, 
		callback?: (error: Error, stdout: string, stderr: string) => void): cp.ChildProcess {
	if (process.env['GO_WSL'] === '1') {
		args = wslFixArgs(args);

		let wslArgs: string[] = ['-ic', [file, ...args].join(' ')];
		// console.log('wslExecFile: ' + process.env['GO_WSL_SHELL'] + ' ' + wslArgs.join(' '));
		return cp.execFile(process.env['GO_WSL_SHELL'], wslArgs, options, callback);
	}
	return cp.execFile(file, args, options, callback);
}

export function spawn(command: string, args?: string[], options?: cp.SpawnOptions): cp.ChildProcess {
	if (process.env['GO_WSL'] === '1') {
		args = wslFixArgs(args);

		let wslArgs: string[] = ['-ic', [command, ...args].join(' ')];
		// console.log('wslSpawn: ' + process.env['GO_WSL_SHELL'] + ' ' + wslArgs.join(' '));
		return cp.spawn(process.env['GO_WSL_SHELL'], wslArgs, options);
	}
	return cp.spawn(command, args, options);
}

export function execSync(command: string): Buffer {
	// console.log('wslExecSync: ' + command);
	return cp.execSync(command);
}

export function spawnSync(command: string, args?: string[], options?: cp.SpawnSyncOptionsWithStringEncoding): cp.SpawnSyncReturns<string> {
	if (process.env['GO_WSL'] === '1') {
		args = wslFixArgs(args);

		let wslArgs: string[] = ['-ic', [command, ...args].join(' ')];
		// console.log('wslSpawnSync: ' + process.env['GO_WSL_SHELL'] + ' ' + wslArgs.join(' '));
		cp.spawnSync(process.env['GO_WSL_SHELL'], wslArgs, options);
	}
	return cp.spawnSync(command, args, options);
}

function wslCdCommand(options: cp.SpawnOptions): string {
	if (options && options.cwd) {
		return `cd ${win32ToWslPath(options.cwd)} && `;
	}
	return '';
}

function wslFixArgs(args: string[]): string[] {
	if (args) {
		for (var i = 0; i < args.length; i++) {
			var elem = args[i];
			if (elem.length > 3 && elem.substring(1, 3) === ':\\') {
				args[i] = win32ToWslPath(elem);
			}
		}
	}
	return args;
}