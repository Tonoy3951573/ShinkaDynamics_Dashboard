import { execSync } from 'child_process';
import fs from 'fs';

try {
  const output = execSync('npm run lint', { encoding: 'utf-8' });
  fs.writeFileSync('lint_output.txt', output);
} catch (error) {
  fs.writeFileSync('lint_output.txt', error.stdout || error.message);
}
