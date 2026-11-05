import { getCodeChefProfile } from "../services/codechefService.js";
import { getGfgProfile } from "../services/gfgService.js";
import { getLeetCodeProfile } from "../services/leetcodeService.js";
import { getGitHubProfile } from "../services/githubService.js";
import { getCodeforcesProfile } from "../services/codeforcesService.js";





function createPlatformHandler(fetchProfile, platformName) {
  return async (req, res) => {
    try {
      const { handle } = req.params;
      const forceRefresh = req.query.force === "true";
      const profileData = await fetchProfile(handle, { forceRefresh });

      if (!profileData.success) {
        const isNotFound = profileData.error && profileData.error.toLowerCase().includes("not found");
        return res.status(isNotFound ? 404 : 400).json(profileData);
      }

      res.json(profileData);
    } catch (err) {
      console.error(`${platformName} profile retrieval error:`, err);
      res.status(500).json({ success: false, error: `Failed to fetch ${platformName} statistics.` });
    }
  };
}


export const getCodeChef = createPlatformHandler(getCodeChefProfile, "CodeChef");


export const getGfg = createPlatformHandler(getGfgProfile, "GeeksforGeeks");


export const getLeetCode = createPlatformHandler(getLeetCodeProfile, "LeetCode");


export const getGitHub = createPlatformHandler(getGitHubProfile, "GitHub");


export const getCodeforces = createPlatformHandler(getCodeforcesProfile, "Codeforces");
