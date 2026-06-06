<template>
  <aside class="terminal-overlay" @click.self="close">
    <div class="terminal" ref="terminalRef" @keydown="handleKeydown" tabindex="0">
      <div class="terminal-header">
        <span class="terminal-title">TOILLE://TERMINAL</span>
        <div class="terminal-controls">
          <span class="dot close" @click.stop="close" title="Close" />
          <span class="dot min" />
          <span class="dot max" />
        </div>
      </div>
      <div class="terminal-body" ref="bodyRef">
        <div v-for="(line, i) in lines" :key="i" class="terminal-line" :class="line.class">
          <pre v-if="line.pre">{{ line.text }}</pre>
          <span v-else-if="!line.pre">{{ line.text }}</span>
        </div>
        <div v-if="!animating" class="terminal-input-line">
          <span class="prompt">{{ prompt }}</span>
          <span class="input-text">{{ currentInput }}</span>
          <span class="cursor" :class="{ blink: !animating }">&#9608;</span>
        </div>
        <div v-if="animating" class="terminal-line boot-line">
          <span>{{ bootText }}</span>
          <span class="cursor blink">&#9608;</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void;
}>();

const terminalRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const lines = ref<{ text: string; pre?: boolean; class?: string }[]>([]);
const currentInput = ref("");
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const animating = ref(true);
const bootText = ref("");
const startTime = ref(Date.now());
const matrixInterval = ref<ReturnType<typeof setInterval> | null>(null);

const prompt = "guest@toille:~$ ";

function close() {
  if (matrixInterval.value) {
    clearInterval(matrixInterval.value);
    matrixInterval.value = null;
  }
  emit("close");
}

function scrollToBottom() {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
    }
  });
}

function addLine(text: string, cls?: string) {
  if (cls) {
    lines.value.push({ text, class: cls });
  } else {
    lines.value.push({ text });
  }
}

function addPre(text: string, cls?: string) {
  if (cls) {
    lines.value.push({ text, pre: true, class: cls });
  } else {
    lines.value.push({ text, pre: true });
  }
}

const virtualFS: Record<string, string> = {
  "/home/guest/readme.txt": `TOILLE-OS v3.0.1 - Personal Portfolio Terminal
==============================================
Welcome, user. This system provides access to
Elliot Dickerson's cyberpunk portfolio.

Type 'help' for available commands.
Type 'neofetch' for system info.
Type 'story' to learn the city's secrets.`,

  "/home/guest/notes.txt": `- Personal Notes -
- Refactor city rendering pipeline (LOD system)
- Add more story missions
- Optimize MQTT multiplayer sync
- The neon flows through everything.`,

  "/home/guest/.secret/hack.txt": `ACCESS GRANTED
================
Deep Net Access: Level 5
Node: TOILLE-CORE
Signal: encrypted (AES-256)

"The city wasn't built. It was grown.
Like crystals in silicon soup."`,

  "/home/guest/.secret/lore.txt": `== CYBERPUNK CITY LORE ==

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

  "/etc/motd": `Welcome to TOILLE-OS v3.0.1

  "In the neon-lit shadows of tomorrow,
   every pixel tells a story."

Type 'help' to begin.`,

  "/etc/config": `# TOILLE-OS Configuration
HOSTNAME=toille-city
KERNEL=cyberpunk-v3.0.1
SHELL=/bin/toille-sh
TIMEZONE=UTC+0
THEME=neon-dark
FONT=monospace
AUDIO=procedural
BACKEND=cloudflare-edge`,

  "/var/log/access.log": `[${new Date().toISOString()}] CONNECTION ESTABLISHED: guest@toille-city
[${new Date(Date.now() - 60000).toISOString()}] AUTH: guest (anonymous)
[${new Date(Date.now() - 120000).toISOString()}] PORT SCAN DETECTED: 192.168.1.1
[${new Date(Date.now() - 300000).toISOString()}] CITY STATUS: NOMINAL
[${new Date(Date.now() - 3600000).toISOString()}] NEON GRID: STABLE`,

  "/var/log/city.log": `[CITY MONITOR]
Status: ONLINE
Population: 4,873,291 simulated
Traffic: 73% capacity
Neon levels: 88%
Crime rate: 12.4%
Story progress: ${Math.floor(Math.random() * 100)}%`,

  "/data/skills.db": `=== SKILL DATABASE ===
>> Backend: PHP, Laravel, Symfony, Node.js, Python, Rust
>> Frontend: Vue 3, React, SolidJS, TypeScript, Tailwind
>> 3D: Three.js, WebGL, procedural generation
>> DevOps: Docker, Cloudflare, CI/CD, Git
>> DB: MySQL, PostgreSQL, SQLite, D1
>> Audio: Web Audio API, procedural generation`,

  "/data/contacts.db": `=== CONTACTS ===
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
  "The best way to predict the future is to create it. - Alan Kay",
  "In the neon city, even shadows have RGB values.",
  "A cyberpunk is just a romantic who learned to code.",
  "The blade runner walks alone, but the network connects all.",
  "There is no cloud - it's just someone else's computer.",
  "Null pointers are the least of your problems in this city.",
  "The street finds its own uses for technology.",
  "All that is solid melts into data.",
  "In 2084, your thoughts are just another API call.",
  "The future is already here - it's just not evenly distributed.",
  "There are 10 types of people in the world: those who understand binary and those who don't.",
  "Debugging: removing the parts of the code that don't match reality.",
  "The light at the end of the tunnel is probably a train. Or neon.",
  "I'm not saying I have a problem with JavaScript, but I have 14 npm packages for it.",
  "The city doesn't sleep. Neither does your database.",
];

