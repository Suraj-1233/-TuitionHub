const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to login...');
  await page.goto('http://localhost:4200/auth/login');
  
  console.log('Typing mobile...');
  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', '7777777777');
  
  console.log('Clicking Get OTP...');
  await page.click('button.btn-primary');
  
  console.log('Waiting for OTP API...');
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Typing OTP...');
  await page.waitForSelector('input[placeholder*="OTP"]');
  // I need the OTP. I will just type a wrong one and see the error or grab it from the database... wait I can fetch from db
  
  await browser.close();
})();
