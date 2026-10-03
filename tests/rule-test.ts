// Objective: Run one Oxlint rule against versioned fixtures. Used by rule integration tests.

import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

const PROJECT_ROOT = resolve(import.meta.dirname, '..');

const OXLINT_PATH = resolve(PROJECT_ROOT, 'node_modules/.bin/oxlint');

const CATEGORIES = {
  correctness: 'off',
  nursery: 'off',
  pedantic: 'off',
  perf: 'off',
  restriction: 'off',
  style: 'off',
  suspicious: 'off',
} as const;

type Fixture = {
  readonly name: string;
  readonly expectedCode: string | null;
};

type RuleTestInput = {
  readonly ruleName: string;
  readonly fixtures: readonly Fixture[];
};

type OxlintDiagnostic = {
  readonly code?: string;
};

type OxlintOutput = {
  readonly diagnostics?: readonly OxlintDiagnostic[];
};

type ProcessFailure = Error & {
  readonly code?: number | string;
  readonly stdout?: string;
};

const isProcessFailure = (error: unknown): error is ProcessFailure =>
  error instanceof Error;

const outputFrom = (stdout: string): OxlintOutput => {
  // JUSTIFICATION: Oxlint controls this JSON structure and the test reads only these fields.
  return JSON.parse(stdout) as OxlintOutput;
};

type RunResult = {
  readonly exitCode: number;
  readonly diagnostics: readonly OxlintDiagnostic[];
};

const isNumericExitCode = (
  value: number | string | undefined,
): value is number => Number.isInteger(value);

const runOxlint = async ({
  configPath,
  fixturePath,
}: {
  readonly configPath: string;
  readonly fixturePath: string;
}): Promise<RunResult> => {
  try {
    const { stdout } = await execFileAsync(
      OXLINT_PATH,
      ['--config', configPath, '--format', 'json', fixturePath],
      { cwd: PROJECT_ROOT, maxBuffer: 1024 * 1024 },
    );

    const output = outputFrom(stdout);

    return { exitCode: 0, diagnostics: output.diagnostics ?? [] };
  } catch (error) {
    if (!isProcessFailure(error)) throw error;

    const output = outputFrom(error.stdout ?? '');

    const exitCode = isNumericExitCode(error.code) ? error.code : 1;

    return { exitCode, diagnostics: output.diagnostics ?? [] };
  }
};

const createConfig = ({
  ruleName,
  pluginPath,
}: {
  readonly ruleName: string;
  readonly pluginPath: string;
}) =>
  JSON.stringify({
    categories: CATEGORIES,
    jsPlugins: [{ name: 'anti-slop', specifier: pluginPath }],
    rules: { [`anti-slop/${ruleName}`]: 'error' },
  });

/** Define CLI integration tests for one rule and its versioned fixtures. */
export const testRule = ({ ruleName, fixtures }: RuleTestInput): void => {
  describe(ruleName, () => {
    let configPath: string | null = null;

    beforeAll(async () => {
      const directory = await mkdtemp(join(tmpdir(), 'oxlint-anti-slop-'));
      configPath = join(directory, 'oxlint.json');
      await writeFile(
        configPath,
        createConfig({
          ruleName,
          pluginPath: resolve(PROJECT_ROOT, 'dist/index.js'),
        }),
      );
    });

    afterAll(async () => {
      if (configPath === null) return;
      await rm(dirname(configPath), { recursive: true, force: true });
    });

    for (const fixture of fixtures) {
      it(`${fixture.name}: ${fixture.expectedCode === null ? 'reports no diagnostics' : 'reports exactly one violation'}`, async () => {
        if (configPath === null)
          throw new Error('Oxlint configuration was not created');

        const fixturePath = resolve(
          PROJECT_ROOT,
          'tests/fixtures',
          ruleName,
          `${fixture.name}.ts`,
        );

        const result = await runOxlint({ configPath, fixturePath });

        if (fixture.expectedCode === null) {
          expect(result.exitCode).toBe(0);

          expect(result.diagnostics).toEqual([]);

          return;
        }

        expect(result.exitCode).toBe(1);

        expect(result.diagnostics).toHaveLength(1);

        expect(result.diagnostics[0]?.code).toBe(fixture.expectedCode);
      });
    }
  });
};
