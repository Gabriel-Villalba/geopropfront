# Configuration Guide

## Step 1: Update Target URL

Open `scraper.js` and find this line near the top:

```javascript
const TARGET_URL = 'https://example-realestate.com/properties';
```

Replace it with your actual real estate website URL.

## Step 2: Inspect the Website

1. Open your target website in a browser
2. Right-click on a property listing and select "Inspect" or "Inspect Element"
3. Identify the CSS selectors for the property container and data fields

## Step 3: Update CSS Selectors

In `scraper.js`, find the `page.$$eval()` section and update these selectors:

```javascript
// Main container for each property card
const properties = await page.$$eval('.property-card', (cards) => {
  // ^^^^^^^^^^^^^^^^^^ UPDATE THIS SELECTOR
```

Then update the individual field selectors inside the map function:

```javascript
// Property title selector
const title = getText('.property-title');
//                     ^^^^^^^^^^^^^^^ UPDATE THIS

// Property address selector
const address = getText('.property-address');
//                       ^^^^^^^^^^^^^^^^^ UPDATE THIS

// Property price selector
const priceText = getText('.property-price');
//                         ^^^^^^^^^^^^^^^ UPDATE THIS

// Property width selector (optional)
const widthText = getText('.property-width');
//                         ^^^^^^^^^^^^^^^ UPDATE THIS

// Property depth selector (optional)
const depthText = getText('.property-depth');
//                         ^^^^^^^^^^^^^^^ UPDATE THIS

// Property square meters selector (optional)
const sqmText = getText('.property-sqm');
//                       ^^^^^^^^^^^^^ UPDATE THIS
```

## Example: Real Website Selectors

Here's an example for a hypothetical real estate site:

### Before (placeholder):
```javascript
const properties = await page.$$eval('.property-card', (cards) => {
```

### After (real selectors):
```javascript
const properties = await page.$$eval('.listing-item', (cards) => {
```

### Field Selectors Example:

```javascript
// If the HTML looks like this:
// <div class="listing-item">
//   <h3 class="listing-title">Modern Apartment</h3>
//   <p class="listing-address">123 Main St</p>
//   <span class="price">$450,000</span>
//   <div class="dimensions">15m x 20m</div>
// </div>

// Then your selectors would be:
const title = getText('.listing-title');
const address = getText('.listing-address');
const priceText = getText('.price');
const dimensionsText = getText('.dimensions');
```

## Step 4: Test the Scraper

Run the scraper in standalone mode:

```bash
npm run scrape
```

Check the output in `data/properties.json` to verify the data is being extracted correctly.

## Step 5: Adjust Extraction Logic

If your website structure is different, you may need to adjust the extraction logic:

### For different price formats:
```javascript
// Current: Extracts any number from text
const priceEstimate = getNumber(priceText);

// If price is in a data attribute:
const priceEstimate = parseFloat(card.getAttribute('data-price'));
```

### For combined dimensions:
```javascript
// If dimensions are in format "15m x 20m"
const dimensionsText = getText('.dimensions');
const [widthStr, depthStr] = dimensionsText.split('x');
const width = getNumber(widthStr);
const depth = getNumber(depthStr);
```

### For direct square meters:
```javascript
// If square meters is directly available
const squareMeters = getNumber(getText('.area'));
```

## Common Issues

### Issue: No properties found
- Check if the page loaded completely
- Try adding a wait: `await page.waitForSelector('.property-card', { timeout: 5000 });`
- Verify the selector matches the actual HTML

### Issue: Some fields are null
- Check if the field exists on all property cards
- Use optional chaining or fallbacks for optional fields

### Issue: Numbers not extracted correctly
- Check the text format (e.g., "$450,000" vs "450000")
- Adjust the `getNumber()` function if needed

## Testing Tips

1. Start with a simple selector to get the property cards count
2. Add one field at a time and test
3. Check the browser console for errors
4. Use `page.screenshot()` for debugging if needed
