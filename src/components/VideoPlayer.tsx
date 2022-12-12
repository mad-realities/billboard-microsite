import MuxPlayer from "@mux/mux-player-react";
import React from "react";
import styles from "../styles/video.module.css";

interface Props {
  playback_id: string;
}

export default function VideoPlayer({ playback_id }: Props) {
  return (
    <div className={styles.videoPlayer}>
      <MuxPlayer
        className={styles.muxPlayer}
        streamType="on-demand"
        primary-color="#FF1F8C"
        secondary-color="#090037"
        playbackId={playback_id}
        autoPlay
        muted
        loop
      />
    </div>
  );
}
