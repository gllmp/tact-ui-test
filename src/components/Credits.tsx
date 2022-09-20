import React, { useEffect, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router-dom";
import { useRafState } from "react-use";
import LogoIrcam from "./LogoIrcam";
import { getScene } from "../scenes";
import styles from "../styles/credits.module.css";

const CreditsStep: React.FC = () => {
  const { scene: sceneName } = useParams<{ scene: string }>();
  console.log("sceneName: ", sceneName);
  const scene = getScene(sceneName);
  console.log("scene: ", scene);
  const [opacity, setOpacity] = useRafState(0);
  const backgroundColor = useMemo(() => `rgba(0, 0, 0, ${opacity.toFixed(1)})`, [opacity]);

  useEffect(() => {
    if (opacity >= 1) return;
    setOpacity((value) => value + 0.01);
  }, [opacity, setOpacity]);

  return (
    <div style={{ backgroundColor }} className={styles.credits}>
      <h1>{scene.title}</h1>

      <div className={styles.individuals}>
        <div>
          <FormattedMessage id="credits.composition.creator" values={{ person: scene.composer }} tagName="p" />
          <FormattedMessage
            id="credits.design"
            values={{ person: [scene.designer, scene.photographer].join(", ") }}
            tagName="p"
          />
        </div>

        <div>
          <FormattedMessage
            id="credits.composition"
            values={{ person: ["Frédéric Voisin", scene.assistantComposer ?? "Romain Barthélémy"].join(", ") }}
            tagName="p"
          />
          <FormattedMessage id="credits.code" values={{ person: "Pascal Vaccaro" }} tagName="p" />
        </div>
      </div>

      <div>
        <LogoIrcam />
      </div>
    </div>
  );
};

export default CreditsStep;
