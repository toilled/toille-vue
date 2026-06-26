export interface TerminalContext {
  addLine: (text: string, cls?: string) => void;
  addPre: (text: string, cls?: string) => void;
  clearLines: () => void;
  scrollToBottom: () => void;
  close: () => void;
  bootSequence: () => void;
  commandHistory: string[];
  historyIndex: { value: number };
  startTime: number;
  matrixInterval: { value: ReturnType<typeof setInterval> | null };
}

const virtualFS: Record<string, string> = {
  '/home/guest/readme.txt': `TOILLE-OS v3.0.1 - Personal Portfolio Terminal
==============================================
Welcome, user. This system provides access to
Elliot Dickerson's cyberpunk portfolio.

Type 'help' for available commands.
Type 'neofetch' for system info.
Type 'story' to learn the city's secrets.`,

  '/home/guest/notes.txt': `- Personal Notes -
- Refactor city rendering pipeline (LOD system)
- Add more story missions
- Optimize MQTT multiplayer sync
- The neon flows through everything.`,

  '/home/guest/.secret/hack.txt': `ACCESS GRANTED
================
Deep Net Access: Level 5
Node: TOILLE-CORE
Signal: encrypted (AES-256)

"The city wasn't built. It was grown.
Like crystals in silicon soup."`,

  '/home/guest/.secret/lore.txt': `== CYBERPUNK CITY LORE ==

In 2084, TOILLE-CITY rose from the ashes
of the old internet. A digital metropolis
where data flows like neon blood through
concrete veins.

Five megacorps control the city:
1. NEON-ECHO - Media & Propaganda
2. CHROME-CORE - Cybernetics & Hardware
3. NULL-SEC - Security & Surveillance
4. FLUX-DATA - Information Brokerage
5. VOID-INC - Unknown / Classified

The Resistance operates from the Undercity.
They say TOILLE himself still watches over
the network.`,

  '/etc/motd': `Welcome to TOILLE-OS v3.0.1

  "In the neon-lit shadows of tomorrow,
   every pixel tells a story."

Type 'help' to begin.`,

  '/etc/config': `# TOILLE-OS Configuration
HOSTNAME=toille-city
KERNEL=cyberpunk-v3.0.1
SHELL=/bin/toille-sh
TIMEZONE=UTC+0
THEME=neon-dark
FONT=monospace
AUDIO=procedural
BACKEND=cloudflare-edge`,

  '/var/log/access.log': `[${new Date().toISOString()}] CONNECTION ESTABLISHED: guest@toille-city
[${new Date(Date.now() - 60000).toISOString()}] AUTH: guest (anonymous)
[${new Date(Date.now() - 120000).toISOString()}] PORT SCAN DETECTED: 192.168.1.1
[${new Date(Date.now() - 300000).toISOString()}] CITY STATUS: NOMINAL
[${new Date(Date.now() - 3600000).toISOString()}] NEON GRID: STABLE`,

  '/var/log/city.log': `[CITY MONITOR]
Status: ONLINE
Population: 4,873,291 simulated
Traffic: 73% capacity
Neon levels: 88%
Crime rate: 12.4%
Story progress: ${Math.floor(Math.random() * 100)}%`,

  '/data/skills.db': `=== SKILL DATABASE ===
>> Backend: PHP, Laravel, Symfony, Node.js, Python, Rust
>> Frontend: Vue 3, React, SolidJS, TypeScript, Tailwind
>> 3D: Three.js, WebGL, procedural generation
>> DevOps: Docker, Cloudflare, CI/CD, Git
>> DB: MySQL, PostgreSQL, SQLite, D1
>> Audio: Web Audio API, procedural generation`,

  '/data/contacts.db': `=== CONTACTS ===
Name: Elliot Dickerson
Role: Software Engineer @ RM
Web: https://toille.uk
Code: https://github.com/toilled`,
};

const asciiBanner = `
 ████████╗ ██████╗ ██╗██╗     ██╗     ███████╗
 ╚══██╔══╝██╔═══██╗██║██║     ██║     ██╔════╝
    ██║   ██║   ██║██║██║     ██║     █████╗
    ██║   ██║   ██║██║██║     ██║     ██╔══╝
    ██║   ╚██████╔╝██║███████╗███████╗███████╗
    ╚═╝    ╚═════╝ ╚═╝╚══════╝╚══════╝╚══════╝
`;

