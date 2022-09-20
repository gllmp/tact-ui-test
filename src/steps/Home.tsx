import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import Controls from "../components/Controls";
import { scenes, getScene } from "../scenes";
import { sceneState } from "../state";

import styles from "../styles/steps.module.css";

const Home: React.FC = () => {
  const history = useHistory();
  const setScene = useSetRecoilState(sceneState);

  const handleClick = useCallback(
    (key: keyof typeof scenes) => {
      setScene(getScene(key));
      history.push(`/${key.slice(0, -2)}/play`, { showIntro: true });
    },
    [history, setScene]
  );

  return (
    <div className={styles.home}>
      {Object.entries(scenes)
        .filter(([name]) => name.indexOf("01") >= 0 && !name.startsWith("panorama") && !name.startsWith("romain"))
        .map(([name, scene]) => (
          <div
            onClick={() => handleClick(name)}
            key={name}
            className={styles.scene}
            style={{
              backgroundImage: `url('/images/1920/${scene.name
                .slice(0, -2)
                .concat(scene.name.startsWith("romain") ? "-03" : "-01")}.png')`,
            }}
          >
            <h1>{scene.title}</h1>
            <div style={{ textAlign: "center" }}>
              <p>
                <FormattedMessage id="home.composition" /> - {scene.composer}
              </p>
              <p>
                <FormattedMessage id="home.design" /> - {scene.designer}, {scene.photographer}
              </p>
            </div>
            <button>
              <FormattedMessage id="home.play" />
            </button>
          </div>
        ))}
      <Controls />
    </div>
  );
};

export default Home;
