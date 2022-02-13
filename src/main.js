const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const settings = {
	name: '',
	symbol: '',
	total: 1,
	max_per: 1,
	price: 25000000000000000, // 0.025 Ether
};

const buildPath = path.resolve(__dirname, '../build');

function printingPress(templateName, replacements) {
	const tmp = String(fs.readFileSync(path.resolve(__dirname, `../template/${templateName}`)));

	const data = tmp.replace(/\$\{([^\}]+)\}/g, (matched, target) => replacements[target]);

	if (!fs.existsSync(buildPath)) {
		fs.mkdirSync(buildPath);
	}

	fs.writeFileSync(`${buildPath}/${replacements.name}.sol`, data);

	console.log(`[+] Printed ${replacements.name} [${replacements.symbol}] ${replacements.total}`);
}

function main() {
	console.log(`TokenPress [v1.0.0]`);
	console.log('---------------------------------');

	const startTime = performance.now();

	printingPress('ERC721.sol', settings);

	const endTime = (Math.abs(performance.now() - startTime) / 1000).toFixed(4);

	console.log('---------------------------------');
	console.log(`Printing completed in ${endTime}s`);
}

main();