const fortunes = [
  'The best way to predict the future is to create it. - Alan Kay',
  'In the neon city, even shadows have RGB values.',
  'A cyberpunk is just a romantic who learned to code.',
  'The blade runner walks alone, but the network connects all.',
  "There is no cloud - it's just someone else's computer.",
  'Null pointers are the least of your problems in this city.',
  'The street finds its own uses for technology.',
  'All that is solid melts into data.',
  'In 2084, your thoughts are just another API call.',
  "The future is already here - it's just not evenly distributed.",
  "There are 10 types of people in the world: those who understand binary and those who don't.",
  "Debugging: removing the parts of the code that don't match reality.",
  'The light at the end of the tunnel is probably a train. Or neon.',
  "I'm not saying I have a problem with JavaScript, but I have 14 npm packages for it.",
  "The city doesn't sleep. Neither does your database.",
];

const passwordList = [
  'admin',
  'password',
  '123456',
  'qwerty',
  'letmein',
  'toille',
  'cyberpunk',
  'neon',
  'shadow',
  'root',
];

const hackSteps = [
  'INITIALIZING EXPLOIT FRAMEWORK...',
  'SCANNING TARGET PORTS...',
  '  Port 22: OPEN (SSH)',
  '  Port 80: OPEN (HTTP)',
  '  Port 443: OPEN (HTTPS)',
  '  Port 8080: OPEN (PROXY)',
  '  Port 1337: OPEN (??? )',
  'IDENTIFYING VULNERABILITIES...',
  '  [OK] CVE-2084-1337: Buffer overflow in neon-grid',
  '  [OK] CVE-2084-0001: SQL injection in data-core',
  '  [OK] CVE-2084-0069: Race condition in traffic AI',
  'DEPLOYING PAYLOAD...',
  '  [====================] 100%',
  'ESTABLISHING BACKDOOR...',
  '  Connection encrypted (4096-bit RSA)',
  '  Tunnel: secure',
  'ESCALATING PRIVILEGES...',
  '  [+] Access level: ADMIN',
  '  [+] User: root',
  'DOWNLOADING DATA...',
  '  [====================] 100%',
  'COVERING TRACKS...',
  '  Logs: cleared',
  '  Audit trail: deleted',
  'MISSION COMPLETE.',
  '',
  '> Data packet saved to /home/guest/.secret/hack.txt',
];

const scanResult = `
SCANNING NETWORK 10.0.0.0/24...

Host             MAC               Status    Services
──────────────────────────────────────────────────────────
10.0.0.1         00:1A:2B:3C:4D:5E  Alive     gateway
10.0.0.2         FF:EE:DD:CC:BB:AA  Alive     dns, dhcp
10.0.0.12        08:15:AB:CD:EF:01  Alive     http, ssh
10.0.0.45        DE:AD:BE:EF:CA:FE  Alive     https, smtp
10.0.0.99        C0:FF:EE:BA:BE:00  Alive     database
10.0.0.101       13:37:00:00:00:01  Alive     unknown
10.0.0.254       FF:FF:FF:FF:FF:FF  Alive     broadcast

Found 7 hosts online
Scan completed in 2.43s`;

const cityInfo = `
╔══════════════════════════════════════════════╗
║        TOILLE-CITY STATUS REPORT             ║
║  Population:    4,873,291 citizens           ║
║  Area:          2000m x 2000m                ║
║  Buildings:     1,024                        ║
║  Districts:     4                            ║
║  Traffic:       73% capacity                 ║
║  Neon Level:    88%                          ║
║  Crime Rate:    12.4%                        ║
║  Story Missions: 5                           ║
║  Game Modes:    3 (Drive/Explore/Demo)       ║
║  Engine:        Three.js + WebGL             ║
╚══════════════════════════════════════════════╝`;