const passwordList = [
  "admin", "password", "123456", "qwerty", "letmein",
  "toille", "cyberpunk", "neon", "shadow", "root",
];

const hackSteps = [
  "INITIALIZING EXPLOIT FRAMEWORK...",
  "SCANNING TARGET PORTS...",
  "  Port 22: OPEN (SSH)",
  "  Port 80: OPEN (HTTP)",
  "  Port 443: OPEN (HTTPS)",
  "  Port 8080: OPEN (PROXY)",
  "  Port 1337: OPEN (??? )",
  "IDENTIFYING VULNERABILITIES...",
  "  [OK] CVE-2084-1337: Buffer overflow in neon-grid",
  "  [OK] CVE-2084-0001: SQL injection in data-core",
  "  [OK] CVE-2084-0069: Race condition in traffic AI",
  "DEPLOYING PAYLOAD...",
  "  [====================] 100%",
  "ESTABLISHING BACKDOOR...",
  "  Connection encrypted (4096-bit RSA)",
  "  Tunnel: secure",
  "ESCALATING PRIVILEGES...",
  "  [+] Access level: ADMIN",
  "  [+] User: root",
  "DOWNLOADING DATA...",
  "  [====================] 100%",
  "COVERING TRACKS...",
  "  Logs: cleared",
  "  Audit trail: deleted",
  "MISSION COMPLETE.",
  "",
  "> Data packet saved to /home/guest/.secret/hack.txt",
];

const scanResult = `
SCANNING NETWORK 10.0.0.0/24...

Host             MAC               Status    Services
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551        TOILLE-CITY STATUS REPORT     \u2551
\u2551  Population:    4,873,291 citizens   \u2551
\u2551  Area:          2000m x 2000m        \u2551
\u2551  Buildings:     1,024                \u2551
\u2551  Districts:     4                    \u2551
\u2551  Traffic:       73% capacity         \u2551
\u2551  Neon Level:    88%                  \u2551
\u2551  Crime Rate:    12.4%                \u2551
\u2551  Story Missions: 5                   \u2551
\u2551  Game Modes:    3 (Drive/Explore/Demo)\u2551
\u2551  Engine:        Three.js + WebGL     \u2551
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`;

