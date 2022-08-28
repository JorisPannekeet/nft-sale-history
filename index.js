#!/usr/bin/env node

/**
 * nft-sales
 * get salet per nft
 *
 * @author Joris Pannekeet <.>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const gs = require('./utils/gs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);

	console.log('starting...');
	rl.question('What is the token Id ? ', function (id) {
		rl.question('What is the contract address ? ', function (contract) {
			gs.start(id, contract, rl);
		});
	});

	rl.on('close', function () {
		console.log('\nBYE BYE !!!');
		process.exit(0);
	});
	debug && log(flags);
})();
