import React, { useState } from "react";
import { useInterval } from "react-use";
import { StopButton } from "./Button";
import Controls from "./Controls";
import LogoIrcam from "./LogoIrcam";
import styles from "../styles/controls.module.css";

const ProgressBar: React.FC<{ duration: number }> = ({ duration }) => {
  const [progress, setProgress] = useState(duration / 1000);
  useInterval(
    () => {
      setProgress((current) => Math.max(current - 1, 0));
    },
    progress >= duration ? null : 1000
  );

  return (
    <Controls>
      <LogoIrcam />
      <span className={styles.progress}>
        <h3>{`0:${progress.toFixed(0).padStart(2, "0")}`}</h3>
      </span>
      <StopButton />
    </Controls>
  );
};

export default ProgressBar;
