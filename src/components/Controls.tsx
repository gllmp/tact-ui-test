import React, { useMemo } from "react";
import { InfoButton, RecordButton, MenuButton, RestartButton } from "./Button";
import styles from "../styles/controls.module.css";
import { useLocation } from "react-router-dom";

const Controls: React.FC = ({ children }) => {
  const location = useLocation();
  const disabled = useMemo(() => location.pathname === "/", [location]);
  return (
    <div className={styles.controls}>
      {children ?? (
        <>
          <InfoButton bordered rounded direction="column" description="INFO" />
          <MenuButton bordered rounded direction="column" description="MENU" />
          <RestartButton disabled={disabled} bordered rounded direction="column" description="RESET" />
          <RecordButton disabled bordered rounded direction="column" description="REC" />
        </>
      )}
    </div>
  );
};

export default Controls;

export const VerticalSeparator: React.FC<React.CSSProperties> = ({ width = 1, color = "white" }) => (
  <div
    style={{
      width,
      height: "150%",
      margin: 0,
      marginLeft: 30,
      backgroundColor: color,
    }}
  />
);

export const HorizontalSeparator: React.FC<React.CSSProperties> = ({ height = 1, color = "white" }) => (
  <div
    style={{
      width: "100%",
      height,
      margin: "1em 0",
      backgroundColor: color,
    }}
  />
);
