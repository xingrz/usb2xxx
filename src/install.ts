import { execFileSync } from 'child_process';
import { resolve } from 'path';

if (process.platform == 'win32') {
  execFileSync(resolve(__dirname, '..', 'usb2xxx', 'win32', 'x64', 'vcredist_x64.exe'), ['/q']);
}
