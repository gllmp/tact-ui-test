import { useEffect, useState } from "react";

interface HTML5CanvasElement extends HTMLCanvasElement {
  captureStream(fps?: number): MediaStream;
}

export const useRecorder = (canvas: HTMLCanvasElement): MediaRecorder => {
  const [recorder, setRecorder] = useState<MediaRecorder>();

  useEffect(() => {
    if (recorder) return undefined;
    const [video] = (canvas as HTML5CanvasElement).captureStream(30).getTracks();
    const buildRecorder = async (constraints = { width: 1920, height: 1080 }) => {
      const [audio = []] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => stream.getAudioTracks()),
        video.applyConstraints(constraints),
      ]).catch(() => []);
      const stream = new MediaStream([video, ...audio]);
      return new MediaRecorder(stream);
    };
    buildRecorder().then(setRecorder);
    return () => {
      if (!recorder) return undefined;
      const r = recorder as MediaRecorder;
      r.state !== "inactive" && r.stop();
    };
  }, [canvas, recorder, setRecorder]);

  return recorder as MediaRecorder;
};
