
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/jobs', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://internshala.com/jobs/digital-marketing-jobs', {
      waitUntil: 'networkidle2',
    });

    const jobs = await page.evaluate(() => {
      const jobList = [];
      const jobCards = document.querySelectorAll('.individual_internship');

      jobCards.forEach(card => {
        const title = card.querySelector('.profile')?.innerText.trim();
        const location = card.querySelector('.location_link')?.innerText.trim();
        const stipendText = card.querySelector('.stipend')?.innerText.trim();
        const link = "https://internshala.com" + card.querySelector('a')?.getAttribute('href');

        const salaryMatch = stipendText?.match(/₹([0-9,]+)/);
        const stipend = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, '')) : 0;

        if (
          title && location && stipend && link &&
          /digital marketing/i.test(title) &&
          /(Chandigarh|Noida|Gurugram)/i.test(location) &&
          stipend >= 50000
        ) {
          jobList.push({ title, location, stipend, link });
        }
      });

      return jobList;
    });

    await browser.close();
    res.json({ jobs });
  } catch (error) {
    console.error("❌ Scraper Error:", error.message);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Internshala Job Scraper is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
