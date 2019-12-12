require('dotenv').config();
const WdioScreenshot = require('wdio-screenshot-v5');

// const { readdirSync, renameSync } = require(`fs`);

const capabilities = [];

if (process.env.BROWSER === 'edge') {
    capabilities.push({ browserName: "MicrosoftEdge", platformName: "WINDOWS", "ms:inPrivate": true });
} else if (process.env.BROWSER) {
    capabilities.push({ browserName: process.env.BROWSER });
} else {
    capabilities.push({ browserName: 'chrome' });
    capabilities.push({ browserName: 'firefox' });
}

exports.config = {
    runner: 'local',
    specs: [
        './test/specs/**/*-test.ts'
    ],
    exclude: [
    ],
    maxInstances: 1,
    capabilities: capabilities,
    logLevel: 'error',
    specFileRetries: 1,
    waitforTimeout: 10000,
    services: ['selenium-standalone', 'iedriver', [WdioScreenshot]],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    before: function (capabilities, specs) {
        require('ts-node').register({ files: true });
    }
}
