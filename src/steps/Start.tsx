import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory, useParams } from "react-router-dom";

import Overlay from "../components/Overlay";
import Controls from "../components/Controls";
import LogoIrcam from "../components/LogoIrcam";
import styles from "../styles/steps.module.css";
import { getScene } from "../scenes";

const StartStep: React.FC<{ onHide?: () => void }> = ({ onHide }) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();
  const { title } = getScene(scene);
  const startScene = useCallback(() => {
    if (typeof onHide === "function") onHide();
    history.push(`/${scene}/play`, { showIntro: true });
  }, [history, scene, onHide]);
  const headerElement = () => (
    <div style={{ width: "100%", textAlign: "center" }}>
      <LogoIrcam />
    </div>
  );

  return (
    <>
      <Overlay full closeOnClick onClose={startScene} header={headerElement}>
        <h1 className={styles.panorama}>{title}</h1>
        <img src="/finger.png" width="23%" />
      </Overlay>
      <Controls>
        <FormattedMessage id="start.btn" tagName="p" />
      </Controls>
    </>
  );
};

export default StartStep;