function bootSequence() {
  const bootLines = [
    { text: "sys: TOILLE-OS v3.0.1 booting...", delay: 200 },
    { text: "sys: kernel loaded (cyberpunk-neon 6.6.0-cyber)", delay: 150 },
    { text: "sys: memory check... 64TB OK", delay: 120 },
    { text: "sys: neon-grid init... OK", delay: 180 },
    { text: "sys: quantum entropy pool seeded", delay: 100 },
    { text: "sys: network interfaces up (10.0.0.42)", delay: 250 },
    { text: "sys: city data-link established", delay: 200 },
    { text: "sys: audio system ready", delay: 150 },
    { text: "sec: firewall active (1327 rules)", delay: 100 },
    { text: "sec: intrusion detection online", delay: 150 },
    { text: "sys: login prompt ready", delay: 100 },
    { text: "", delay: 100 },
    { text: "TOILLE-OS v3.0.1 (cyberpunk-neon 6.6.0-cyber)", delay: 50 },
    { text: "Type 'help' for available commands.", delay: 50 },
    { text: "", delay: 50 },
  ];
  let i = 0;
  function nextBoot() {
    if (i < bootLines.length) {
      bootText.value = bootLines[i].text;
      scrollToBottom();
      i++;
      setTimeout(nextBoot, bootLines[i - 1].delay);
    } else {
      animating.value = false;
      bootText.value = "";
      terminalRef.value?.focus();
      scrollToBottom();
    }
  }
  nextBoot();
}

onMounted(() => {
  bootSequence();
  startTime.value = Date.now();
});

