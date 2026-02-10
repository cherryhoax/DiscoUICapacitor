#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const colors = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  cyan: '\u001b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  ok: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  err: (msg) => console.error(`${colors.red}${msg}${colors.reset}`)
};

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'disco-app';

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
};

const copyIfExists = (fromPath, toPath) => {
  if (!fs.existsSync(fromPath)) return false;
  ensureDir(path.dirname(toPath));
  fs.copyFileSync(fromPath, toPath);
  return true;
};

const question = (rl, text, def) =>
  new Promise((resolve) => {
    const suffix = def ? ` ${colors.dim}(${def})${colors.reset}` : '';
    rl.question(`${colors.bold}${text}${colors.reset}${suffix}: `, (answer) => {
      const value = answer.trim();
      resolve(value || def || '');
    });
  });

const pick = async (rl, text, options, defIndex = 0) => {
  log.info(text);
  options.forEach((opt, idx) => {
    const label = idx === defIndex ? `${opt} ${colors.dim}[default]${colors.reset}` : opt;
    console.log(`  ${idx + 1}) ${label}`);
  });
  const answer = await question(rl, 'Select', String(defIndex + 1));
  const idx = Math.min(options.length - 1, Math.max(0, Number(answer) - 1));
  return options[idx];
};

const THEME_OPTIONS = ['auto', 'dark', 'light'];
const PAGE_OPTIONS = ['page', 'single page', 'pivot', 'hub', 'single page + list view'];

const normalizeTheme = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return THEME_OPTIONS.includes(normalized) ? normalized : null;
};

