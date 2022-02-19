const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const settings = {
	name: '',
	symbol: '',
	max_per: 10,
	price: 20000000000000000, // 0.020000000000000000 ether (18 places)
};

function getWordDir() {
	if (process.argv.length !== 3) {
		console.log('[?] Usage: npm run start -- ../polished/work/dir/');
		throw new Error('Invalid amount of arguments passed.');
	}

	let arg = process.argv[2];
	if (arg.length > 1 && arg[arg.length - 1] === '/') {
		arg = arg.slice(0, arg.length - 1);
	}

	return arg;
}

async function getManifest(workDir) {
	const content = await fs.promises.readFile(`${workDir}/manifest.json`);
	return JSON.parse(content);
}

async function main() {
	console.log(`TokenPress [v1.0.0]`);
	console.log('---------------------------------');

	const startTime = performance.now();

	const workDir = getWordDir();

	const manifest = await getManifest(workDir);

	const replacements = {
		...settings,
		total: manifest.total,
		provenanceHash: manifest.provenanceHash,
		baseUri: manifest.baseUri,
	};

	if (!replacements.name || !replacements.symbol) {
		throw new Error('[!] Invalid settings');
	}

	const buildDir = `${workDir}/contract/`;

	if (!fs.existsSync(buildDir)) {
		fs.mkdirSync(buildDir);
	}

	const { metadata, ...manifestRest} = manifest;
	const newManifest = {
		...manifestRest,
		contract: settings,
		metadata,
	};

	fs.writeFileSync(`${workDir}/manifest.json`, JSON.stringify(newManifest, null, 2));

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
