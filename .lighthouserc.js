module.exports = {
  ci: {
    collect: {
      url: [
        'https://www.mymedspharmacyinc.com/',
        'https://www.mymedspharmacyinc.com/shop',
        'https://www.mymedspharmacyinc.com/services',
        'https://www.mymedspharmacyinc.com/about',
        'https://www.mymedspharmacyinc.com/contact'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        preset: 'desktop'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};




