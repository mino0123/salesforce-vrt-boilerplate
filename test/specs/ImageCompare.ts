import * as path from "path";
import { outputFile } from "fs-extra";
import * as resemble from "node-resemble-js";
import { AssertionError } from "assert";

const BASEPATH = `./test/screenshots`;
const ACTUAL_BASE = `${BASEPATH}/actual`;
const EXPECTED_BASE = `${BASEPATH}/expected`;
const DIFF_BASE = `${BASEPATH}/actual`;

export class ImageCompare {
    static tolerance = 0.1;

    static async compare(browser, testname) {
        const actual = path.resolve(ACTUAL_BASE, testname);
        const expected = path.resolve(EXPECTED_BASE, testname);
        const diff = path.resolve(DIFF_BASE, testname);
        browser.saveScreenshot(actual);
        const compareData = await ImageCompare.compareFiles(actual, expected);
        await ImageCompare.writeDiffFile(compareData, diff);
        ImageCompare.assert(compareData, diff);
    }

    static async compareFiles(actual, expected) {
        return new Promise((resolve) => {
            const image = resemble(actual).compareTo(expected);
            image.onComplete((data) => {
                resolve(data);
            });
        });
    }

    static async writeDiffFile(compareData, filepath) {
        const image = compareData.getDiffImage().pack();
        return new Promise((resolve, reject) => {
            const chunks = [];
            image.on('data', function(chunk) {
                chunks.push(chunk);
            });
            image.on('end', () => {
                const buffer = Buffer.concat(chunks);
                Promise
                .resolve()
                .then(() => outputFile(filepath, buffer.toString('base64'), 'base64'))
                .then(() => resolve())
                .catch(reject);
            });
            image.on('error', (err) => reject(err));
        });
    }

    static async assert(compareData, diffPath) {
        const misMatchPercentage = Number(compareData.misMatchPercentage);
        if (misMatchPercentage > 0.1) {
            throw new AssertionError({message: `Screenshot is mismatch: ${diffPath}`});
        }
    }

}