const helpText = `
╔══════════════════════════════════════════════════════════════════════════╗
║              TOILLE-OS HELP v1.0                                        ║
║  SYSTEM                                                                 ║
║    help         Show this help message                                  ║
║    clear        Clear the terminal                                      ║
║    whoami       Display current user                                    ║
║    neofetch     Display system info                                     ║
║    uname        Display OS info                                         ║
║    uptime       Show uptime                                             ║
║    date         Show current date/time                                  ║
║    echo         Echo text                                               ║
║    banner       Show ASCII banner                                       ║
║    env          Show environment variables                              ║
║    id           Show user identity                                      ║
║    pwd          Print working directory                                 ║
║    history      Show command history                                    ║
║  FILESYSTEM                                                             ║
║    ls [path]    List directory contents                                 ║
║    cat <file>   Show file contents                                      ║
║  FUN                                                                   ║
║    fortune      Random cyberpunk fortune                                ║
║    hack         Simulate hacking sequence                               ║
║    matrix       Watch the Matrix rain                                   ║
║    scan         Network scan                                            ║
║    crack        Crack a password                                        ║
║    ping [host]  Ping a host                                             ║
║    roll [n]     Roll an n-sided die                                     ║
║    coinflip     Flip a coin                                             ║
║    glitch       Initiate glitch sequence                                ║
║    rainbow      Rainbow text                                            ║
║    cowsay       Let the cow speak                                       ║
║    sl           Steam locomotive                                        ║
║    figlet       Display ASCII art text                                  ║
║    ascii        Random ASCII art                                        ║
║  LORE                                                                   ║
║    story        Cyberpunk city lore                                     ║
║    whois        Information about Elliot                                ║
║    skills       Elliot's technical skills                               ║
║    music        About the music                                         ║
║    city         City status report                                      ║
║    decrypt      Decrypt a message                                       ║
║    encrypt      Encrypt data                                            ║
║    connect      Connect to the network                                  ║
║    phone-home   Call home base                                          ║
║  CONTROL                                                                ║
║    sudo <cmd>   Superuser (denied)                                      ║
║    reboot       Reboot the terminal                                     ║
║    shutdown     Close the terminal                                      ║
║    exit         Close the terminal                                      ║
║  NETWORK                                                                ║
║    curl <url>   Make HTTP request                                       ║
║    ssh <host>   SSH to host                                             ║
║    traceroute   Trace route to host                                     ║
║    docker       Check Docker status                                     ║
╚══════════════════════════════════════════════════════════════════════════╝`;

export const commandAliases: Record<string, string> = {
  shutdown: 'exit',
};

const dirListing: Record<string, string[]> = {
  '/': ['guest/'],
  '/home': ['guest/'],
  '/home/guest': ['.secret/', 'readme.txt', 'notes.txt'],
  '~': ['.secret/', 'readme.txt', 'notes.txt'],
  '/home/guest/.secret': ['hack.txt', 'lore.txt'],
  '.secret': ['hack.txt', 'lore.txt'],
  '/etc': ['motd', 'config'],
  '/var': ['log/'],
  '/var/log': ['access.log', 'city.log'],
  '/data': ['skills.db', 'contacts.db'],
  '/usr': ['toille-sh', 'neon-grid', 'city-builder'],
  '/usr/local': ['toille-sh', 'neon-grid', 'city-builder'],
  '/usr/local/bin': ['toille-sh', 'neon-grid', 'city-builder'],
};

function doLs(args: string[], ctx: TerminalContext) {
  const path = args[0] || '/home/guest';
  const entries = dirListing[path];
  if (entries) {
    entries.forEach((entry) => ctx.addLine(entry));
  } else {
    ctx.addLine(`ls: cannot access '${path}': No such file or directory`, 'error');
  }
}

function doCat(args: string[], ctx: TerminalContext) {
  if (args.length === 0) {
    ctx.addLine('cat: missing operand', 'error');
    return;
  }
  const filePath = args[0];
  const resolved = resolvePath(filePath);
  if (virtualFS[resolved]) {
    ctx.addPre(virtualFS[resolved]);
  } else {
    ctx.addLine(`cat: ${filePath}: No such file or directory`, 'error');
  }
}

function resolvePath(p: string): string {
  if (p.startsWith('/')) return p;
  const map: Record<string, string> = {
    'readme.txt': '/home/guest/readme.txt',
    'notes.txt': '/home/guest/notes.txt',
    'hack.txt': '/home/guest/.secret/hack.txt',
    'lore.txt': '/home/guest/.secret/lore.txt',
    motd: '/etc/motd',
    config: '/etc/config',
    'access.log': '/var/log/access.log',
    'city.log': '/var/log/city.log',
    'skills.db': '/data/skills.db',
    'contacts.db': '/data/contacts.db',
  };
  return map[p] || `/home/guest/${p}`;
}

