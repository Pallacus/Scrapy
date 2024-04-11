const playwright = require('playwright');
const axios = require('axios').default;
const fs = require('node:fs/promises');

(async () => {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://amazon.es');

    // hacer click en las cookies
    await page.waitForSelector('#sp-cc-rejectall-link')
    await page.click('#sp-cc-rejectall-link');

    //await page.waitForSelector('#twotabsearchtextbox')    //
    await page.getByLabel('Buscar Amazon.es').fill('rubik speed');

    await page.waitForTimeout(500);
    await page.click('#nav-search-submit-button');

    await page.waitForTimeout(1000);

    const enlaces = await page.evaluate(() => {
        //Dentro de la consola del navegador
        const arr = document.querySelectorAll('[data-component-type="s-search-result"] h2 a');

        const enlaces = []
        for (let a of arr) {
            enlaces.push(a.href);
        }
        return enlaces
    })

    //  Navego a todas las pàginas de los productos
    for (let enlace of enlaces) {
        await page.goto(enlace);
        await page.waitForTimeout(500);

        /* const title = await page.evaluate(() => {
            return document.querySelector('#productTitle').innerText;
        }) */
        const title = await page.evaluate(() => document.querySelector('#productTitle').innerText);
        const src = await page.evaluate(() => document.querySelector('#landingImage').src);

        await downloadImage(src, title);
    }

})();

async function downloadImage(url, filename) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const fileData = Buffer.from(response.data, 'binary');
        await fs.writeFile(`./images/${filename}.jpg`, fileData);
        console.log('JPG file saved!');
    } catch (err) {
        console.error(err);
    }
}


/* 
amazon.es
Input búsqueda: twotabsearchtextbox
botón búsqueda: nav-search-submit-button
*/