const normalizePage = (value) => {
  if (!value) return null;
  const cleaned = String(value)
    .trim()
    .toLowerCase()
    .replace(/[+]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (cleaned === 'single page list view' || cleaned === 'single page + list view') {
    return 'single page + list view';
  }

  if (PAGE_OPTIONS.includes(cleaned)) return cleaned;
  return null;
};

const parseArgs = (args) => {
  const parsed = { _: [] };
  let idx = 0;

  while (idx < args.length) {
    const arg = args[idx];

    if (arg === '--') {
      parsed._.push(...args.slice(idx + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const [rawKey, rawValue] = arg.slice(2).split('=');
      const key = rawKey.trim();
      let value = rawValue;

      if (value === undefined && idx + 1 < args.length && !args[idx + 1].startsWith('-')) {
        value = args[idx + 1];
        idx += 1;
      }

      parsed[key] = value !== undefined ? value : true;
      idx += 1;
      continue;
    }

    if (arg.startsWith('-') && arg.length > 1) {
      if (arg === '-y') parsed.yes = true;
      if (arg === '-h') parsed.help = true;
      if (arg === '-n' && idx + 1 < args.length) {
        parsed.name = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-d' && idx + 1 < args.length) {
        parsed.dir = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-i' && idx + 1 < args.length) {
        parsed['app-id'] = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-a' && idx + 1 < args.length) {
        parsed.accent = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-t' && idx + 1 < args.length) {
        parsed.theme = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-I' && idx + 1 < args.length) {
        parsed.icon = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-p' && idx + 1 < args.length) {
        parsed.page = args[idx + 1];
        idx += 2;
        continue;
      }
      idx += 1;
      continue;
    }

    parsed._.push(arg);
    idx += 1;
  }

  return parsed;
};

const usage = () => {
  console.log(`${colors.bold}dui${colors.reset} ${colors.dim}<command>${colors.reset}`);
  console.log('');
  console.log('Commands:');
  console.log('  create-app   Create a new DiscoUI Capacitor app');
  console.log('');
  console.log('Options (create-app):');
  console.log('  --name <name>          App name');
  console.log('  --dir <dir>            Target directory');
  console.log('  --app-id <id>          App id (ex: com.example.app)');
  console.log('  --accent <hex>         Accent color (ex: #D80073)');
  console.log('  --theme <theme>        auto | dark | light');
  console.log('  --icon <path>          Icon file path');
  console.log('  --page <template>      page | single page | pivot | hub | single page + list view');
  console.log('  --yes                  Unattended (use defaults for missing values)');
  console.log('  --no-install           Skip npm install and cap sync');
  console.log('  -h, --help             Show help');
  console.log('');
};

const createAppUsage = () => {
  console.log(`${colors.bold}dui${colors.reset} create-app ${colors.dim}[options]${colors.reset}`);
  console.log('');
  console.log('Options:');
  console.log('  -n, --name <name>       App name');
  console.log('  -d, --dir <dir>         Target directory');
  console.log('  -i, --app-id <id>       App id (ex: com.example.app)');
  console.log('  -a, --accent <hex>      Accent color (ex: #D80073)');
  console.log('  -t, --theme <theme>     auto | dark | light');
  console.log('  -I, --icon <path>       Icon file path');
  console.log('  -p, --page <template>   page | single page | pivot | hub | single page + list view');
  console.log('  -y, --yes               Unattended (use defaults for missing values)');
  console.log('      --no-install        Skip npm install and cap sync');
  console.log('  -h, --help              Show help');
  console.log('');
};

const createApp = async (options) => {
  log.info('DiscoUI Capacitor - Create App');

  const providedTheme = options.theme ? normalizeTheme(options.theme) : null;
  if (options.theme && !providedTheme) {
    log.err(`Invalid theme: ${options.theme}`);
    process.exit(1);
  }

  const providedPage = options.firstPage ? normalizePage(options.firstPage) : null;
  if (options.firstPage && !providedPage) {
    log.err(`Invalid page template: ${options.firstPage}`);
    process.exit(1);
  }

  const baseName = options.appName || 'Disco App';
  let appName = baseName;
  let targetDir = options.targetDir;
  let appId = options.appId;
  let accent = options.accent || '#D80073';
  let theme = providedTheme || 'auto';
  let iconPathInput = options.iconPath || '';
  let firstPage = providedPage || 'single page';

  if (!options.unattended) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    appName = await question(rl, 'App name', baseName);
    const defaultDir = slugify(appName);
    targetDir = targetDir || (await question(rl, 'Directory', defaultDir));
    appId = await question(rl, 'App id', appId || `com.disco.${slugify(appName)}`);
    accent = await question(rl, 'Accent color', accent);

    if (options.theme) {
      theme = providedTheme;
    } else {
      const themeIndex = THEME_OPTIONS.indexOf('auto');
      theme = await pick(rl, 'Theme', THEME_OPTIONS, themeIndex);
    }

    if (options.iconPath) {
      iconPathInput = options.iconPath;
    } else {
      iconPathInput = await question(rl, 'Icon file path (optional)', '');
    }

    if (options.firstPage) {
      firstPage = providedPage;
    } else {
      const pageIndex = PAGE_OPTIONS.indexOf('single page');
      firstPage = await pick(rl, 'First page template', PAGE_OPTIONS, pageIndex);
    }

    rl.close();
  } else {
    appName = baseName;
    targetDir = targetDir || slugify(appName);
    appId = appId || `com.disco.${slugify(appName)}`;
    theme = theme || 'auto';
    firstPage = firstPage || 'single page';
  }

  const targetPath = path.resolve(process.cwd(), targetDir);
  if (fs.existsSync(targetPath)) {
    log.err(`Directory already exists: ${targetPath}`);
    process.exit(1);
  }

  ensureDir(targetPath);

  const publicDir = path.join(targetPath, 'public');
  const srcDir = path.join(targetPath, 'src');

  const defaultIconSource = path.resolve(__dirname, '../example-app/duic.svg');
  let iconFileName = 'duic.svg';
  if (iconPathInput && fs.existsSync(path.resolve(iconPathInput))) {
    iconFileName = path.basename(iconPathInput);
    copyIfExists(path.resolve(iconPathInput), path.join(publicDir, iconFileName));
  } else {
    copyIfExists(defaultIconSource, path.join(publicDir, iconFileName));
  }

  const themeAttr = theme === 'auto' ? 'auto' : theme;

  const discoConfig = {
    theme: themeAttr,
    accent: accent,
    font: 'SegoeUI',
    splash: {
      mode: 'manual',
      color: accent,
      icon: `/${iconFileName}`,
      showProgress: true
    }
  };

  const capacitorConfig = {
    appId: appId,
    appName: appName,
    webDir: 'dist',
    plugins: {
      SplashScreen: {
        launchShow: false,
        launchAutoHide: false,
        androidScaleType: 'CENTER_CROP'
      }
    }
  };

  writeFile(path.join(targetPath, 'disco.config.json'), `${JSON.stringify(discoConfig, null, 2)}\n`);
  writeFile(path.join(targetPath, 'capacitor.config.json'), `${JSON.stringify(capacitorConfig, null, 2)}\n`);

  const packageJson = {
    name: slugify(appName),
    version: '0.0.1',
    description: 'DiscoUI Capacitor app',
    type: 'module',
    scripts: {
      start: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      sync: 'npx cap sync'
    },
    dependencies: {
      '@capacitor/core': 'latest',
      '@capacitor/android': '8.0.0',
      discouicapacitor: 'latest'
    },
    devDependencies: {
      '@capacitor/cli': 'latest',
      vite: '^5.4.2'
    }
  };

  writeFile(path.join(targetPath, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  writeFile(
    path.join(targetPath, 'vite.config.ts'),
    `import { defineConfig } from 'vite';\n\nexport default defineConfig({\n  root: './src',\n  base: './',\n  build: {\n    outDir: '../dist',\n    minify: false,\n    emptyOutDir: true\n  }\n});\n`
  );

  const baseStyles = `/* Critical preload styles to prevent frame flash */\ndisco-frame {\n  display: none;\n}\ndisco-frame[disco-launched] {\n  display: flex;\n}\n`;

  const pageTemplates = {
    page: `\n<disco-page id="homePage">\n  <div style="padding: 20px;">Welcome to ${appName}</div>\n</disco-page>`,
    'single page': `\n<disco-single-page id="homePage" app-title="${appName}" header="home">\n  <div style="padding: 20px;">Welcome to ${appName}</div>\n</disco-single-page>`,
    pivot: `\n<disco-pivot-page id="homePage" app-title="${appName}">\n  <disco-pivot-item header="overview">\n    <div style="padding: 20px;">Overview</div>\n  </disco-pivot-item>\n  <disco-pivot-item header="details">\n    <div style="padding: 20px;">Details</div>\n  </disco-pivot-item>\n</disco-pivot-page>`,
    hub: `\n<disco-hub-page id="homePage" header="${appName}">\n  <disco-hub-section header="featured">\n    <div style="padding: 20px;">Featured</div>\n  </disco-hub-section>\n  <disco-hub-section header="updates">\n    <div style="padding: 20px;">Updates</div>\n  </disco-hub-section>\n</disco-hub-page>`,
    'single page + list view': `\n<disco-single-page id="homePage" app-title="${appName}" header="home">\n  <disco-list-view selection-mode="none">\n    <disco-list-item><div>Item 1</div></disco-list-item>\n    <disco-list-item><div>Item 2</div></disco-list-item>\n  </disco-list-view>\n</disco-single-page>`
  };

  const bodyContent = pageTemplates[firstPage] || pageTemplates['single page'];

  const html = `<!DOCTYPE html>\n<html lang="en" disco-theme="${themeAttr}" disco-accent="${accent}">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${appName}</title>\n  <link rel="icon" href="/${iconFileName}" type="image/svg+xml" />\n  <style>\n${baseStyles}\n  </style>\n</head>\n<body>\n  <disco-frame id="appFrame">${bodyContent}\n  </disco-frame>\n  <script type="module" src="/index.js"></script>\n</body>\n</html>\n`;

  writeFile(path.join(srcDir, 'index.html'), html);

  const js = `import { DiscoApp } from 'discouicapacitor';\n\nconst start = async () => {\n  const app = new DiscoApp();\n  const frame = document.getElementById('appFrame');\n  const homePage = document.getElementById('homePage');\n  app.launch(frame);\n  if (homePage) frame.navigate(homePage);\n\n  setTimeout(async () => {\n    await app.dismissSplash();\n  }, 500);\n};\n\nDiscoApp.ready(start);\n`;

  writeFile(path.join(srcDir, 'index.js'), js);

  log.ok(`Project created at ${targetPath}`);

  if (options.noInstall) {
    log.warn('Skipping dependency install (--no-install).');
    log.ok('Done.');
    log.info(`Next: cd ${targetDir} && npm install && npx cap sync`);
    return;
  }

  log.info('Installing dependencies...');

  try {
    execSync('npm install', { cwd: targetPath, stdio: 'inherit' });
    execSync('npx cap sync', { cwd: targetPath, stdio: 'inherit' });
  } catch (err) {
    log.err('Install failed. You can run these manually:');
    log.err(`  cd ${targetDir}`);
    log.err('  npm install');
    log.err('  npx cap sync');
    process.exit(1);
  }

  log.ok('Done.');
  log.info(`Next: cd ${targetDir} && npm run start`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    return;
  }

  if (command === 'create-app') {
    const parsed = parseArgs(args.slice(1));
    if (parsed.help) {
      createAppUsage();
      return;
    }

    const options = {
      appName: parsed.name,
      targetDir: parsed.dir || parsed._[0],
      appId: parsed['app-id'],
      accent: parsed.accent,
      theme: parsed.theme,
      iconPath: parsed.icon,
      firstPage: parsed.page,
      unattended: Boolean(parsed.yes),
      noInstall: Boolean(parsed['no-install'])
    };

    await createApp(options);
    return;
  }

  log.err(`Unknown command: ${command}`);
  usage();
  process.exit(1);
};

main();
