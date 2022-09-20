import { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { RecoilState, useRecoilState, useRecoilValue } from "recoil";
import { filter, fromEvent, of, Subscription, takeUntil, timer } from "rxjs";
import { useXebra } from "../hooks/xebra";
import { getScene } from "../scenes";
import { Scene } from "../scenes/typings";
import { isPlaying, sceneState } from "../state";
import { fade$ } from "../utils/time";

import styles from "../styles/steps.module.css";

const isDev = false;
// const isDev = process.env.NODE_ENV !== "production";

const next$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  filter((event) => event.altKey && event.ctrlKey),
  filter((event) => event.key === "n")
);

const fader = (out: number, complete: () => void): Subscription => {
  const canvas = document.getElementById("foreground") as HTMLCanvasElement;
  return (!canvas || !out ? of(0) : fade$(out)).subscribe({
    next: (alpha) => (canvas.style.opacity = (1 - alpha).toString()),
    complete,
  });
};

const useDelayedRecoilState = (state: RecoilState<Scene>) => {
  const [value, dispatch] = useRecoilState(state);
  const delayedDispatch: typeof dispatch = (nextVal) => fader(value.transitionOut ?? 0, () => dispatch(nextVal));
  return [value, delayedDispatch] as const;
};

const NextButton: React.FC = () => {
  const history = useHistory();
  const { scene: creation = "" } = useParams<{ scene: string }>();
  const { sendMessage } = useXebra();

  const [show, setShow] = useState(isDev);
  const [current, next] = useDelayedRecoilState(sceneState);
  const playing = useRecoilValue(isPlaying);
  const { name, transitionOut = 0, duration, next: imNext } = useMemo(() => current, [current]);

  const handleClick = useCallback(() => {
    setShow(isDev);
    if (name) sendMessage("stop", { name: name === "credits" ? `credits-${creation}` : name });

    if (name === "panorama01") fader(transitionOut, () => history.push("/"));
    else if (imNext) next(getScene(imNext));
    else history.push("/");
  }, [history, name, creation, sendMessage, imNext, transitionOut, next]);

  useEffect(() => {
    setShow(isDev);
    if (!playing) return undefined;
    const sub = timer(duration * 1000)
      .pipe(takeUntil(next$))
      .subscribe(() => {
        if (name === "credits") history.push("/");
        else setShow(true);
      });
    return () => sub.unsubscribe();
  }, [playing, name, duration, history]);

  return show ? (
    <button onClick={handleClick} className={styles.nextBtn}>
      NEXT &#8680;
    </button>
  ) : null;
};

export default NextButton;
