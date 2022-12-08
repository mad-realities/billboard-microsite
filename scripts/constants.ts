export const SUCCESSFUL_VOTE_RESPONSE = (handle: string) =>
  `SUCCESS! Thanks for exercising your civic duty in the Mad Realities Universe by casting your vote. You can see the rank of the username you nominated or voted for by clicking the link below. Share and rack up as many votes as you can to get to #1! https://billboard.madrealities.xyz/profile/${handle}`;

export const ANOTHER_SUCCESSFUL_VOTE_RESPONSE = (handle: string) =>
  `SUCCESS! You also voted for ${handle}. You can see the rank of their username by clicking the link below. https://billboard.madrealities.xyz/profile/${handle}`;

export const BAD_VOTE_RESPONSE = () =>
  `Oops! That didn't work... If you're trying to vote for an existing candidate or nominate a new one, use the format below:\n\nVOTE: [insert IG username]\n\nText "3" for help voting.`;

export const TOO_LATE_RESPONSE = () =>
  `Oops! Voting has closed. Follow us on IG for more opportunities to get Mad Famous in the near future  https://www.instagram.com/madrealities/`;

// 1pm est dec 7th
export const BILLBOARD_END_TIME = new Date("2022-12-07T18:00:00.000Z");
