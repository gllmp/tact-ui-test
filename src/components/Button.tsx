import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory, useParams } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useXebra } from "../hooks/xebra";
import { Scene } from "../scenes/typings";

import { playerState, sceneState } from "../state";
import styles from "../styles/buttons.module.css";

type ButtonProps = {
  color?: string;
  size?: string;
  description?: React.ReactNode;
  rounded?: boolean;
  uppercase?: boolean;
  bordered?: boolean;
  direction?: "row" | "column";
  disabled?: boolean;
};

const extractStyles = (props: ButtonProps, classNames: string | string[] = []) =>
  Object.entries(props)
    .filter(([key, value]) => {
      if (typeof value === "string" && value in styles) return true;
      if (value === true && key in styles) return true;
      return false;
    })
    .map(([key, value]) => (key in styles ? styles[key] : (value as string) in styles ? styles[value as string] : ""))
    .concat(classNames)
    .reverse()
    .join(" ");

const Button: React.FC<React.HTMLAttributes<HTMLButtonElement & HTMLDivElement> & ButtonProps> = ({
  onClick,
  description,
  rounded,
  color = "white",
  size = "normal",
  uppercase = false,
  bordered,
  direction = "row",
  children,
  ...btnProps
}) => {
  const Component = useCallback(
    () => (
      <button
        className={extractStyles({ rounded, color, size, uppercase, bordered }, styles.btn)}
        onClick={description || btnProps.disabled ? undefined : onClick}
        {...btnProps}
      >
        {children}
      </button>
    ),
    [bordered, description, children, color, onClick, rounded, size, uppercase, btnProps]
  );

  return description ? (
    <div
      style={{ flexDirection: direction }}
      className={styles.container}
      onClick={description && !btnProps.disabled ? onClick : undefined}
    >
      <Component />
      {description ? <p>{description}</p> : null}
    </div>
  ) : (
    <Component />
  );
};

export default Button;

export const HomeButton: typeof Button = ({ color = "transparent", onClick, children, ...props }) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();
  return (
    <Button color={color} onClick={onClick ? onClick : () => history.push(`/${scene}/confirm`)} {...props}>
      {children ?? <img src="/icon.home.png" className={styles.icon} />}
    </Button>
  );
};

export const RestartButton: typeof Button = ({ color = "transparent", onClick, children, ...props }) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();
  return (
    <Button color={color} onClick={onClick ? onClick : () => history.push(`/${scene}/refresh`)} {...props}>
      {children ?? <h1 style={{ padding: 0, margin: 0 }}>&#8635;</h1>}
    </Button>
  );
};

export const RecordButton: typeof Button = ({ color = "red", size = "normal", onClick, children, ...props }) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();

  return (
    <Button onClick={onClick ? onClick : () => history.push(`/${scene}/recorder`)} color={color} size={size} {...props}>
      {children}
    </Button>
  );
};

const InfoIcon: React.FC = () => <span style={{ fontSize: "1.65em", fontWeight: 600 }}>i</span>;

export const InfoButton: typeof Button = ({ color = "white", ...props }) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();

  return (
    <Button onClick={() => history.push(scene ? `/${scene}/info` : `/info`)} color={color} {...props}>
      <InfoIcon />
    </Button>
  );
};

export const ContinueButton: typeof Button = (props) => (
  <Button color="white" {...props}>
    <FormattedMessage id="btn.continue" />
  </Button>
);

export const CancelButton: typeof Button = (props) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Button rounded {...props}>
      &times;
    </Button>
    <p style={{ margin: 4 }}>
      <FormattedMessage id="btn.cancel" />
    </p>
  </div>
);

export const StopButton: typeof Button = (props) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();
  const setPlayer = useSetRecoilState(playerState);
  const onClick = useCallback(() => {
    setPlayer("stopped");
    history.push(`/${scene}/play`, { showIntro: false });
  }, [history, scene, setPlayer]);

  return (
    <Button rounded bordered color="transparent" onClick={onClick} {...props}>
      <div
        style={{
          margin: 0,
          width: 25,
          height: 25,
          background: "white",
        }}
      />
    </Button>
  );
};

export const MenuButton: typeof Button = (props) => {
  const history = useHistory();
  const { scene: creation = "" } = useParams<{ scene: string }>();
  const setPlayer = useSetRecoilState(playerState);
  const [{ name }, setScene] = useRecoilState(sceneState);
  const { sendMessage } = useXebra();
  const onClick = useCallback(() => {
    if (name) sendMessage("stop", { name: name === "credits" ? `credits-${creation}` : name });
    setPlayer("stopped");
    setScene({ name: "" } as Scene);
    history.push("/");
  }, [name, sendMessage, creation, setPlayer, setScene, history]);

  return (
    <Button color="transparent" onClick={onClick} {...props}>
      <img src="/icon-menu.png" style={{ width: "1.25rem", height: "1.25rem" }} alt="Menu" />
    </Button>
  );
};
