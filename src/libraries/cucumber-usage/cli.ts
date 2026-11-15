import { readFileSync } from 'node:fs';
import { type StepUsage, unusedSteps } from './unused-steps';

const [usageFile = 'cucumber-usage.json'] = process.argv.slice(2);

const usage: readonly StepUsage[] = JSON.parse(readFileSync(usageFile, 'utf8'));

const unused = unusedSteps(usage);

process.stdout.write(unused.map((step) => `Unused step definition: ${step}\n`).join(''));
process.exitCode = unused.length === 0 ? 0 : 1;
