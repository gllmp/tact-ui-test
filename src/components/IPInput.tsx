import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRange, isValidIPItemValue } from "../utils/number";
import styles from "../styles/input.module.css";

type IPInputProps = {
  className?: string;
  defaultValue?: string | string[];
  isError?: (ip: string) => boolean;
  onChange: (v: string) => void;
};
type IPEventHandler<T extends React.SyntheticEvent<HTMLInputElement>> = (e: T, i: number) => void;
const IPInput: React.FC<IPInputProps> = ({ className = "", defaultValue = "...", isError = () => false, onChange }) => {
  const [value, setValue] = useState<string[]>(Array(4).fill(""));
  const ip = useMemo(() => value.map((val) => (isNaN(+val) ? "" : val)).join("."), [value]);
  const isValid = useMemo(
    () =>
      value.filter((val) => val && val !== "").length === 4 &&
      value.map(Number).every((val) => !isNaN(val) && val >= 0 && val < 256),
    [value]
  );
  const classNames = useMemo(
    () => [styles["ip-input"], styles[className], isError(ip) ? styles["has-error"] : ""].join(" "),
    [ip, className, isError]
  );
  const ref = useRef<Record<string, HTMLInputElement | null>>({});

  const handleChange = useCallback<IPEventHandler<React.ChangeEvent<HTMLInputElement>>>(
    (e, i) => {
      let val = parseInt(e.target.value);
      if (typeof val !== "number" || val < 0) return setValue(Array(4).fill(""));
      if (val && isNaN(val)) return e.preventDefault();

      if (e.target.value !== "" && !isValidIPItemValue(val)) val = 255;
      const newValue = value.slice();
      newValue[i] = val.toFixed(0);
      setValue(newValue);

      if (!isNaN(val) && String(val).length === 3 && i < 3) ref.current[`_input-${i + 1}`]?.focus();
    },
    [value]
  );
  const handleKeyDown = useCallback<IPEventHandler<React.KeyboardEvent<HTMLInputElement>>>((e, i) => {
    let domId = i;
    if ((e.key === "ArrowLeft" || e.key === "Backspace") && getRange(e.currentTarget).end === 0 && i > 0) {
      domId = i - 1;
    }
    // User typed "→"
    if (e.key === "ArrowRight" && getRange(e.currentTarget).end === e.currentTarget.value.length && i < 3) {
      domId = i + 1;
    }
    // User typed "."
    if (e.key === ".") {
      e.preventDefault();
      if (i < 3) {
        domId = i + 1;
      }
    }
    ref.current[domId]?.focus();
  }, []);
  const handlePaste = useCallback<IPEventHandler<React.ClipboardEvent<HTMLInputElement>>>((e, i) => {
    if (!e.clipboardData || !e.clipboardData.getData) return;

    const pasteData = e.clipboardData.getData("text/plain");
    if (!pasteData) return;

    const newValue = pasteData.split(".").map((v) => parseInt(v));
    if (newValue.length !== 4 - i) return;
    if (!newValue.every(isValidIPItemValue)) return;

    setValue((oldValue) => {
      newValue.forEach((val, j) => {
        oldValue[i + j] = val.toFixed(0);
      });
      return oldValue;
    });
    return e.preventDefault();
  }, []);

  useEffect(() => {
    if (!Array.isArray(defaultValue)) setValue(defaultValue.split("."));
  }, [defaultValue]);

  useEffect(() => (isValid ? onChange(ip) : undefined), [ip, isValid, onChange]);

  return (
    <div className={classNames}>
      <p style={{ margin: "0 0 20px" }}>Websocket IP Adress</p>
      {value.map((val, i) => (
        <div className={styles["ip-input__item"]} key={i}>
          <input
            ref={(el) => (ref.current[`_input-${i}`] = el)}
            type="text"
            value={isNaN(+val) ? "" : val}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
          />
          {i !== 3 ? <i>.</i> : false}
        </div>
      ))}
    </div>
  );
};

export default IPInput;
