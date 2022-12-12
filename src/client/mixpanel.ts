import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN || "", { debug: process.env.NODE_ENV === "development" });
export const mixpanelClient = mixpanel;

export const VISITED_HOME = "Visited home";
export const VISITED_LEADERBOARD = "Visited leaderboard";
export const VISITED_NOMINATE = "Visited nominate";
export const VISITED_CHECK_RANK = "Visited check rank";
export const VISITED_MAP = "Visited map";
export const CLICKED_VOTE = "Clicked vote";
export const CLICKED_SHARE = "Clicked share";
export const VISITED_PROFILE = "Visited profile";
export const VOTED = "Voted";
export const SCROLLED_LEADERBOARD = "Scrolled leaderboard";
export const VISITED_MR = "Visited mad realities";