const helpText = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551              TOILLE-OS HELP v1.0               \u2551
\u2551  SYSTEM                                          \u2551
\u2551    help         Show this help message             \u2551
\u2551    clear        Clear the terminal                 \u2551
\u2551    whoami       Display current user               \u2551
\u2551    neofetch     Display system info                \u2551
\u2551    uname        Display OS info                    \u2551
\u2551    uptime       Show uptime                        \u2551
\u2551    date         Show current date/time             \u2551
\u2551    echo         Echo text                          \u2551
\u2551    banner       Show ASCII banner                  \u2551
\u2551    env          Show environment variables         \u2551
\u2551    id           Show user identity                 \u2551
\u2551    pwd          Print working directory            \u2551
\u2551    history      Show command history               \u2551
\u2551  FILESYSTEM                                      \u2551
\u2551    ls [path]    List directory contents            \u2551
\u2551    cat <file>   Show file contents                 \u2551
\u2551  FUN                                              \u2551
\u2551    fortune      Random cyberpunk fortune           \u2551
\u2551    hack         Simulate hacking sequence          \u2551
\u2551    matrix       Watch the Matrix rain             \u2551
\u2551    scan         Network scan                       \u2551
\u2551    crack        Crack a password                   \u2551
\u2551    ping [host]  Ping a host                        \u2551
\u2551    roll [n]     Roll an n-sided die                \u2551
\u2551    coinflip     Flip a coin                        \u2551
\u2551    glitch       Initiate glitch sequence           \u2551
\u2551    rainbow      Rainbow text                       \u2551
\u2551    cowsay       Let the cow speak                  \u2551
\u2551    sl           Steam locomotive                   \u2551
\u2551    figlet       Display ASCII art text             \u2551
\u2551    ascii        Random ASCII art                   \u2551
\u2551  LORE                                              \u2551
\u2551    story        Cyberpunk city lore                \u2551
\u2551    whois        Information about Elliot           \u2551
\u2551    skills       Elliot's technical skills          \u2551
\u2551    music        About the music                    \u2551
\u2551    city         City status report                 \u2551
\u2551    decrypt      Decrypt a message                  \u2551
\u2551    encrypt      Encrypt data                       \u2551
\u2551    connect      Connect to the network             \u2551
\u2551    phone-home   Call home base                     \u2551
\u2551  CONTROL                                          \u2551
\u2551    sudo <cmd>   Superuser (denied)                 \u2551
\u2551    reboot       Reboot the terminal                \u2551
\u2551    shutdown     Close the terminal                 \u2551
\u2551    exit         Close the terminal                 \u2551
\u2551  NETWORK                                          \u2551
\u2551    curl <url>   Make HTTP request                  \u2551
\u2551    ssh <host>   SSH to host                        \u2551
\u2551    traceroute   Trace route to host                \u2551
\u2551    docker       Check Docker status                \u2551
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`;

const commandAliases: Record<string, string> = {
  shutdown: "exit",
};

const commands: Record<string, (args: string[]) => void> = {
  help() { addPre(helpText, "help"); },
  clear() { lines.value = []; },
  whoami() { addLine("guest - anonymous user on TOILLE-CITY network"); },
  neofetch() { addPre(systemInfo(), "neofetch"); },
  uname() { addLine("TOILLE-OS v3.0.1 cyberpunk-neon 6.6.0-cyber x86_64"); },
  uptime() { showUptime(); },
  date() { addLine(new Date().toLocaleString()); },
  echo(args: string[]) { addLine(args.join(" ") || ""); },
  ls(args: string[]) { doLs(args); },
  cat(args: string[]) { doCat(args); },
  banner() { addPre(asciiBanner, "banner"); },
  fortune() { addLine(fortunes[Math.floor(Math.random() * fortunes.length)], "fortune"); },
  hack() { simulateHack(); },
  matrix() { startMatrix(); },
  scan() { addPre(scanResult, "scan"); },
  crack(args: string[]) { doCrack(args); },
  ping(args: string[]) { doPing(args); },
  sudo() {
    addLine("sudo: PERMISSION DENIED. This incident has been logged.", "error");
    addLine("sudo: Nice try, skid. Come back with admin credentials.", "error");
  },
  story() { addPre(virtualFS["/home/guest/.secret/lore.txt"], "story"); },
  whois(args: string[]) { doWhois(args); },
  skills() { addPre(virtualFS["/data/skills.db"], "skills"); },
  music() {
    addLine("Elliot writes original guitar compositions.", "info");
    addLine("Check out: https://www.youtube.com/@toilled", "info");
    addLine("The cyberpunk audio you hear is procedurally generated in real-time using Web Audio API.");
  },
  city() { addPre(cityInfo, "city"); },
  glitch() {
    addLine("INITIATING GLITCH SEQUENCE...", "error");
    addLine("SYSTEM CORRUPTION DETECTED", "error");
    addLine("jk. The glitch effect is purely cosmetic. This city loves its style.", "info");
  },
  theme() {
    addLine("Available themes: neon-dark (current)", "info");
    addLine("The theme manager is currently under construction. Come back in 2085.");
  },
  reboot() {
    addLine("REBOOTING...");
    lines.value = [];
    bootSequence();
  },
  exit() {
    addLine("Shutting down... Goodbye, choom.");
    setTimeout(() => close(), 800);
  },
  roll(args: string[]) {
    const sides = parseInt(args[0]) || 6;
    addLine(`d${sides}: ${Math.floor(Math.random() * sides) + 1}`);
  },
  coinflip() { addLine(Math.random() > 0.5 ? "Heads" : "Tails"); },
  weather() {
    addLine("Fetching weather data...", "info");
    addLine("Temp: 18C | Condition: Neon drizzle | Humidity: 67%");
    addLine("Forecast: Glitchy with a chance of cyberpunk.");
  },
  rainbow(args: string[]) {
    addLine(args.join(" ") || "The neon flows through everything.", "rainbow");
  },
  yes() { addLine("y"); },
  env() {
    addLine("SHELL=/bin/toille-sh");
    addLine("USER=guest");
    addLine("HOSTNAME=toille-city");
    addLine("TERM=xterm-256color");
    addLine("HOME=/home/guest");
    addLine("PATH=/usr/local/bin:/usr/bin:/bin");
    addLine("THEME=neon-dark");
  },
  id() { addLine("uid=1337(guest) gid=42(users) groups=42(users),69(cyberpunk),420(neon)"); },
  ps() {
    addLine("  PID TTY          TIME CMD");
    addLine("    1 ?        00:00:42 init");
    addLine("   42 ?        00:06:09 neongrid");
    addLine("   69 ?        00:01:33 audio-daemon");
    addLine("  420 ?        00:00:01 terminal");
    addLine(" 1337 ?        00:00:00 ps");
  },
  top() {
    addLine("top - task manager not available in this terminal.");
    addLine("However, I can tell you that nothing is running.");
    addLine("Except the neon. The neon is always running.");
  },
  kill() { addLine("kill: usage: don't. We're all friends here."); },
  find() { addLine("find: You're the one who's lost, aren't you?"); },
  grep() { addLine("grep: searching... nope, couldn't find what you're looking for."); },
  curl(args: string[]) {
    if (args[0]) {
      addLine(`curl ${args[0]}...`);
      addLine('[OK] 200 - Response: {"message": "Hello from the edge."}');
    } else {
      addLine("curl: try 'curl https://toille.uk'");
    }
  },
  ssh(args: string[]) {
    addLine("ssh: Connecting to " + (args[0] || "unknown") + "...");
    addLine("The connection was refused. The city guards its secrets.");
  },
  traceroute(args: string[]) {
    addLine("traceroute to " + (args[0] || "target") + ":");
    addLine(" 1  gateway.toille-city (10.0.0.1)  2.3ms");
    addLine(" 2  neon-core-01 (10.0.1.1)  4.2ms");
    addLine(" 3  data-vortex-02 (10.0.2.1)  6.9ms");
    addLine(" 4  * * *");
    addLine(" 5  * * *");
    addLine(" 6  ^C");
  },
  history() {
    commandHistory.value.forEach((c, i) => { addLine(`  ${i + 1}  ${c}`); });
  },
  nmap() { addLine("nmap: Use 'scan' for a quick scan, or type 'nmap -A target' (jk, this isn't real)"); },
  vim() { addLine("vim: You can't escape vim. But also, this is not vim. Type 'help'."); },
  emacs() { addLine("emacs: It's just a text editor. Or an OS. We can't tell anymore."); },
  nano() { addLine("nano: ^X to exit. Oh wait, this isn't nano either."); },
  python() {
    addLine("Python 3.13.0 (default, Oct 2024, 12:00:00)");
    addLine("[GCC 14.2.0] on linux");
    addLine('Type "help", "copyright", "credits" or "license" for more information.');
    addLine(">>>  (Python REPL not available in this terminal. Try 'node' instead.)");
  },
  node() {
    addLine("> Welcome to Node.js v23.0.0");
    addLine("> (Not really, but the real site is built with Vue 3 + Vite!)");
  },
  man() {
    addLine("What manual page do you want?");
    addLine("(This isn't a real man page system. Try 'help' instead.)");
  },
  su() {
    addLine("su: Authentication failure");
    addLine("(You can't become root that easily. Try harder.)");
  },
  apt() { addLine("apt: Command not found. Try building from source."); },
  "apt-get"() { addLine("apt-get: Command not found. Try building from source."); },
  brew() { addLine("brew: Command not found. Try building from source."); },
  npm() { addLine("npm: Command not found. Try building from source."); },
  docker() { addLine("Docker is running. Containers: 4 (neon-grid, city-db, traffic-ai, audio-srv)"); },
  make() { addLine("make: Nothing to be done for 'all'."); },
  pwd() { addLine("/home/guest"); },
  cd() { addLine("(This terminal has a fixed filesystem. 'ls' and 'cat' still work.)"); },
  chmod() { addLine("chmod: changing permissions of files is not supported in this simulation."); },
  df() {
    addLine("Filesystem       Size  Used Avail Use% Mounted on");
    addLine("/dev/neon        1.2PB 342GB 858GB  28% /");
    addLine("tmpfs            64TB   12GB  64TB   1% /tmp");
  },
  free() {
    addLine("              total        used        free      shared  buff/cache");
    addLine("Mem:          64TB       42TB        18TB        2TB       2TB");
    addLine("Swap:         128TB       0B        128TB");
  },
  lolcat(args: string[]) {
    addLine(args.join(" ") || "Close enough. The command doesn't exist but the spirit is there.", "rainbow");
  },
  sl() {
    addPre(`
   CHOO CHOO!

   === TOILLE EXPRESS ===
   |${'='.repeat(40)}|
   O${' '.repeat(40)}O
  `, "rainbow");
  },
  cowsay(args: string[]) { cowsayCmd(args.join(" ") || "Moo."); },
  figlet() { addPre(asciiBanner); },
  "phone-home"() {
    addLine("Calling home...");
    addLine("Signal detected. TOILLE-CITY is listening.");
    addLine("All systems nominal. Continue your mission.");
  },
  connect() {
    addLine("Establishing quantum link...");
    addLine("Searching for peers...");
    addLine("No peers found. You are alone in the net.");
  },
  decrypt() {
    addLine("Decrypting data...");
    addLine("[====================] 100%");
    addLine("Decrypted: \"The password is always 'toille'.\"");
  },
  encrypt() {
    addLine("Encrypting data with AES-256...");
    addLine("[====================] 100%");
    addLine("Data secured. Key stored in quantum vault.");
  },
  ascii() { addPre(getRandomAscii()); },
};

function executeCommand(cmd: string) {
  const trimmed = cmd.trim();
  if (!trimmed) return;

  addLine(`${prompt}${trimmed}`);
  commandHistory.value.push(trimmed);
  historyIndex.value = commandHistory.value.length;

  const parts = trimmed.split(/\s+/);
  let command = parts[0].toLowerCase();
  const args = parts.slice(1);

  const resolved = commandAliases[command] || command;
  if (commands[resolved]) {
    commands[resolved](args);
  } else {
    addLine(`command not found: ${command}`, "error");
    addLine("Type 'help' for a list of available commands.", "info");
  }

  scrollToBottom();
}

const dirListing: Record<string, string[]> = {
  "/": ["guest/"],
  "/home": ["guest/"],
  "/home/guest": [".secret/", "readme.txt", "notes.txt"],
  "~": [".secret/", "readme.txt", "notes.txt"],
  "/home/guest/.secret": ["hack.txt", "lore.txt"],
  ".secret": ["hack.txt", "lore.txt"],
  "/etc": ["motd", "config"],
  "/var": ["log/"],
  "/var/log": ["access.log", "city.log"],
  "/data": ["skills.db", "contacts.db"],
  "/usr": ["toille-sh", "neon-grid", "city-builder"],
  "/usr/local": ["toille-sh", "neon-grid", "city-builder"],
  "/usr/local/bin": ["toille-sh", "neon-grid", "city-builder"],
};

function doLs(args: string[]) {
  const path = args[0] || "/home/guest";
  const entries = dirListing[path];
  if (entries) {
    entries.forEach(entry => addLine(entry));
  } else {
    addLine(`ls: cannot access '${path}': No such file or directory`, "error");
  }
}

function doCat(args: string[]) {
  if (args.length === 0) {
    addLine("cat: missing operand", "error");
    return;
  }
  const filePath = args[0];
  const resolved = resolvePath(filePath);
  if (virtualFS[resolved]) {
    addPre(virtualFS[resolved]);
  } else {
    addLine(`cat: ${filePath}: No such file or directory`, "error");
  }
}

function resolvePath(p: string): string {
  if (p.startsWith("/")) return p;
  const map: Record<string, string> = {
    "readme.txt": "/home/guest/readme.txt",
    "notes.txt": "/home/guest/notes.txt",
    "hack.txt": "/home/guest/.secret/hack.txt",
    "lore.txt": "/home/guest/.secret/lore.txt",
    "motd": "/etc/motd",
    "config": "/etc/config",
    "access.log": "/var/log/access.log",
    "city.log": "/var/log/city.log",
    "skills.db": "/data/skills.db",
    "contacts.db": "/data/contacts.db",
  };
  return map[p] || `/home/guest/${p}`;
}

function simulateHack() {
  let i = 0;
  function nextHackStep() {
    if (i < hackSteps.length) {
      addLine(hackSteps[i]);
      scrollToBottom();
      i++;
      setTimeout(nextHackStep, 300 + Math.random() * 400);
    }
  }
  nextHackStep();
}

function startMatrix() {
  if (matrixInterval.value) return;
  addLine("INITIALIZING MATRIX... (it will run for 5 seconds)");
  scrollToBottom();
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
  let frame = 0;
  matrixInterval.value = setInterval(() => {
    if (frame > 20) {
      if (matrixInterval.value) {
        clearInterval(matrixInterval.value);
        matrixInterval.value = null;
      }
      addLine("Matrix sequence ended. The neon flows on.");
      scrollToBottom();
      return;
    }
    let line = "";
    for (let i = 0; i < 60; i++) {
      line += Math.random() > 0.6 ? chars[Math.floor(Math.random() * chars.length)] : " ";
    }
    addLine(line, "matrix");
    scrollToBottom();
    frame++;
  }, 80);
}

function doCrack(args: string[]) {
  const target = args[0] || "admin";
  addLine(`CRACKING PASSWORD FOR: ${target}...`);
  addLine(`Target hash: ${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("")}`);
  let found = false;
  for (const pw of passwordList) {
    if (Math.random() > 0.7) {
      addLine(`  Trying: ${pw}... MATCH!`);
      found = true;
      break;
    } else {
      addLine(`  Trying: ${pw}... no`);
    }
  }
  if (found) {
    addLine("");
    addLine(`PASSWORD CRACKED: ${target}:${passwordList[Math.floor(Math.random() * passwordList.length)]}`);
    addLine("Access granted. Welcome to the undernet.");
  } else {
    addLine("");
    addLine("Password not found in dictionary. Try a longer wordlist.");
    addLine("(Hint: the password is usually something obvious.)");
  }
}

function doPing(args: string[]) {
  const host = args[0] || "localhost";
  addLine(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);
  let i = 0;
  function nextPing() {
    if (i < 4) {
      const ms = Math.floor(Math.random() * 50 + 5);
      addLine(`64 bytes from ${host} (127.0.0.1): icmp_seq=${i+1} ttl=64 time=${ms}.${Math.floor(Math.random()*9)}ms`);
      i++;
      setTimeout(nextPing, 500);
    } else {
      addLine("");
      addLine(`--- ${host} ping statistics ---`);
      addLine("4 packets transmitted, 4 received, 0% packet loss, time 3004ms");
    }
  }
  nextPing();
}

function doWhois(args: string[]) {
  const target = (args[0] || "elliot").toLowerCase();
  if (target === "elliot" || target === "toille") {
    addPre(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551         WHOIS: ELLIOT DICKERSON      \u2551
\u2551  Name:       Elliot Dickerson        \u2551
\u2551  Role:       Software Engineer       \u2551
\u2551  Company:    RM Education            \u2551
\u2551  Location:   United Kingdom          \u2551
\u2551  Web:        https://toille.uk       \u2551
\u2551  GitHub:     github.com/toilled      \u2551
\u2551  YouTube:    youtube.com/@toilled    \u2551
\u2551  Stack:      Vue 3, PHP, TS, 3D     \u2551
\u2551  Vibe:       Cyberpunk Professional  \u2551
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`);
  } else {
    addLine(`whois: ${target}: No such record`);
  }
}

