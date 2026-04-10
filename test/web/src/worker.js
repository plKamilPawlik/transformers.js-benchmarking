import * as BenchmarkingV3 from "@benchmarking/core-v3";
import * as BenchmarkingV4 from "@benchmarking/core-v4";

const SUITES = {
	ModelTestSuite: null,
	PipelineTestSuite: null,
};

self.addEventListener("message", async (event) => {
	const { command, version, suite, device } = event.data;
	if (command !== "start") return;

	switch (version) {
		case "v3":
			SUITES.ModelTestSuite = BenchmarkingV3.ModelTestSuite;
			SUITES.PipelineTestSuite = BenchmarkingV3.PipelineTestSuite;
			break;
		case "v4":
			SUITES.ModelTestSuite = BenchmarkingV4.ModelTestSuite;
			SUITES.PipelineTestSuite = BenchmarkingV4.PipelineTestSuite;
			break;
		default:
			return;
	}

	console.log(`Starting test suite: ${suite}@${version} on device: ${device}`);

	const TestSuiteClass = SUITES[suite];
	if (!TestSuiteClass) {
		console.error(`Unknown suite type: ${suite}`);
		return;
	}

	const cls = new TestSuiteClass({ device });
	for await (const { name, result } of cls.run()) {
		self.postMessage({ status: "update", name, result });
	}
	self.postMessage({ status: "complete" });
});
