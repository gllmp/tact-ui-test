import React, { useCallback, useEffect, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useLocation, useParams } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";

import Overlay, { SlotComponent } from "../components/Overlay";
import { InfoButton } from "../components/Button";
import Controls from "../components/Controls";
import { playerState, sceneState } from "../state";
import styles from "../styles/steps.module.css";
import { useXebra } from "../hooks/xebra";

const PlayStep: React.FC<{ onHide?: () => void }> = ({ onHide }) => {
  const location = useLocation<{ showIntro: boolean }>();
  const { scene: creation } = useParams<{ scene: string }>();
  const { sendMessage } = useXebra();
  const [player, setPlayer] = useRecoilState(playerState);
  const scene = useRecoilValue(sceneState);
  const { showIntro } = useMemo(
    () => (player === "stopped" && location.state) || { showIntro: false },
    [location.state, player]
  );

  const onClose = useCallback(() => {
    if (typeof onHide === "function") onHide();
    setPlayer("playing");
  }, [setPlayer, onHide]);

  const footerElement = useCallback<SlotComponent>(
    () => (
      <span style={{ width: "100%" }}>
        <InfoButton rounded />
      </span>
    ),
    []
  );

  useEffect(() => {
    if (!showIntro && player === "stopped") setPlayer("playing");
  }, [showIntro, player, setPlayer]);

  useEffect(() => {
    if (player === "playing") {
      const { name, duration, transitionIn, transitionOut } = scene;
      if (name)
        sendMessage("begin", {
          name: name === "credits" ? `credits-${creation}` : name,
          duration,
          transitionIn: typeof transitionIn === "number" ? transitionIn / 1000 : 0,
          transitionOut: typeof transitionOut === "number" ? transitionOut / 1000 : 0,
        });
    }
  }, [player, scene, creation, sendMessage]);

  return (
    <>
      {showIntro && (
        <Overlay closeOnClick onClose={onClose} footer={footerElement}>
          <FormattedMessage id="play.help" tagName="p" />
          <div className={styles.play}>
            <div>
              <img src="/icon-touch.png" alt="Touch" />
              <FormattedMessage id="play.touch" />
            </div>
            <div>
              <img src="/icon-hold.png" alt="Hold" />
              <FormattedMessage id="play.hold" />
            </div>
            <div>
              <img src="/icon-draw.png" alt="Draw" />
              <FormattedMessage id="play.draw" />
            </div>
          </div>
        </Overlay>
      )}
      <Controls />
    </>
  );
};

export default PlayStep;