function showUptime() {
  const secs = Math.floor((Date.now() - startTime.value) / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  addLine(`up ${hrs > 0 ? `${hrs}h ` : ""}${mins % 60}m ${secs % 60}s, 1 user, load: 0.42 0.69 1.33`);
}

function systemInfo(): string {
  const s = Math.floor((Date.now() - startTime.value) / 1000);
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

function cowsayCmd(msg: string) {
  const border = "-".repeat(msg.length + 2);
  addLine(` ${border}`);
  addLine(`< ${msg} >`);
  addLine(` ${border}`);
  addLine("        \\   ^__^");
  addLine("         \\  (oo)\\_______");
  addLine("            (__)\\       )\\/\\");
  addLine("                ||----w |");
  addLine("                ||     ||");
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

function handleKeydown(e: KeyboardEvent) {
  if (animating.value) return;

  const actions: Record<string, (ev: KeyboardEvent) => void> = {
    Enter(ev) {
      ev.preventDefault();
      executeCommand(currentInput.value);
      currentInput.value = "";
    },
    Backspace(ev) {
      ev.preventDefault();
      currentInput.value = currentInput.value.slice(0, -1);
    },
    ArrowUp(ev) {
      ev.preventDefault();
      if (commandHistory.value.length > 0 && historyIndex.value > 0) {
        historyIndex.value--;
        currentInput.value = commandHistory.value[historyIndex.value];
      }
    },
    ArrowDown(ev) {
      ev.preventDefault();
      if (historyIndex.value < commandHistory.value.length - 1) {
        historyIndex.value++;
        currentInput.value = commandHistory.value[historyIndex.value];
      } else {
        historyIndex.value = commandHistory.value.length;
        currentInput.value = "";
      }
    },
    Tab(ev) { ev.preventDefault(); },
    Delete(ev) { ev.preventDefault(); },
  };

  if (actions[e.key]) {
    actions[e.key](e);
    return;
  }

  if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    lines.value = [];
    return;
  }

  if (e.key.length === 1) {
    e.preventDefault();
    currentInput.value += e.key;
  }
}
</script>

<style scoped>
.terminal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(5, 5, 16, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.terminal {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  background: #0a0a1a;
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 0 40px rgba(0, 255, 204, 0.15),
    0 0 80px rgba(255, 0, 204, 0.1),
    inset 0 0 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  outline: none;
  color: #00ffcc;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(0, 255, 204, 0.15);
  flex-shrink: 0;
}

.terminal-title {
  font-size: 0.75rem;
  font-weight: bold;
  color: #ff00cc;
  text-shadow: 0 0 10px rgba(255, 0, 204, 0.5);
  letter-spacing: 0.1em;
}

.terminal-controls {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.close {
  background: #ff5f56;
  cursor: pointer;
  transition: all 0.2s ease;
}

.can-hover .dot.close:hover {
  filter: brightness(1.3);
  box-shadow: 0 0 6px rgba(255, 95, 86, 0.6);
}

.dot.min {
  background: #ffbd2e;
}

.dot.max {
  background: #27c93f;
}

.terminal-body {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
  max-height: calc(80vh - 42px);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 204, 0.3) transparent;
}

.terminal-body::-webkit-scrollbar {
  width: 4px;
}

.terminal-body::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 204, 0.3);
  border-radius: 2px;
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 1px;
}

.terminal-line pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  white-space: pre;
  overflow-x: auto;
}

