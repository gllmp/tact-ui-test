import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory, useParams } from "react-router-dom";

import Overlay, { SlotComponent } from "../components/Overlay";
import Controls from "../components/Controls";
import Button from "../components/Button";
import styles from "../styles/steps.module.css";

const InfosStep: React.FC = () => {
  const history = useHistory();
  const { scene } = useParams<{ scene: string }>();
  const onClose = useCallback(
    (cb?: React.MouseEventHandler) => (e: React.MouseEvent) => {
      if (typeof cb === "function") {
        cb(e);
        history.push(`/${scene ?? "panorama"}/play`, { showIntro: true });
      } else {
        history.push(`/${scene ?? "panorama"}/play`);
      }
    },
    [history, scene]
  );
  const footerElement = useCallback<SlotComponent>(
    ({ close }) => (
      <Button bordered size="large" color="transparent" onClick={onClose(close)}>
        <FormattedMessage id="home.play" />
      </Button>
    ),
    [onClose]
  );

  return (
    <>
      <Overlay onClose={onClose()} footer={footerElement}>
        <div className={styles.credits}>
          <div>
            <strong>
              <FormattedMessage id="info.intro" tagName="h3" />
            </strong>
            <FormattedMessage id="info.message1" tagName="p" />
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <img src="/gestures.png" />
            </div>
            <div>
              <FormattedMessage id="info.creation" tagName="u" />
              <ul style={{ listStyleType: "none" }}>
                <li>
                  Georges Aperghis, <i>Sur les quais</i>
                </li>
                <li>
                  Fabien Bourlier, <i>Network</i>
                </li>
                <li>
                  Didem Coskunseven, <i>Locus Solus</i>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className={styles.authors}>
              <p>
                <strong>TACT - Centre Pompidou</strong>
              </p>
              <p>
                <FormattedMessage id="info.description" tagName="strong" />
              </p>
              <p>
                <FormattedMessage id="info.subtitle" />
              </p>
              <p style={{ marginBottom: 25 }}>
                <FormattedMessage id="info.subtitle2" />
              </p>

              <FormattedMessage
                id="credits.design"
                tagName="p"
                values={{
                  person: <b>Zoé Aegerter, Philippe Barbosa, Quentin Chevrier, Sergio Garcia</b>,
                }}
              />
              <FormattedMessage id="credits.artistic" tagName="p" values={{ person: <b>Zoé Aegerter</b> }} />
              <FormattedMessage id="credits.sound" tagName="p" values={{ person: <b>Romain Barthélémy</b> }} />
              <FormattedMessage id="credits.code" tagName="p" values={{ person: <b>Pascal Vaccaro</b> }} />
              <FormattedMessage
                id="credits.rim"
                tagName="p"
                values={{
                  person: <b>Frédéric Voisin, Romain Barthélémy</b>,
                  participant: <b>Fabien Bourlier</b>,
                }}
              />
              <FormattedMessage
                id="credits.composition"
                tagName="p"
                values={{ person: <b>Frédéric Voisin, Romain Barthélémy</b> }}
              />
              <FormattedMessage id="credits.mix" tagName="p" values={{ person: <b>Clément Cerles</b> }} />
              <FormattedMessage id="credits.furniture.design" tagName="p" values={{ person: <b>Emma Lelong</b> }} />
              <FormattedMessage id="credits.furniture.build" tagName="p" values={{ person: <b>Romain Coulon</b> }} />
              <FormattedMessage id="credits.code.advisor" tagName="p" values={{ person: <b>Emmanuel Rouillier</b> }} />
              <FormattedMessage id="credits.chief" tagName="p" values={{ person: <b>Emmanuelle Zoll</b> }} />
              <FormattedMessage id="credits.chief.assist" tagName="p" values={{ person: <b>Salomé Bazin</b> }} />
              <FormattedMessage id="credits.coprod" tagName="p" values={{ person: <b>Salomé Bazin</b> }} />
            </div>
          </div>
        </div>
      </Overlay>
      <Controls />
    </>
  );
};

export default InfosStep;
