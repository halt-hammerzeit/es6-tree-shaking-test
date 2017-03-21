const fs = require('fs')
const path = require('path')

const webpackRunTest = require('./bundlers/webpack')
const rollupRunTest = require('./bundlers/rollup')

const testsFolder = path.join(__dirname, '../tests')

function getTests() {
	return fs.readdirSync(testsFolder)
		.filter(file => fs.statSync(path.join(testsFolder, file)).isDirectory())
}

const testName = process.argv[2]

async function runTests() {
	const results = []

	for (const test of testName ? [testName] : getTests()) {
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
		console.log(`~ Running test "${test}"`)
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

		// Determines if a test passed
		const passed = require(path.join(testsFolder, test, 'passed.js'))

		const options = {
			file: test,
			folder: testsFolder
		}

		const output = {}

		console.log('==========================================================')
		console.log('=                        Webpack                         =')
		console.log('==========================================================')

		output.webpack = await webpackRunTest(options)
		reportPassedOrFailed(passed(output.webpack))

		console.log('==========================================================')
		console.log('=                        Rollup                          =')
		console.log('==========================================================')

		output.rollup = await rollupRunTest(options)
		reportPassedOrFailed(passed(output.rollup))

		results.push({
			test,
			webpack: passed(output.webpack),
			rollup: passed(output.rollup)
		})
	}

	console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
	console.log('~                     Tests finished                     ~')
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

	// Can output a GitHub markdown table here
	// which can then be injected into README.md
	console.log(JSON.stringify(results, null, 2))
}

function reportPassedOrFailed(passed) {
	if (passed) {
		console.log('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓')
		console.log('✓                        PASSED                          ✓')
		console.log('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓')
	}
	else {
		console.log('✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕')
		console.log('✕                        FAILED                          ✕')
		console.log('✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕✕')
	}
}

runTests().catch(error => console.error(error))