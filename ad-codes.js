// ============================================================================
// AD CODES: paste your AdSense code here, once.
// Every article page reads this file, so you never need to edit the pages.
// ============================================================================

// 1. Your AdSense publisher ID (starts with "ca-pub-").
//    Used to load the AdSense script on article pages.
//    Example: "ca-pub-1234567890123456"
export const ADSENSE_CLIENT = "ca-pub-4229724093840415";

// 2. The square ad. In AdSense, create a square ad unit (300x300 or 250x250)
//    and paste its full code between the backticks, for example:
//    export const SQUARE_AD = `<ins class="adsbygoogle" ...></ins>`;
//    Leave it empty ("") and articles stay exactly as they are now.
//    Keep data-ad-format="rectangle" and data-full-width-responsive="false":
//    the box has a fixed reserved size (.ad-square in style.css), and "auto" /
//    full-width ads change height on phones and push the article text down.
//    After changing this, run node _tools/build-site.mjs (the build writes the
//    box into every article).
export const SQUARE_AD = `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4229724093840415"
     data-ad-slot="1944569184"
     data-ad-format="rectangle"
     data-full-width-responsive="false"></ins>`;
