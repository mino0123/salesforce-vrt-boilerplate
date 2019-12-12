import { ImageCompare } from "./ImageCompare";

declare var browser;
declare var $;
declare var $A;

async function waitPageLoaded() {
    await browser.executeAsync((done) => {
        $A.eventService.addHandlerOnce({
            handler: () => {
                done();
            },
            event: "force:pageLoaded"
        });
    });
}

describe('Browser test', () => {
    it('new Account page', async () => {
        // login
        await browser.url(`https://login.salesforce.com?un=${encodeURIComponent(process.env.SF_USERNAME)}&pw=${process.env.SF_PASSWORD}&startURL=${encodeURIComponent('/s.gif')}`);
        // get instance url
        const instanceUrl = await browser.execute(() => {
            return location.protocol + '//' + location.hostname;
        });
        await browser.pause(3e3);
        await browser.saveDocumentScreenshot(`./test/screenshots/1_${browser.capabilities.browserName}.png`);
        // open new account page
        await browser.url(`${instanceUrl}/lightning/o/Account/new`);
        await browser.pause(15e3);
        await browser.saveDocumentScreenshot(`./test/screenshots/2_${browser.capabilities.browserName}.png`);
        await browser.waitUntil(() => {
            return $('*[aria-required=true]') && $('.slds-modal .uiButton--brand');
        });
        await browser.saveDocumentScreenshot(`./test/screenshots/2.png`);
        await browser.execute(() => {
            var nameEl = document.querySelectorAll(`*[aria-required=true]`)[0] as any;
            nameEl.value = 'Test Account';
            nameEl.dispatchEvent(new Event('change'));
            var saveBtnEl = document.querySelector(`.slds-modal .uiButton--brand`) as any;
            saveBtnEl.click();
            return {};
        });
        await waitPageLoaded();
        await browser.pause(5e3);// 結局pageLoadedだと早すぎた。
        await ImageCompare.compare(browser, `account-save-end`);
    });
});
