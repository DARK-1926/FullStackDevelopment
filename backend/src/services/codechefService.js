





const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};





export function isValidHandle(handle) {
  if (!handle || typeof handle !== "string") return false;
  const trimmed = handle.trim();
  return /^[a-zA-Z0-9_.]{2,35}$/.test(trimmed);
}




function parseCodeChefHtml(html, handle) {

  const ratingMatch =
    html.match(/class="[^"]*rating-number[^"]*"[^>]*>\s*([0-9]+)/i) ||
    html.match(/<div class="rating-header[^"]*">[\s\S]*?([0-9]{3,4})/i) ||
    html.match(/var\s+current_user_rating\s*=\s*([0-9]+)/i);
  const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;


  const divMatch = html.match(/\((Div\s*[0-9]+)\)/i);
  const division = divMatch ? divMatch[1] : null;


  const highestRatingMatch =
    html.match(/Highest Rating\s*([0-9]+)/i) ||
    html.match(/highest[-_]rating[^>]*>\s*([0-9]+)/i);
  const highestRating = highestRatingMatch
    ? parseInt(highestRatingMatch[1], 10)
    : null;


  const starMatches = html.match(/class="rating-star">([\s\S]*?)<\/div>/);
  let starsCount = 0;
  if (starMatches) {
    starsCount = (starMatches[1].match(/&#9733;|★/g) || []).length;
  } else {
    const starText = html.match(/([1-7])\s*★/) || html.match(/([1-7])\s*star/i);
    if (starText) starsCount = parseInt(starText[1], 10);
  }
  const stars = starsCount > 0 ? `${starsCount}★` : "—";


  const globalRankMatch = html.match(
    /<a href="\/ratings\/all">[\s\S]*?<strong>\s*([0-9]+|Inactive)\s*<\/strong>[\s\S]*?Global Rank/i
  );
  const countryRankMatch = html.match(
    /<a href="\/ratings\/all\?filterBy=Country[^"]*">[\s\S]*?<strong>\s*([0-9]+|Inactive)\s*<\/strong>[\s\S]*?Country Rank/i
  );
  const globalRank = globalRankMatch ? globalRankMatch[1].trim() : "—";
  const countryRank = countryRankMatch ? countryRankMatch[1].trim() : "—";


  const fullySolvedMatch =
    html.match(/Fully Solved\s*\(([0-9]+)\)/i) ||
    html.match(/Total Problems Solved:\s*([0-9]+)/i) ||
    html.match(/<h3>Total Problems Solved:\s*([0-9]+)<\/h3>/i) ||
    html.match(/problems-solved[^>]*>[\s\S]*?([0-9]+)/i);
  const problemsSolved = fullySolvedMatch
    ? parseInt(fullySolvedMatch[1], 10)
    : null;


  const nameMatch =
    html.match(/<h1 class="h2-style"[^>]*>([^<]+)<\/h1>/) ||
    html.match(/class="user-details-container[^"]*">[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/);
  const name = nameMatch ? nameMatch[1].trim() : handle;


  const countryMatch = html.match(/<span class="user-country-name">([^<]+)<\/span>/);
  const country = countryMatch ? countryMatch[1].trim() : "";

  return {
    success: true,
    handle,
    name,
    rating,
    highestRating,
    stars,
    starsCount,
    division,
    globalRank,
    countryRank,
    problemsSolved,
    country,
    profileUrl: `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
    updatedAt: new Date().toISOString(),
  };
}





export async function getCodeChefProfile(handle, options = {}) {
  const { forceRefresh = false } = options;

  if (!isValidHandle(handle)) {
    return {
      success: false,
      error: "Invalid CodeChef handle format. Handles must be 2-35 alphanumeric characters, underscores, or dots.",
    };
  }

  const normalizedHandle = handle.trim().toLowerCase();
  const now = Date.now();


  if (!forceRefresh && cache.has(normalizedHandle)) {
    const cached = cache.get(normalizedHandle);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, cached: true };
    }
  }

  const url = `https://www.codechef.com/users/${encodeURIComponent(normalizedHandle)}`;

  try {
    let response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });


    if (response.status === 429) {
      if (cache.has(normalizedHandle)) {
        return {
          ...cache.get(normalizedHandle).data,
          cached: true,
          warning: "CodeChef rate limited. Displaying cached data.",
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      response = await fetch(url, {
        headers: BROWSER_HEADERS,
        redirect: "follow",
      });
    }


    if (response.url === "https://www.codechef.com/" || response.status === 404) {
      return {
        success: false,
        error: `User "${handle}" not found on CodeChef.`,
      };
    }

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: "CodeChef is temporarily rate limiting requests. Please retry in a few moments.",
        };
      }
      return {
        success: false,
        error: `CodeChef returned HTTP status ${response.status}.`,
      };
    }

    const html = await response.text();


    if (!html.includes("user-details-container")) {
      if (html.includes("challenge") || html.includes("Just a moment...")) {
        if (cache.has(normalizedHandle)) {
          return {
            ...cache.get(normalizedHandle).data,
            cached: true,
            warning: "CodeChef bot protection active. Displaying cached data.",
          };
        }
        return {
          success: false,
          error: "CodeChef bot protection intercepted the request. Please retry shortly.",
        };
      }
      return {
        success: false,
        error: `Unable to locate profile details for "${handle}".`,
      };
    }

    const data = parseCodeChefHtml(html, handle);
    cache.set(normalizedHandle, { timestamp: now, data });

    return data;
  } catch (error) {
    if (cache.has(normalizedHandle)) {
      return {
        ...cache.get(normalizedHandle).data,
        cached: true,
        warning: `Network failed: ${error.message}. Displaying cached data.`,
      };
    }
    return {
      success: false,
      error: `Network error reaching CodeChef: ${error.message}`,
    };
  }
}
