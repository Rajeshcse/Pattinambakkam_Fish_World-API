import express from 'express';
import FishProduct from '../models/FishProduct.js';

const router = express.Router();

/**
 * Generate HTML with Open Graph meta tags for social media sharing
 * This endpoint serves static HTML with OG tags when crawlers visit product links
 */
const generateOGHtml = (product, requestUrl) => {
  const productImage = product.images && product.images.length > 0 ? product.images[0] : '';
  const productUrl = requestUrl;
  const productDescription = product.description || `Fresh ${product.name} - Order now from Pattinambakkam Fish World`;
  const siteName = 'Pattinambakkam Fish World';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name} - ${siteName}</title>
  <meta name="description" content="${productDescription}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${productUrl}">
  <meta property="og:title" content="${product.name} - ${siteName}">
  <meta property="og:description" content="${productDescription}">
  <meta property="og:image" content="${productImage}">
  <meta property="og:image:secure_url" content="${productImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="INR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${productUrl}">
  <meta name="twitter:title" content="${product.name} - ${siteName}">
  <meta name="twitter:description" content="${productDescription}">
  <meta name="twitter:image" content="${productImage}">

  <!-- Redirect to React app for human visitors -->
  <meta http-equiv="refresh" content="0;url=${process.env.CLIENT_URL || 'http://localhost:5173'}/products/${product._id}">

  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(to bottom, #ecfeff, #ffffff);
    }
    .loading {
      text-align: center;
      padding: 2rem;
    }
    .loading h1 {
      color: #0891b2;
      margin-bottom: 1rem;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #0891b2;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <h1>${product.name}</h1>
    <div class="spinner"></div>
    <p>Redirecting to product page...</p>
  </div>

  <script>
    // Fallback redirect if meta refresh doesn't work
    setTimeout(() => {
      window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}/products/${product._id}';
    }, 100);
  </script>
</body>
</html>`;
};

/**
 * Check if the request is from a social media crawler
 */
const isCrawler = (userAgent) => {
  if (!userAgent) return false;

  const crawlers = [
    'facebookexternalhit',
    'WhatsApp',
    'Twitterbot',
    'LinkedInBot',
    'TelegramBot',
    'Slackbot',
    'Pinterest',
    'Discordbot',
    'SkypeUriPreview',
  ];

  return crawlers.some(crawler =>
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
};

/**
 * GET /og/products/:id
 * Serves HTML with OG tags for social media crawlers
 * Redirects regular users to React app
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userAgent = req.headers['user-agent'] || '';

    // Fetch product
    const product = await FishProduct.findById(id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Get the full URL of the current request
    const protocol = req.protocol;
    const host = req.get('host');
    const requestUrl = `${protocol}://${host}${req.originalUrl}`;

    // If it's a crawler, serve HTML with OG tags
    if (isCrawler(userAgent)) {
      const html = generateOGHtml(product, requestUrl);
      return res.send(html);
    }

    // For regular users, redirect to React app
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/products/${product._id}`);

  } catch (error) {
    console.error('Error serving OG tags:', error);
    res.status(500).send('Server error');
  }
});

export default router;
