const { exec } = require('child_process');

// Determine command based on OS
const cmd = process.platform === 'win32'
    ? 'taskkill /F /IM node.exe'
    : 'pkill -f node';

console.log(`Executing: ${cmd}`);

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Stdout: ${stdout}`);
});
