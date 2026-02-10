#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
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

const THEME_OPTIONS = ['auto', 'dark', 'light'];
const PAGE_OPTIONS = ['page', 'single page', 'pivot', 'hub', 'single page + list view'];

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

const appendFileIfMissing = (filePath, content) => {
  if (fs.existsSync(filePath)) return;
  writeFile(filePath, content);
};

const copyIfExists = (fromPath, toPath) => {
  if (!fs.existsSync(fromPath)) return false;
  ensureDir(path.dirname(toPath));
  fs.copyFileSync(fromPath, toPath);
  return true;
};

const randomSecret = () => crypto.randomBytes(18).toString('hex');

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

      if (key === 'signing') {
        parsed.signing = true;
      } else if (key === 'no-signing') {
        parsed.signing = false;
      } else {
        parsed[key] = value !== undefined ? value : true;
      }

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
      if (arg === '-D' && idx + 1 < args.length) {
        parsed.description = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-o' && idx + 1 < args.length) {
        parsed['git-remote'] = args[idx + 1];
        idx += 2;
        continue;
      }
      if (arg === '-s') {
        parsed.signing = true;
        idx += 1;
        continue;
      }
      if (arg === '-r') {
        parsed['apk-action'] = true;
        idx += 1;
        continue;
      }
      if (arg === '-g') {
        parsed['git-init'] = true;
        idx += 1;
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
  console.log('  --description <text>   README description');
  console.log('  --yes                  Unattended (use defaults for missing values)');
  console.log('  --no-install           Skip npm install and cap sync');
  console.log('  --signing              Generate Android signing config');
  console.log('  --no-signing           Skip Android signing config');
  console.log('  --apk-action           Add GitHub Actions Android release workflow');
  console.log('  --git-init             Initialize git and create initial commit');
  console.log('  --git-remote <url>     Add remote and push initial commit');
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
  console.log('  -D, --description <t>   README description');
  console.log('  -o, --git-remote <url>  Add remote and push initial commit');
  console.log('  -y, --yes               Unattended (use defaults for missing values)');
  console.log('      --no-install        Skip npm install and cap sync');
  console.log('  -s, --signing           Generate Android signing config');
  console.log('      --no-signing        Skip Android signing config');
  console.log('  -r, --apk-action        Add GitHub Actions Android release workflow');
  console.log('  -g, --git-init          Initialize git and create initial commit');
  console.log('  -h, --help              Show help');
  console.log('');
};

const createReadme = ({
  targetPath,
  appName,
  description,
  appId,
  theme,
  accent,
  firstPage,
  apkAction
}) => {
  const lines = [
    `# ${appName}`,
    '',
    description,
    '',
    '## Package',
    '',
    `- App Id: ${appId}`,
    `- Theme: ${theme}`,
    `- Accent: ${accent}`,
    `- Template: ${firstPage}`,
    '',
    '## Quick Start',
    '',
    '```bash',
    'npm install',
    'npm run start',
    '```',
    '',
    '## Build',
    '',
    '```bash',
    'npm run build',
    'npx cap sync android',
    '```',
    '',
    '## Android Signing',
    '',
    'If you enabled signing, your keystore lives in `android/keystore` and is ignored by git.',
    'Keep it safe and provide secrets in CI before building a release APK.'
  ];

  if (apkAction) {
    lines.push(
      '',
      '## GitHub Actions',
      '',
      'The workflow expects these secrets:',
      '',
      '- ANDROID_KEYSTORE_BASE64',
      '- ANDROID_KEYSTORE_PASSWORD',
      '- ANDROID_KEY_ALIAS',
      '- ANDROID_KEY_PASSWORD',
      '',
      'To generate the base64 value:',
      '',
      '```bash',
      'base64 -i android/keystore/release.keystore | pbcopy',
      '```'
    );
  }

  writeFile(path.join(targetPath, 'README.md'), `${lines.join('\n')}\n`);
};

const createGitIgnore = (targetPath) => {
  const content = [
    'node_modules/',
    'dist/',
    '.env',
    '.env.local',
    '.DS_Store',
    'android/keystore/',
    'android/keystore/*.properties',
    'android/app/build/'
  ].join('\n');
  appendFileIfMissing(path.join(targetPath, '.gitignore'), `${content}\n`);
};

