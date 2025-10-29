const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');

(async () => {
  // Launch a headless Chromium browser using the new headless mode
  const browser = await puppeteer.launch({ headless: 'new' });

  // Open a new page
  const page = await browser.newPage();

  // Navigate to a website
  await page.goto('https://google.com');

  // Get the page content
  const pageContent = await page.content();

  // Manipulate the page content (for example, replace "Example" with "My Page")
  const modifiedContent = pageContent.replace(/Example/g, 'My Page');

  // Save the modified content to a new HTML file
  fs.writeFileSync('my-page.html', modifiedContent);

  // Close the browser
  await browser.close();

  // Open the saved HTML file in Chrome using the "open" command
  const chromeCommand = `open -a "Google Chrome" my-page.html`;
  exec(chromeCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening Chrome: ${error}`);
    }
  });
})();
