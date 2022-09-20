import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory, useParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";

import Overlay from "../components/Overlay";
import { RecordButton, RestartButton } from "../components/Button";
import Controls from "../components/Controls";
import { playerState } from "../state";
import { useShallowRefresh } from "../hooks/location";
import styles from "../styles/steps.module.css";

const PreRecorderStep: React.FC = () => {
  const setPlayer = useSetRecoilState(playerState);
  const { scene } = useParams<{ scene: string }>();
  const history = useHistory();
  const startAndRefresh = useShallowRefresh(`/${scene}/countdown"`, () => setPlayer("recording"));
  const onClose = useCallback(
    (cb?: React.MouseEventHandler) => (e: React.MouseEvent) => {
      history.push(`/${scene}/play`, { showIntro: false });
      typeof cb === "function" && cb(e);
    },
    [history, scene]
  );
  const startRecording = useCallback(() => {
    setPlayer("recording");
    history.push(`/${scene}/countdown`);
  }, [history, scene, setPlayer]);
  return (
    <>
      <Overlay className={styles.record} onClose={onClose()}>
        <p className={styles.message}>
          <FormattedMessage id="record.launch.message" />
        </p>
        <p className={styles.message}>
          <FormattedMessage id="record.launch.help" />
        </p>
        <RecordButton rounded onClick={startRecording} size="large">
          <strong>
            <FormattedMessage id="record.launch.start" />
          </strong>
        </RecordButton>

        <RestartButton
          rounded
          bordered
          color="red"
          onClick={startAndRefresh}
          description={<FormattedMessage id="record.launch.reset" />}
        />
        <div style={{ height: "2rem" }} />
      </Overlay>
      <Controls>
        <FormattedMessage id="record.lauch.controls" tagName="p" />
      </Controls>
    </>
  );
};

export default PreRecorderStep;
