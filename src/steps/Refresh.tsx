import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";

import Overlay, { SlotComponent } from "../components/Overlay";
import Button from "../components/Button";
import Controls from "../components/Controls";
import { useShallowRefresh } from "../hooks/location";
import { useXebra } from "../hooks/xebra";
import { sceneState } from "../state";
import { getScene } from "../scenes";

const RefreshStep: React.FC = () => {
  const { scene } = useParams<{ scene: string }>();
  const { sendMessage } = useXebra();
  const [current, changeScene] = useRecoilState(sceneState);
  const refresh = useShallowRefresh(`/${scene}/play`, () => {
    if (current.name) {
      sendMessage("stop", { name: current.name === "credits" ? `credits-${scene}` : current.name });
      if (current.name.endsWith("01")) {
        const img = new Image();
        img.src = current.imageSrc;
        img.onload = function () {
          const canvas = document.getElementById("foreground") as HTMLCanvasElement;
          if (!canvas) return;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
          ctx.drawImage(img, 0, 0);
        };
      }
      changeScene(getScene(scene));
    }
  });
  const history = useHistory();
  const onClose = useCallback(
    (cb: React.MouseEventHandler) => (e: React.MouseEvent) => {
      if (typeof cb === "function") cb(e);
      history.push(`/${scene}/play`);
    },
    [history, scene]
  );
  const footerElement = useCallback<SlotComponent>(
    ({ close }) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button rounded color="white" onClick={onClose(close)}>
          &times;
        </Button>
        <p style={{ margin: 4 }}>
          <FormattedMessage id="btn.cancel" />
        </p>
      </div>
    ),
    [onClose]
  );
  return (
    <>
      <Overlay footer={footerElement}>
        <h3 style={{ margin: "1rem 0", padding: 0 }}>
          <FormattedMessage id="reset.message" />
        </h3>
        <Button color="white" size="large" onClick={refresh}>
          <FormattedMessage id="btn.yes" />
        </Button>
      </Overlay>
      <Controls />
    </>
  );
};

export default RefreshStep;
