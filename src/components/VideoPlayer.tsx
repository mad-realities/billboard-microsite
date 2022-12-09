import MuxPlayer from "@mux/mux-player-react";
import React from "react";
import styles from "../styles/video.module.css";

interface Props {
  playback_id: string;
  metadata?: any;
}

export default function VideoPlayer({ playback_id, metadata }: Props) {
  return (
    <div className={styles.videoPlayer}>
      <MuxPlayer
        className={styles.muxPlayer}
        metadata={metadata}
        streamType="on-demand"
        style={{ "--controls": "none" } as any}
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
