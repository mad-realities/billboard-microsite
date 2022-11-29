import { useEffect, useState } from "react";
import { InstagramEmbed } from "react-social-media-embed";

const ProfilePage = () => {
  return (
    <div className="align-center flex w-full flex-col items-center gap-10 py-8 text-white">
      <div className="w-11/12 bg-mr-sky-blue text-3xl">
        <InstagramEmbed url="https://www.instagram.com/dpromisel/" width={328} />
      </div>
    </div>
  );
};

export default ProfilePage;
