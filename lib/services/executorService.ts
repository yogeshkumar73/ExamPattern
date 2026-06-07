export async function executeCodeLocal(language: string, code: string, input: string): Promise<{ passed: boolean, output: string, error?: string, runtimeMs?: number }> {
  const start = Date.now();
  const consoleOutput: string[] = [];

  if (language === 'javascript') {
    try {
      const safeConsole = {
        log: (...args: any[]) => {
          consoleOutput.push(args.map((arg) => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' '));
        },
      };

      const asyncFunction = new Function('input', 'console', `
        return (async () => {
          ${code}
        })();
      `);

      const result = await asyncFunction(input, safeConsole);
      const outputParts = [...consoleOutput];

      if (result !== undefined && result !== null) {
        outputParts.push(typeof result === 'object' ? JSON.stringify(result) : String(result));
      }

      return {
        passed: true,
        output: outputParts.join('\n').trim(),
        runtimeMs: Date.now() - start,
      };
    } catch (error: any) {
      return {
        passed: false,
        output: consoleOutput.join('\n').trim(),
        error: error?.message ?? String(error),
        runtimeMs: Date.now() - start,
      };
    }
  }

  return {
    passed: false,
    output: '',
    error: `Language ${language} is not supported in the local mock executor.`,
    runtimeMs: Date.now() - start,
  };
}
