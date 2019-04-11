import * as path from "path";
import { outputFile } from "fs-extra";
import * as resemble from "node-resemble-js";
import { AssertionError } from "assert";

const BASEPATH = `./test/screenshots`;
const ACTUAL_BASE = `${BASEPATH}/actual`;
const EXPECTED_BASE = `${BASEPATH}/expected`;
const DIFF_BASE = `${BASEPATH}/diff`;

export class ImageCompare {
    static tolerance = 0.1;

    static async compare(browser, testname) {
        const browserName = browser.capabilities.browserName;
        const filename = `${testname}_${browserName}.png`;
        const actual = path.resolve(ACTUAL_BASE, filename);
        const expected = path.resolve(EXPECTED_BASE, filename);
        const diff = path.resolve(DIFF_BASE, filename);
        
        await browser.saveDocumentScreenshot(actual);
        const compareData = await ImageCompare.compareFiles(actual, expected);
        await ImageCompare.writeDiffFile(compareData, diff);
        ImageCompare.assert(compareData, diff);
    }

    static async compareFiles(actual, expected) {
        return await new Promise((resolve) => {
            const image = resemble(actual).compareTo(expected);
            image.onComplete((data) => {
                resolve(data);
            });
        });
    }

    static async writeDiffFile(compareData, filepath) {
        const image = compareData.getDiffImage().pack();
        return await new Promise((resolve, reject) => {
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
        if (misMatchPercentage > ImageCompare.tolerance) {
            throw new AssertionError({message: `Screenshot is mismatch ${misMatchPercentage}% : ${diffPath}`});
        }
    }

}
