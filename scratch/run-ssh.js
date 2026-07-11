/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready. Running full deployment and build on server...');

  const commands = [
    'cd /home/menuversebd.com/public_html',
    'git fetch origin main && git reset --hard origin/main',
    'npm install',
    'npm run build',
    'pm2 restart menuverse --update-env',
    'pm2 save'
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      process.exit(1);
    }
    
    stream.on('close', (code, signal) => {
      console.log(`\nDeployment finished with exit code ${code}`);
      conn.end();
      process.exit(code === 0 ? 0 : 1);
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
  process.exit(1);
}).connect({
  host: '93.127.166.176',
  port: 22,
  username: 'menuv3746',
  password: 'menuv3746'
});
