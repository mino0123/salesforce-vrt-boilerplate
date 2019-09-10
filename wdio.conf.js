require('dotenv').config();
const WdioScreenshot = require('wdio-screenshot-v5');

exports.config = {
    runner: 'local',
    specs: [
        './test/specs/**/*-test.ts'
    ],
    exclude: [
    ],
    capabilities: [{
        browserName: 'chrome',
    }, {
        browserName: 'firefox'
    }],
    logLevel: 'error',
    specFileRetries: 2,
    waitforTimeout: 10000,
    services: ['selenium-standalone', [WdioScreenshot]],
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
