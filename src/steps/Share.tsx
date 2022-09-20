import React, { useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useToggle } from "react-use";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import QRCode from "react-qr-code";
import Loading from "react-loading";

import { isReady } from "../state/recorder";
import Overlay, { SlotComponent } from "../components/Overlay";
import Button from "../components/Button";
import Controls from "../components/Controls";
import { useHardRefresh } from "../hooks/location";
import { getUploadUrl } from "../utils/upload";
import styles from "../styles/steps.module.css";

const ShareStep: React.FC = () => {
  const { id, scene } = useParams<{ id: string; scene: string }>();
  const isVideoReady = useRecoilValue(isReady(+id));
  const [showLink, toggleLink] = useToggle(false);
  const refresh = useHardRefresh(`/${scene}/play`);
  const videoLink = useMemo(() => getUploadUrl(id), [id]);
  const onClose = useCallback(
    (onDone?: React.MouseEventHandler) => (e: React.MouseEvent) => {
      typeof onDone === "function" && onDone(e);
      refresh();
    },
    [refresh]
  );
  const footerElement = useCallback<SlotComponent>(
    ({ close }) => (
      <div className={styles.footer}>
        <Button size="large" color="white" onClick={onClose(close)}>
          OK
        </Button>
      </div>
    ),
    [onClose]
  );
  return (
    <>
      <Overlay className={styles.share} onClose={onClose()} footer={footerElement}>
        <h2>Bravo!</h2>
        <p className={styles.message}>
          <FormattedMessage id="share.message" />:
        </p>
        {isVideoReady ? (
          <QRCode bgColor="#000000" fgColor="#FFFFFF" value={videoLink} size={256} />
        ) : (
          <Loading color="#FFFFFF" type="spin" height={256} width={256} />
        )}
        <div className={styles.actions}>
          <p className={styles.link} onClick={() => toggleLink()}>
            <img src="/icon.eye.png" />
            <FormattedMessage id="share.link" tagName="span" />
          </p>
        </div>
        {showLink && (
          <div className={styles.link}>
            <p style={{ textDecoration: "underline" }}>{videoLink}</p>
          </div>
        )}
      </Overlay>
      <Controls>
        <p style={{ width: "80%" }}>
          <FormattedMessage id="share.message" />
        </p>
      </Controls>
    </>
  );
};

export default ShareStep;
