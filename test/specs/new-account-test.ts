import { ImageCompare } from "./ImageCompare";

declare var browser;
declare var $;

describe('Browser test', () => {
    it('new Account page', async () => {
        // login
        await browser.url(`https://login.salesforce.com?un=${encodeURIComponent(process.env.SF_USERNAME)}&pw=${process.env.SF_PASSWORD}&startURL=${encodeURIComponent('/s.gif')}`);
        // get instance url
        const instanceUrl = await browser.execute(() => {
            return location.protocol + '//' + location.hostname;
        });
        await browser.pause(3e3);
        // open new account page
        await browser.url(`${instanceUrl}/lightning/o/Account/new`);
        await browser.pause(5e3);
        await browser.waitUntil(() => {
            return $('*[aria-required=true]') && $('.slds-modal__footer .uiButton--brand');
        });
        await browser.execute(() => {
            var nameEl = document.querySelectorAll(`*[aria-required=true]`)[0] as any;
            nameEl.value = 'Test Account';
            nameEl.dispatchEvent(new Event('change'));
            var saveBtnEl = document.querySelector(`.slds-modal__footer .uiButton--brand`) as any;
            saveBtnEl.click();
            return {};
        });
        await browser.pause(5e3);
        await ImageCompare.compare(browser, `account-save-end`);
    });
});
