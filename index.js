import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

puppeteer.use(StealthPlugin());

module.exports = async function getProductPrice(pId, sizee, headlessOption = true) {
    (async () => {

        const productId = pId;
        const size = sizee;
        const user = 'lyes94370@hotmail.fr';
        const password = 'GPQ8hDFsY6@qN5ybpf9G#Mf$';

        const browser = await puppeteer.launch({
            headless: headlessOption,
            defaultViewport: false,
            args: ['--start-maximized'],
            userDataDir: './tmp',
            // args: [
            //     "--proxy-server=http://51.91.157.66:80"
            // ]
        });
        const page = await browser.newPage();
        try {
            console.log('**** going to the website..');
            await page.goto('https://sell.wethenew.com/fr', { waitUntil: 'networkidle2' });
            console.log('**** waiting for navigation..')
            await page.waitForNavigation();
            console.log('**** waiting for 5..');
            await page.waitForTimeout(2000);
            console.log('**** done..');
        } catch (e) {
            await page.screenshot({ path: 'result.png' });
        }

        try {
            console.log('**** waiting for cookies..');
            await page.waitForSelector('div.didomi-popup__dialog div#buttons');
            console.log('**** loaded...')
        } catch (e) { console.log('**** cookies did not load..'); }


        try {
            const cookiesModal = page.$('div.didomi-popup__dialog div#buttons');
            if (cookiesModal) {
                console.log('**** accepting cookies..');
                await page.waitForSelector("button#didomi-notice-agree-button");
                console.log('**** wait done..');
                const cookiesAcceptBtn = page.$("button#didomi-notice-agree-button");
                if (cookiesAcceptBtn) {
                    await page.waitForTimeout(3000);
                    const a = await page.evaluate(async function () {
                        await document.querySelector("button#didomi-notice-agree-button").click();
                    })
                    // await page.waitForTimeout(2000);
                    // await page.click("button#didomi-notice-agree-button");
                    console.log('**** waiting for navigation..');
                    await page.waitForNavigation();
                    await page.waitForTimeout(2000);
                }
            }
        } catch (e) { console.log('**** cookies not found..'); }

        try {
            await page.waitForSelector("li>a[href='/fr/login']");
            const loginBtn = page.$("li>a[href='/fr/login']");
            if (loginBtn) {
                await page.evaluate(async function () {
                    await document.querySelector("li>a[href='/fr/login']").click();
                })
                // await page.waitForTimeout(2000);
                // await page.click("li>a[href='/fr/login']");
                console.log('**** waiting for navigation..');
                await page.waitForNavigation();
                await page.waitForTimeout(2000);
            }
        } catch (e) { }

        try {
            await page.waitForSelector("input[data-testid='email-input']");
        } catch (e) { }

        const user_input = "input[data-testid='email-input']";
        const pass_input = "input[data-testid='password-input']";

        console.log('**** logging in to the website..');

        try {
            await page.type(user_input, user);
            await page.type(pass_input, password);
            await page.waitForTimeout(3000);
            await page.evaluate(async function () {
                if (document.querySelector("button[data-testid='submit-login-form-btn']")) {
                    await document.querySelector("button[data-testid='submit-login-form-btn']").click();
                }
            })
            // await page.click("button[data-testid='submit-login-form-btn']");
            // await page.waitForNavigation();
            await page.waitForTimeout(3000);
            console.log('**** logged in..');
        } catch (e) {
            console.log('**** ERROR WHILE LOGGING IN..', e);
            await page.screenshot({ path: 'result.png' });

        }

        try {
            await page.waitForSelector('button.OnboardingTemplate_Next__BxL_e');
        } catch (e) { }
        try {
            await page.waitForSelector('button[aria-label="redirection to login"]');
            const redirectToLogin = page.$('button[aria-label="redirection to login"]');
            if (redirectToLogin) {
                await page.waitForTimeout(2000);
                await page.click('button[aria-label="redirection to login"]');
                await page.waitForNavigation();
                await page.waitForTimeout(2000);
            }
        } catch (e) {
            console.log('**** ERROR WHILE CLICKING ON REDIRECTION BUTTON..');
            await page.screenshot({ path: 'result.png' });
        }

        try {
            console.log('**** looking for your product...');
            await page.waitForSelector("input[name='productSearch']");
            const searchBar = page.$("input[name='productSearch']");
            if (searchBar) {
                await page.type("input[name='productSearch']", productId);
                await page.waitForTimeout(2000);
            }
        } catch (e) {
            await page.screenshot({ path: 'result.png' });
            console.log('**** ERROR WHILE SEARCHING FOR THE PRODUCT..')
        }

        try {
            await page.waitForSelector("div.infinite-scroll-component div > img");
        }
        catch (e) {

        }
        try {
            const productMatch = page.$('div.infinite-scroll-component div > img');
            if (productMatch) {
                console.log('**** product found...');
                await page.waitForTimeout(3000);
                await page.evaluate(async function () {
                    await document.querySelector("div.infinite-scroll-component div > img").click();
                })
                // await page.click('div.infinite-scroll-component div > img');
                // await page.waitForNavigation();
                await page.waitForTimeout(2000);
            } else console.log('**** NO SUCH PRODUCT FOUND..');
        } catch (e) {
            console.log('**** ERROR WHILE CLICKING ON THE PRODUCT..', e);
            await page.screenshot({ path: 'result.png' });
        }

        try {
            await page.waitForSelector("section figure img");
            console.log('**** finding correct size...');
            // const variants = page.$$("section section ul > li");
            const price = await page.evaluate(async function (size) {
                const variants = document.querySelectorAll("section section ul > li");
                if (variants && variants.length) {
                    for (let i = 0; i < variants.length; i++) {
                        const variant = variants[i];
                        let productMatch = false;
                        if (variant.textContent.trim().toLowerCase() == size.trim().toLowerCase()) {
                            productMatch = true;
                            console.log('**** size found...');
                            await document.querySelectorAll("section section ul > li")[i].click();
                            console.log('**** clicked...waiting..');
                            await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                            console.log('**** wait over...');
                            price = document.querySelector("div.Content fieldset>p>span") && document.querySelector("div.Content fieldset>p>span").textContent && document.querySelector("div.Content fieldset>p>span").textContent.trim();
                            console.log('**** price', price);
                            return price;
                        }
                    }
                } else console.log('**** NO VARIANTS FOUND FOR THIS PRODUCT...');
            }, size);

            if (price) {
                console.log(`**** For Product ${productId} And Size ${size}:`)
                console.log('**** HERE IS THE PRICE:', price);
            } else console.log('**** COULD NOT RETRIVE PRICE..');

        } catch (e) { await page.screenshot({ path: 'result.png' }); }

        await page.screenshot({ path: 'result.png' });
        await browser.close();
    })()
}
