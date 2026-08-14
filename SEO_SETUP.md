# Hilltop Prayer & Evangelical Ministry — SEO & Google Setup

## Implemented in the site

- Search-friendly page title and meta description
- Canonical URL
- Open Graph and Twitter metadata
- `robots.txt` with `/admin` excluded
- XML sitemap
- `Church` JSON-LD structured data
- Church name, address, telephone and Google Maps destination in structured data
- Local service area references for Ipaja, Iyana Ipaja, Egbeda, Abule Egba, Alimosho and Lagos
- Homepage semantic H1/H2 fallback content for crawlers that cannot execute JavaScript
- Google Analytics 4 integration hook
- Google Search Console verification hook
- Bing Webmaster verification hook

## Current public URL

`https://hilltop-prayer-evangelical-ministry.vercel.app/`

When a custom domain is purchased, update the canonical URL, Open Graph URL, sitemap and JSON-LD URLs to the custom domain.

## Google Search Console

1. Open Google Search Console.
2. Add the site's URL property.
3. Verify the site using the HTML verification token.
4. Add the token to Vercel as:

`VITE_GOOGLE_SITE_VERIFICATION`

5. Redeploy the site.
6. Submit:

`/sitemap.xml`

## Google Analytics 4

Create a GA4 web data stream and copy the Measurement ID (`G-XXXXXXXXXX`). Add it to Vercel as:

`VITE_GA_MEASUREMENT_ID`

The site already contains the Analytics integration and will load GA4 only when the variable is present.

## Bing Webmaster Tools

Verify the site in Bing Webmaster Tools and add the verification token to Vercel as:

`VITE_BING_SITE_VERIFICATION`

Then submit `/sitemap.xml`.

## Google Business Profile

Create or claim the ministry's Google Business Profile using the real business information:

**Hilltop Prayer & Evangelical Ministry**  
**3 Kola Ojedeji Street, Ipaja, Lagos State, Nigeria**

Use the same name, address and phone number shown on the website. Add the website URL and the correct church/ministry category, then complete Google's verification process.

## Location

Primary address:

**3 Kola Ojedeji Street, Ipaja, Lagos State, Nigeria**

Google Maps destination:

`https://www.google.com/maps/search/?api=1&query=3+Kola+Ojedeji+Street,+Ipaja,+Lagos,+Nigeria`

## Service information

Current published schedule includes the 2nd and 3rd Saturdays for the prayer meeting, 5:30 PM–8:00 PM. Keep this information synchronized with the real ministry schedule whenever it changes.
