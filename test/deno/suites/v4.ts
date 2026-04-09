import { ModelTestSuite, PipelineTestSuite } from "@benchmarking/core-v4";

const Suites = [ModelTestSuite, PipelineTestSuite];
const Results = "results";
const Version = "v4";

for (const TestSuite of Suites) {
	console.log("=".repeat(80));
	console.log(`Running: ${TestSuite.name}@${Version}`);

	const suite = new TestSuite();
	const frame = [
		[
			"Test Suite",
			"Test Case",
			"Status",
			"Setup Time",
			"Dispose Time",
			"Benchmark",
			"Mean",
			"Median",
			"Min",
			"Max",
			"StdDev",
		],
	];

	for await (const { name, result } of suite.run()) {
		console.log(`  - ${name}`);

		if ("error" in result) {
			console.error(`    - Error: ${result.error}`);
			frame.push([TestSuite.name, name, `Error: ${result.error}`]);
			continue;
		}

		console.log(`    - Setup time: ${result.setupTime} ms`);
		console.log(`    - Dispose time: ${result.disposeTime} ms`);
		console.log(`    - Stats:`);

		for (const [benchmark, stats] of Object.entries(result.stats as Record<string, any>)) {
			console.log(`      - ${benchmark}`);
			console.log(`        - Mean: ${stats.mean} ms`);
			console.log(`        - Median: ${stats.median} ms`);
			console.log(`        - Min: ${stats.min} ms`);
			console.log(`        - Max: ${stats.max} ms`);
			console.log(`        - StdDev: ${stats.stdDev} ms`);

			frame.push([
				TestSuite.name,
				name,
				"OK",
				result.setupTime,
				result.disposeTime,
				benchmark,
				stats.mean,
				stats.median,
				stats.min,
				stats.max,
				stats.stdDev,
			]);
		}
	}

	await Deno.mkdir(Results).catch(() => console.info(`Folder "${Results}" already exists.`));
	await Deno.writeTextFile(`${Results}/${TestSuite.name}-${Version}.csv`, frame.join("\n"));

	console.log("=".repeat(80));
}