const ensureAndroidPlatform = (targetPath) => {
  const androidPath = path.join(targetPath, 'android');
  if (fs.existsSync(androidPath)) return;

  log.info('Adding Android platform...');
  execSync('npx cap add android', { cwd: targetPath, stdio: 'inherit' });
};

const updateAndroidBuildGradle = (buildGradlePath) => {
  if (!fs.existsSync(buildGradlePath)) return false;

  let content = fs.readFileSync(buildGradlePath, 'utf8');

  if (!content.includes('keystoreProperties')) {
    const importBlock = 'import java.util.Properties\nimport java.io.FileInputStream\n';
    if (!content.includes('import java.util.Properties')) {
      content = importBlock + content;
    }

    content = content.replace(
      /android\s*\{/, 
      `android {\n    def keystoreProperties = new Properties()\n    def keystorePropertiesFile = rootProject.file("keystore/release.properties")\n    if (keystorePropertiesFile.exists()) {\n        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))\n    }`
    );
  }

  if (!content.includes('signingConfigs')) {
    content = content.replace(
      /defaultConfig\s*\{([\s\S]*?)\n\s*\}/,
      (match) => `${match}\n\n    signingConfigs {\n        release {\n            if (keystorePropertiesFile.exists()) {\n                storeFile file("keystore/\\${keystoreProperties['storeFile']}")\n                storePassword \\${keystoreProperties['storePassword']}\n                keyAlias \\${keystoreProperties['keyAlias']}\n                keyPassword \\${keystoreProperties['keyPassword']}\n            }\n        }\n    }`
    );
  }

  if (!content.includes('signingConfig signingConfigs.release')) {
    content = content.replace(
      /buildTypes\s*\{([\s\S]*?)release\s*\{([\s\S]*?)\n\s*\}/,
      (match) => match.replace(/release\s*\{/, 'release {\n            signingConfig signingConfigs.release')
    );
  }

  fs.writeFileSync(buildGradlePath, content, 'utf8');
  return true;
};

const generateAndroidSigning = (targetPath, appName, appId) => {
  const androidPath = path.join(targetPath, 'android');
  if (!fs.existsSync(androidPath)) {
    log.warn('Android platform not found. Signing skipped.');
    return;
  }

  const keystoreDir = path.join(androidPath, 'keystore');
  ensureDir(keystoreDir);

  const keyAlias = slugify(appId || appName || 'disco-app');
  const storePassword = randomSecret();
  const keyPassword = randomSecret();
  const keystoreFile = path.join(keystoreDir, 'release.keystore');
  const propertiesFile = path.join(keystoreDir, 'release.properties');

  if (!fs.existsSync(keystoreFile)) {
    try {
      const dname = `CN=${appName || 'Disco App'}, OU=DiscoUI, O=DiscoUI, L=Istanbul, S=Istanbul, C=TR`;
      execSync(
        `keytool -genkeypair -v -keystore "${keystoreFile}" -alias "${keyAlias}" -keyalg RSA -keysize 2048 -validity 10000 -storepass "${storePassword}" -keypass "${keyPassword}" -dname "${dname}"`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      log.warn('Keytool not available. Skipping keystore generation.');
      return;
    }
  }

  const props = `storeFile=release.keystore\nstorePassword=${storePassword}\nkeyAlias=${keyAlias}\nkeyPassword=${keyPassword}\n`;
  writeFile(propertiesFile, props);

  const buildGradlePath = path.join(androidPath, 'app', 'build.gradle');
  if (!updateAndroidBuildGradle(buildGradlePath)) {
    log.warn('Could not update Android build.gradle for signing.');
    return;
  }

  log.ok('Android signing configured. Keystore saved under android/keystore.');
};

const createAndroidReleaseWorkflow = (targetPath) => {
  const workflowPath = path.join(targetPath, '.github', 'workflows', 'android-release.yml');
  const content = [
    'name: Android Release',
    '',
    'on:',
    '  workflow_dispatch: {}',
    '  push:',
    "    tags:",
    "      - 'v*.*.*'",
    '',
    'jobs:',
    '  build:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '      - uses: actions/setup-node@v4',
    '        with:',
    "          node-version: '20'",
    "          cache: 'npm'",
    '      - name: Install dependencies',
    '        run: npm install',
    '      - name: Build web',
    '        run: npm run build',
    '      - name: Sync Capacitor',
    '        run: npx cap sync android',
    '      - uses: actions/setup-java@v4',
    '        with:',
    "          distribution: 'temurin'",
    "          java-version: '17'",
    '      - name: Decode keystore',
    '        env:',
    '          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}',
    '          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}',
    '          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}',
    '          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}',
    '        run: |',
    '          mkdir -p android/keystore',
    '          echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > android/keystore/release.keystore',
    '          cat > android/keystore/release.properties <<EOF',
    '          storeFile=release.keystore',
    '          storePassword=$ANDROID_KEYSTORE_PASSWORD',
    '          keyAlias=$ANDROID_KEY_ALIAS',
    '          keyPassword=$ANDROID_KEY_PASSWORD',
    '          EOF',
    '      - name: Build release APK',
    '        run: cd android && ./gradlew assembleRelease',
    '      - uses: actions/upload-artifact@v4',
    '        with:',
    '          name: app-release',
    '          path: android/app/build/outputs/apk/release/app-release.apk'
  ].join('\n');

  writeFile(workflowPath, `${content}\n`);
};

const initGitRepo = (targetPath, gitRemote) => {
  try {
    execSync('git init', { cwd: targetPath, stdio: 'ignore' });
    execSync('git add .', { cwd: targetPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit"', { cwd: targetPath, stdio: 'ignore' });
    execSync('git branch -M main', { cwd: targetPath, stdio: 'ignore' });

    if (gitRemote) {
      execSync(`git remote add origin ${gitRemote}`, { cwd: targetPath, stdio: 'ignore' });
      execSync('git push -u origin main', { cwd: targetPath, stdio: 'inherit' });
    }

    log.ok('Git repository initialized with initial commit.');
  } catch (err) {
    log.warn('Git init failed. You can run it manually.');
  }
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
  let description = options.description || 'DiscoUI Capacitor app';
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
    description = await question(rl, 'Description', description);

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
    description: description,
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
      discouicapacitor: 'github:cherryhoax/DiscoUI#path:DiscoUICapacitor'
    },
    devDependencies: {
      '@capacitor/cli': 'latest',
      less: '^4.2.0',
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

  createGitIgnore(targetPath);
  createReadme({
    targetPath,
    appName,
    description,
    appId,
    theme,
    accent,
    firstPage,
    apkAction: options.apkAction
  });

  log.ok(`Project created at ${targetPath}`);

  if (options.noInstall) {
    log.warn('Skipping dependency install (--no-install).');
    if (options.signing) {
      log.warn('Signing skipped because dependencies were not installed.');
    }
    if (options.apkAction) {
      createAndroidReleaseWorkflow(targetPath);
      log.ok('GitHub Actions workflow added for Android release.');
    }
    if (options.gitInit) {
      initGitRepo(targetPath, options.gitRemote);
    }
    log.ok('Done.');
    log.info(`Next: cd ${targetDir} && npm install && npx cap sync`);
    return;
  }

  log.info('Installing dependencies...');

  try {
    execSync('npm install', { cwd: targetPath, stdio: 'inherit' });
    if (options.signing || options.apkAction) {
      ensureAndroidPlatform(targetPath);
    }
    execSync('npm run build', { cwd: targetPath, stdio: 'inherit' });
    execSync('npx cap sync', { cwd: targetPath, stdio: 'inherit' });
  } catch (err) {
    log.err('Install failed. You can run these manually:');
    log.err(`  cd ${targetDir}`);
    log.err('  npm install');
    log.err('  npm run build');
    log.err('  npx cap sync');
    process.exit(1);
  }

  if (options.signing) {
    generateAndroidSigning(targetPath, appName, appId);
  }

  if (options.apkAction) {
    createAndroidReleaseWorkflow(targetPath);
    log.ok('GitHub Actions workflow added for Android release.');
  }

  if (options.gitInit) {
    initGitRepo(targetPath, options.gitRemote);
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
      description: parsed.description,
      unattended: Boolean(parsed.yes),
      noInstall: Boolean(parsed['no-install']),
      signing: parsed.signing !== false,
      apkAction: Boolean(parsed['apk-action']),
      gitInit: Boolean(parsed['git-init']),
      gitRemote: parsed['git-remote']
    };

    await createApp(options);
    return;
  }

  log.err(`Unknown command: ${command}`);
  usage();
  process.exit(1);
};

main();