function simulateHack(ctx: TerminalContext) {
  let i = 0;
  function nextHackStep() {
    if (i < hackSteps.length) {
      ctx.addLine(hackSteps[i]);
      ctx.scrollToBottom();
      i++;
      setTimeout(nextHackStep, 300 + Math.random() * 400);
    }
  }
  nextHackStep();
}

function startMatrix(ctx: TerminalContext) {
  if (ctx.matrixInterval.value) return;
  ctx.addLine('INITIALIZING MATRIX... (it will run for 5 seconds)');
  ctx.scrollToBottom();
  const chars =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  let frame = 0;
  ctx.matrixInterval.value = setInterval(() => {
    if (frame > 20) {
      if (ctx.matrixInterval.value) {
        clearInterval(ctx.matrixInterval.value);
        ctx.matrixInterval.value = null;
      }
      ctx.addLine('Matrix sequence ended. The neon flows on.');
      ctx.scrollToBottom();
      return;
    }
    let line = '';
    for (let i = 0; i < 60; i++) {
      line += Math.random() > 0.6 ? chars[Math.floor(Math.random() * chars.length)] : ' ';
    }
    ctx.addLine(line, 'matrix');
    ctx.scrollToBottom();
    frame++;
  }, 80);
}

function doCrack(args: string[], ctx: TerminalContext) {
  const target = args[0] || 'admin';
  ctx.addLine(`CRACKING PASSWORD FOR: ${target}...`);
  ctx.addLine(
    `Target hash: ${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  );
  let found = false;
  for (const pw of passwordList) {
    if (Math.random() > 0.7) {
      ctx.addLine(`  Trying: ${pw}... MATCH!`);
      found = true;
      break;
    } else {
      ctx.addLine(`  Trying: ${pw}... no`);
    }
  }
  if (found) {
    ctx.addLine('');
    ctx.addLine(
      `PASSWORD CRACKED: ${target}:${passwordList[Math.floor(Math.random() * passwordList.length)]}`
    );
    ctx.addLine('Access granted. Welcome to the undernet.');
  } else {
    ctx.addLine('');
    ctx.addLine('Password not found in dictionary. Try a longer wordlist.');
    ctx.addLine('(Hint: the password is usually something obvious.)');
  }
}

function doPing(args: string[], ctx: TerminalContext) {
  const host = args[0] || 'localhost';
  ctx.addLine(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);
  let i = 0;
  function nextPing() {
    if (i < 4) {
      const ms = Math.floor(Math.random() * 50 + 5);
      ctx.addLine(
        `64 bytes from ${host} (127.0.0.1): icmp_seq=${i + 1} ttl=64 time=${ms}.${Math.floor(Math.random() * 9)}ms`
      );
      i++;
      setTimeout(nextPing, 500);
    } else {
      ctx.addLine('');
      ctx.addLine(`--- ${host} ping statistics ---`);
      ctx.addLine('4 packets transmitted, 4 received, 0% packet loss, time 3004ms');
    }
  }
  nextPing();
}

function doWhois(args: string[], ctx: TerminalContext) {
  const target = (args[0] || 'elliot').toLowerCase();
  if (target === 'elliot' || target === 'toille') {
    ctx.addPre(`
╔══════════════════════════════════════════════╗
║         WHOIS: ELLIOT DICKERSON             ║
║  Name:       Elliot Dickerson               ║
║  Role:       Software Engineer              ║
║  Company:    RM Education                   ║
║  Location:   United Kingdom                 ║
║  Web:        https://toille.uk              ║
║  GitHub:     github.com/toilled             ║
║  YouTube:    youtube.com/@toilled           ║
║  Stack:      Vue 3, PHP, TS, 3D            ║
║  Vibe:       Cyberpunk Professional         ║
╚══════════════════════════════════════════════╝`);
  } else {
    ctx.addLine(`whois: ${target}: No such record`);
  }
}

function showUptime(ctx: TerminalContext) {
  const secs = Math.floor((Date.now() - ctx.startTime) / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  ctx.addLine(
    `up ${hrs > 0 ? `${hrs}h ` : ''}${mins % 60}m ${secs % 60}s, 1 user, load: 0.42 0.69 1.33`
  );
}

function systemInfo(startTime: number): string {
  const s = Math.floor((Date.now() - startTime) / 1000);
  return `
       _.---.._           user: guest
   .-'       '-.          host: toille-city
  /    0   0    \\         os: TOILLE-OS v3.0.1
 /    --|--     \\        kernel: cyberpunk-neon 6.6.0-cyber
|    ___|___     |       shell: /bin/toille-sh
 \\  /         \\  /      cpu: Quantum Neural Net (8.4 THz)
  \\/           \\/       gpu: NeonRay RTX 9090 Ti
                          memory: 64TB DDR7 ECC
                          storage: 1.2PB SSD (NeonGrid RAID 0)
                          uptime: ${s}s
                          resolution: ${typeof window !== 'undefined' ? window.screen.width + 'x' + window.screen.height : 'unknown'}
                          DE/WM: CyberpunkWM v2.0
                          theme: neon-dark [current]
                          packages: 1337 (npm)
                          ip: 208.67.222.222 (behind Cloudflare)`;
}

function cowsayCmd(msg: string, ctx: TerminalContext) {
  const border = '-'.repeat(msg.length + 2);
  ctx.addLine(` ${border}`);
  ctx.addLine(`< ${msg} >`);
  ctx.addLine(` ${border}`);
  ctx.addLine('        \\   ^__^');
  ctx.addLine('         \\  (oo)\\_______');
  ctx.addLine('            (__)\\       )\\/\\');
  ctx.addLine('                ||----w |');
  ctx.addLine('                ||     ||');
}

function getRandomAscii(): string {
  const arts = [
    `     ╱|、
    (˚ˎ 。7
     |、˜〵
     じしˍ,)ノ`,
    `
    ______
   /     /|
  /     / |
 /_____/  |
 |    |  /
 |    | /
 |____|/`,
    `    /\\_/\\
   ( o.o )
    > ^ <`,
    `  ╔═╗╦ ╦╦═╗╦═╗╦╔╗
  ╠═╣║ ║╠╦╝╠╦╝║║║
  ╩ ╩╚═╝╩╚═╩╚═╩╝╚╝`,
    `  ░▀█▀░█▀█░█▀█░█▀▀
  ░░█░░█░█░█░█░█▀▀
  ░░▀░░▀▀▀░▀░▀░▀▀▀`,
  ];
  return arts[Math.floor(Math.random() * arts.length)];
}

export function createCommands(ctx: TerminalContext): Record<string, (args: string[]) => void> {
  return {
    help() {
      ctx.addPre(helpText, 'help');
    },
    clear() {
      ctx.clearLines();
    },
    whoami() {
      ctx.addLine('guest - anonymous user on TOILLE-CITY network');
    },
    neofetch() {
      ctx.addPre(systemInfo(ctx.startTime), 'neofetch');
    },
    uname() {
      ctx.addLine('TOILLE-OS v3.0.1 cyberpunk-neon 6.6.0-cyber x86_64');
    },
    uptime() {
      showUptime(ctx);
    },
    date() {
      ctx.addLine(new Date().toLocaleString());
    },
    echo(args: string[]) {
      ctx.addLine(args.join(' ') || '');
    },
    ls(args: string[]) {
      doLs(args, ctx);
    },
    cat(args: string[]) {
      doCat(args, ctx);
    },
    banner() {
      ctx.addPre(asciiBanner, 'banner');
    },
    fortune() {
      ctx.addLine(fortunes[Math.floor(Math.random() * fortunes.length)], 'fortune');
    },
    hack() {
      simulateHack(ctx);
    },
    matrix() {
      startMatrix(ctx);
    },
    scan() {
      ctx.addPre(scanResult, 'scan');
    },
    crack(args: string[]) {
      doCrack(args, ctx);
    },
    ping(args: string[]) {
      doPing(args, ctx);
    },
    sudo() {
      ctx.addLine('sudo: PERMISSION DENIED. This incident has been logged.', 'error');
      ctx.addLine('sudo: Nice try, skid. Come back with admin credentials.', 'error');
    },
    story() {
      ctx.addPre(virtualFS['/home/guest/.secret/lore.txt'], 'story');
    },
    whois(args: string[]) {
      doWhois(args, ctx);
    },
    skills() {
      ctx.addPre(virtualFS['/data/skills.db'], 'skills');
    },
    music() {
      ctx.addLine('Elliot writes original guitar compositions.', 'info');
      ctx.addLine('Check out: https://www.youtube.com/@toilled', 'info');
      ctx.addLine(
        'The cyberpunk audio you hear is procedurally generated in real-time using Web Audio API.'
      );
    },
    city() {
      ctx.addPre(cityInfo, 'city');
    },
    glitch() {
      ctx.addLine('INITIATING GLITCH SEQUENCE...', 'error');
      ctx.addLine('SYSTEM CORRUPTION DETECTED', 'error');
      ctx.addLine('jk. The glitch effect is purely cosmetic. This city loves its style.', 'info');
    },
    theme() {
      ctx.addLine('Available themes: neon-dark (current)', 'info');
      ctx.addLine('The theme manager is currently under construction. Come back in 2085.');
    },
    reboot() {
      ctx.addLine('REBOOTING...');
      ctx.clearLines();
      ctx.bootSequence();
    },
    exit() {
      ctx.addLine('Shutting down... Goodbye, choom.');
      setTimeout(() => ctx.close(), 800);
    },
    roll(args: string[]) {
      const sides = parseInt(args[0]) || 6;
      ctx.addLine(`d${sides}: ${Math.floor(Math.random() * sides) + 1}`);
    },
    coinflip() {
      ctx.addLine(Math.random() > 0.5 ? 'Heads' : 'Tails');
    },
    weather() {
      ctx.addLine('Fetching weather data...', 'info');
      ctx.addLine('Temp: 18C | Condition: Neon drizzle | Humidity: 67%');
      ctx.addLine('Forecast: Glitchy with a chance of cyberpunk.');
    },
    rainbow(args: string[]) {
      ctx.addLine(args.join(' ') || 'The neon flows through everything.', 'rainbow');
    },
    yes() {
      ctx.addLine('y');
    },
    env() {
      ctx.addLine('SHELL=/bin/toille-sh');
      ctx.addLine('USER=guest');
      ctx.addLine('HOSTNAME=toille-city');
      ctx.addLine('TERM=xterm-256color');
      ctx.addLine('HOME=/home/guest');
      ctx.addLine('PATH=/usr/local/bin:/usr/bin:/bin');
      ctx.addLine('THEME=neon-dark');
    },
    id() {
      ctx.addLine('uid=1337(guest) gid=42(users) groups=42(users),69(cyberpunk),420(neon)');
    },
    ps() {
      ctx.addLine('  PID TTY          TIME CMD');
      ctx.addLine('    1 ?        00:00:42 init');
      ctx.addLine('   42 ?        00:06:09 neongrid');
      ctx.addLine('   69 ?        00:01:33 audio-daemon');
      ctx.addLine('  420 ?        00:00:01 terminal');
      ctx.addLine(' 1337 ?        00:00:00 ps');
    },
    top() {
      ctx.addLine('top - task manager not available in this terminal.');
      ctx.addLine('However, I can tell you that nothing is running.');
      ctx.addLine('Except the neon. The neon is always running.');
    },
    kill() {
      ctx.addLine("kill: usage: don't. We're all friends here.");
    },
    find() {
      ctx.addLine("find: You're the one who's lost, aren't you?");
    },
    grep() {
      ctx.addLine("grep: searching... nope, couldn't find what you're looking for.");
    },
    curl(args: string[]) {
      if (args[0]) {
        ctx.addLine(`curl ${args[0]}...`);
        ctx.addLine('[OK] 200 - Response: {"message": "Hello from the edge."}');
      } else {
        ctx.addLine("curl: try 'curl https://toille.uk'");
      }
    },
    ssh(args: string[]) {
      ctx.addLine('ssh: Connecting to ' + (args[0] || 'unknown') + '...');
      ctx.addLine('The connection was refused. The city guards its secrets.');
    },
    traceroute(args: string[]) {
      ctx.addLine('traceroute to ' + (args[0] || 'target') + ':');
      ctx.addLine(' 1  gateway.toille-city (10.0.0.1)  2.3ms');
      ctx.addLine(' 2  neon-core-01 (10.0.1.1)  4.2ms');
      ctx.addLine(' 3  data-vortex-02 (10.0.2.1)  6.9ms');
      ctx.addLine(' 4  * * *');
      ctx.addLine(' 5  * * *');
      ctx.addLine(' 6  ^C');
    },
    history() {
      ctx.commandHistory.forEach((c, i) => {
        ctx.addLine(`  ${i + 1}  ${c}`);
      });
    },
    nmap() {
      ctx.addLine(
        "nmap: Use 'scan' for a quick scan, or type 'nmap -A target' (jk, this isn't real)"
      );
    },
    vim() {
      ctx.addLine("vim: You can't escape vim. But also, this is not vim. Type 'help'.");
    },
    emacs() {
      ctx.addLine("emacs: It's just a text editor. Or an OS. We can't tell anymore.");
    },
    nano() {
      ctx.addLine("nano: ^X to exit. Oh wait, this isn't nano either.");
    },
    python() {
      ctx.addLine('Python 3.13.0 (default, Oct 2024, 12:00:00)');
      ctx.addLine('[GCC 14.2.0] on linux');
      ctx.addLine('Type "help", "copyright", "credits" or "license" for more information.');
      ctx.addLine(">>>  (Python REPL not available in this terminal. Try 'node' instead.)");
    },
    node() {
      ctx.addLine('> Welcome to Node.js v23.0.0');
      ctx.addLine('> (Not really, but the real site is built with Vue 3 + Vite!)');
    },
    man() {
      ctx.addLine('What manual page do you want?');
      ctx.addLine("(This isn't a real man page system. Try 'help' instead.)");
    },
    su() {
      ctx.addLine('su: Authentication failure');
      ctx.addLine("(You can't become root that easily. Try harder.)");
    },
    apt() {
      ctx.addLine('apt: Command not found. Try building from source.');
    },
    'apt-get'() {
      ctx.addLine('apt-get: Command not found. Try building from source.');
    },
    brew() {
      ctx.addLine('brew: Command not found. Try building from source.');
    },
    npm() {
      ctx.addLine('npm: Command not found. Try building from source.');
    },
    docker() {
      ctx.addLine('Docker is running. Containers: 4 (neon-grid, city-db, traffic-ai, audio-srv)');
    },
    make() {
      ctx.addLine("make: Nothing to be done for 'all'.");
    },
    pwd() {
      ctx.addLine('/home/guest');
    },
    cd() {
      ctx.addLine("(This terminal has a fixed filesystem. 'ls' and 'cat' still work.)");
    },
    chmod() {
      ctx.addLine('chmod: changing permissions of files is not supported in this simulation.');
    },
    df() {
      ctx.addLine('Filesystem       Size  Used Avail Use% Mounted on');
      ctx.addLine('/dev/neon        1.2PB 342GB 858GB  28% /');
      ctx.addLine('tmpfs            64TB   12GB  64TB   1% /tmp');
    },
    free() {
      ctx.addLine('              total        used        free      shared  buff/cache');
      ctx.addLine('Mem:          64TB       42TB        18TB        2TB       2TB');
      ctx.addLine('Swap:         128TB       0B        128TB');
    },
    lolcat(args: string[]) {
      ctx.addLine(
        args.join(' ') || "Close enough. The command doesn't exist but the spirit is there.",
        'rainbow'
      );
    },
    sl() {
      ctx.addPre(
        `
   CHOO CHOO!

   === TOILLE EXPRESS ===
   |${'='.repeat(40)}|
   O${' '.repeat(40)}O
  `,
        'rainbow'
      );
    },
    cowsay(args: string[]) {
      cowsayCmd(args.join(' ') || 'Moo.', ctx);
    },
    figlet() {
      ctx.addPre(asciiBanner);
    },
    'phone-home'() {
      ctx.addLine('Calling home...');
      ctx.addLine('Signal detected. TOILLE-CITY is listening.');
      ctx.addLine('All systems nominal. Continue your mission.');
    },
    connect() {
      ctx.addLine('Establishing quantum link...');
      ctx.addLine('Searching for peers...');
      ctx.addLine('No peers found. You are alone in the net.');
    },
    decrypt() {
      ctx.addLine('Decrypting data...');
      ctx.addLine('[====================] 100%');
      ctx.addLine('Decrypted: "The password is always \'toille\'."');
    },
    encrypt() {
      ctx.addLine('Encrypting data with AES-256...');
      ctx.addLine('[====================] 100%');
      ctx.addLine('Data secured. Key stored in quantum vault.');
    },
    ascii() {
      ctx.addPre(getRandomAscii());
    },
  };
}
