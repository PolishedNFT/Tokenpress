const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const settings = {
	name: '',
	symbol: '',
	max_per: 10,
	price: 20000000000000000, // 0.020000000000000000 ether (18 places)
};

async function getManifest() {
	if (process.argv.length !== 3) {
		console.log('[?] Usage: npm run start -- ../path/to/input/');
		throw new Error('Invalid amount of arguments passed.');
	}

	let arg = process.argv[2];
	if (arg.length > 1 && arg[arg.length - 1] === '/') {
		arg = arg.slice(0, arg.length - 1);
	}
	const content = await fs.promises.readFile(`${arg}/manifest.json`);
	return JSON.parse(content);
}

async function main() {
	console.log(`TokenPress [v1.0.0]`);
	console.log('---------------------------------');

	const startTime = performance.now();

	const manifest = await getManifest();

	const replacements = {
		...settings,
		total: manifest.total,
		provenanceHash: manifest.provenanceHash,
		baseUri: manifest.baseUri,
	};

	const buildDir = path.resolve(__dirname, '../build');

	if (!fs.existsSync(buildDir)) {
		fs.mkdirSync(buildDir);
	}

	const tmp = String(fs.readFileSync(path.resolve(__dirname, `../template/ERC721.sol`)));
	const data = tmp.replace(/\$\{([^\}]+)\}/g, (matched, target) => replacements[target]);
	fs.writeFileSync(`${buildDir}/${replacements.name}.sol`, data);

	console.log(`[+] Printed ${replacements.name} [${replacements.symbol}] ${replacements.total}`);

	const endTime = (Math.abs(performance.now() - startTime) / 1000).toFixed(4);

	console.log('---------------------------------');
	console.log(`Printing completed in ${endTime}s`);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
