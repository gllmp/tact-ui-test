import React from "react";
import { useRecoilState } from "recoil";
import { webSocketState, parametersState } from "../state";

import styles from "../styles/controls.module.css";
import IPInput from "./IPInput";

const InputRange: React.FC<{
  id: string;
  label?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  unit?: "px" | "%" | "s";
  onChange: (v: number) => void;
}> = ({ id, label = id, unit = "%", step = 1, min = 0, max = 1, value, onChange }) => (
  <div className={styles.parameter}>
    <label htmlFor={id}>
      <p>{label}</p>
      <input
        type="range"
        id={id}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <p style={{ paddingTop: -4 }}>
        {value * (unit === "%" ? 100 : 1)}
        {unit}
      </p>
    </label>
  </div>
);

const Parameters: React.FC = () => {
  const [parameters, dispatch] = useRecoilState(parametersState);
  const [websocketAddress, update] = useRecoilState(webSocketState);
  return (
    <div className={`${styles.controls} ${styles.parameters}`}>
      <IPInput defaultValue={websocketAddress} className={styles.parameter} onChange={update} />
      {/* <ImageSelector /> */}
      <InputRange
        id="radius"
        min={1}
        max={Math.floor(innerWidth * 0.1)}
        unit="px"
        value={parameters.radius as number}
        onChange={(radius) => dispatch({ ...parameters, radius })}
      />
      <InputRange
        id="hardness"
        step={0.01}
        value={parameters.hardness as number}
        onChange={(hardness) => dispatch({ ...parameters, hardness })}
      />
      <InputRange
        id="alpha"
        step={0.01}
        value={parameters.alpha as number}
        onChange={(alpha) => dispatch({ ...parameters, alpha })}
      />
    </div>
  );
};

export default Parameters;
