import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";

import { isRecording, playerState, recorderState } from "../state";
import { uploadVideo } from "../utils/upload";
import styles from "../styles/controls.module.css";
import { timer } from "rxjs";
import { useXebra } from "../hooks/xebra";

const Recorder: React.FC<{
  duration?: number;
}> = ({ duration = 15e3 }) => {
  const params = useParams<{ id: string; scene: string }>();
  const history = useHistory();
  const { sendMessage } = useXebra();

  const recording = useRecoilValue(isRecording);
  const setPlayer = useSetRecoilState(playerState);
  const setIsReady = useSetRecoilState(recorderState);

  useEffect(() => {
    const { id, scene } = params;
    if (!recording || !id || !scene) return undefined;
    sendMessage("record", { scene, id, duration });
    const sub = timer(duration).subscribe(() => {
      setPlayer("stopped");
      const canvas = document.getElementById("foreground") as HTMLCanvasElement;
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        uploadVideo(id, blob as Blob)
          .then(() => setIsReady({ [id]: true }))
          .catch(console.error)
          .finally(() => history.push(`/${scene}/share/${id}`));
      }, "image/png");
    });
    return () => sub.unsubscribe();
  }, [duration, history, params, recording, setIsReady, setPlayer, sendMessage]);

  return recording ? <div className={styles.recIcon}>REC</div> : null;
};

export default Recorder;
