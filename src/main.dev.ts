/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import dbMigrate from 'db-migrate';
import { promises as fs } from 'fs';
import {
  app,
  ipcMain,
  BrowserWindow,
  shell,
  Menu,
  Tray,
  nativeImage,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import BabyOrm from './database/BabyOrm';
import NotificationManager from './notifications/NotificationManager';

app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--enable-logging');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tray = null;
let notificationManager: NotificationManager | null = null;
let dbConnection: unknown;
let babyOrm: BabyOrm;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const showWindow = async () => {
  if (mainWindow === null) await createWindow();
  if (mainWindow?.isMinimized) mainWindow.show();
  mainWindow?.focus();
};

const isDevelopment = process.env.NODE_ENV !== 'production';

app
  .whenReady()
  .then(async () => {
    const databaseJsonBuffer = await fs.readFile(
      path.join(__dirname, '../database/database.json')
    );

    const databaseJsonContent = databaseJsonBuffer.toString();
    const dbMigrateConfig = { ...JSON.parse(databaseJsonContent) };

    const dbName = isDevelopment ? 'wdilt-dev.db' : 'wdilt.db';
    const dbFilename = path.join(app.getPath('userData'), dbName);
    Object.assign(dbMigrateConfig, {
      prod: { driver: 'sqlite3', filename: dbFilename },
      dev: { driver: 'sqlite3', filename: dbFilename },
    });

    const migrator = dbMigrate.getInstance(true, {
      cmdOptions: {
        // eslint-disable-next-line promise/always-return
        env: isDevelopment ? 'dev' : 'prod',
        verbose: isDevelopment,
        'migrations-dir': path.join(__dirname, '../database/migrations'),
      },
      config: dbMigrateConfig,
    });

    migrator.up();

    dbConnection = require('better-sqlite3')(dbFilename, {
      verbose: console.log,
    });

    babyOrm = new BabyOrm(dbConnection);

    ipcMain.on('save', (event, payload) => {
      const item = babyOrm.save(payload);
      event.returnValue = item;
    });

    ipcMain.on('fetch', (event, payload) => {
      const items = babyOrm.fetch(payload);
      event.returnValue = items;
    });

    ipcMain.on('runRawSql', (event, sql) => {
      const items = babyOrm.runRawSql(sql);
      event.returnValue = items;
    });

    ipcMain.on('delete', (event, payload) => {
      const items = babyOrm.delete(payload);
      event.returnValue = items;
    });

    await createWindow();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        type: 'normal',
        click: () => app.quit(),
      },
    ]);

    const pathIcon = `${app.getAppPath()}/../assets/icons/icon_16@1x.png`;
    const image = nativeImage.createFromPath(pathIcon);

    image.setTemplateImage(true);
    tray = new Tray(image);
    tray.setToolTip('This is my app');
    tray.setContextMenu(contextMenu);

    notificationManager = new NotificationManager(async () => {
      await showWindow();
    });
    notificationManager.run();
  })
  .catch(log.error);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