.terminal-line.error {
  color: #ff5f56;
}

.terminal-line.info {
  color: rgba(0, 255, 204, 0.7);
}

.terminal-line.fortune {
  font-style: italic;
  color: rgba(0, 255, 204, 0.8);
}

.terminal-line.matrix {
  color: rgba(0, 255, 0, 0.6);
  font-size: 0.75rem;
  line-height: 1.1;
}

.terminal-line.rainbow {
  background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.terminal-line.banner {
  color: #ff00cc;
  font-weight: bold;
}

.terminal-line.help {
  color: rgba(0, 255, 204, 0.85);
  font-size: 0.8rem;
}

.terminal-line.neofetch {
  color: #00ffcc;
}

.terminal-line.scan {
  color: rgba(0, 255, 204, 0.75);
}

.terminal-line.story {
  color: rgba(255, 0, 204, 0.8);
}

.terminal-line.city {
  color: rgba(0, 255, 204, 0.85);
}

.terminal-line.skills {
  color: rgba(0, 255, 204, 0.8);
}

.terminal-input-line {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: pre;
}

.prompt {
  color: #ff00cc;
  flex-shrink: 0;
}

.input-text {
  color: #00ffcc;
}

.cursor {
  color: #00ffcc;
  animation: blink-anim 0.8s step-end infinite;
  margin-left: 1px;
  line-height: 1;
}

.cursor.blink {
  animation: blink-anim 0.8s step-end infinite;
}

@keyframes blink-anim {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.terminal-overlay:not(:focus-within) .cursor {
  animation: none;
  opacity: 0.4;
}

@media (max-width: 600px) {
  .terminal-overlay {
    padding: 0.5rem;
    align-items: stretch;
  }

  .terminal {
    max-height: 95vh;
    font-size: 0.75rem;
  }

  .terminal-body {
    min-height: 200px;
    max-height: calc(95vh - 42px);
  }
}
</style>
