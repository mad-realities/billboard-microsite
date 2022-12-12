import Mixpanel from "mixpanel";

export const mixpanel = Mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN || "");
export const VOTED = "Voted";
