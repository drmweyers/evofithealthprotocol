const { chromium } = require("playwright");

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log("1. Opening application...");
  await page.goto("http://localhost:3501");
  await page.screenshot({ path: "test-1-home.png" });
  
  console.log("2. Logging in...");
  await page.fill("input[name=email]", "trainer.test@evofitmeals.com");
  await page.fill("input[name=password]", "TestTrainer123!");
  await page.click("button[type=submit]");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "test-2-loggedin.png" });
  
  console.log("3. Testing XSS protection...");
  const input = page.locator("input").first();
  await input.fill("<script>alert(\"XSS\")</script>");
  const value = await input.inputValue();
  console.log("XSS test result:", value);
  await page.screenshot({ path: "test-3-xss.png" });
  
  console.log("Done!");
  await browser.close();
}

test().catch(console.error);
