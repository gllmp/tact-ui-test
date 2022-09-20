import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useInterval } from "react-use";

import Overlay, { SlotComponent } from "../components/Overlay";
import { CancelButton } from "../components/Button";
import Controls from "../components/Controls";

const CountdownStep: React.FC<{ countdown: number }> = ({ countdown }) => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();
  const [remains, setRemains] = useState(Math.floor(countdown / 1000));

  const onClose = useCallback(
    (onDone?: React.MouseEventHandler): React.MouseEventHandler =>
      (e) => {
        setRemains(-1);
        typeof onDone === "function" && onDone(e);
        history.push(`/${scene}/play`, { showIntro: false });
      },
    [history, scene, setRemains]
  );
  const footerElement = useCallback<SlotComponent>(
    ({ close }) => <CancelButton color="red" onClick={onClose(close)} />,
    [onClose]
  );

  useEffect(
    () => (remains === 0 ? history.push(`/${scene}/record/${Math.ceil(new Date().getTime() / 1000)}`) : undefined),
    [remains, history, scene]
  );

  useInterval(() => setRemains((v) => Math.max(v - 1, 0)), remains > 0 ? 1000 : null);

  return (
    <>
      <Overlay full header={null} footer={footerElement}>
        <h1 style={{ fontSize: "12em", margin: 0 }}>{remains}</h1>
      </Overlay>
      <Controls>
        <FormattedMessage
          id="countdown.message"
          values={{
            remains,
            b: (chunks: React.ReactNode) => <strong style={{ color: "red" }}>{` ${chunks} `}</strong>,
          }}
          tagName="p"
        />
      </Controls>
    </>
  );
};

export default CountdownStep;
