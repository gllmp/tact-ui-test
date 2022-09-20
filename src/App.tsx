import React from "react";
import { Switch, Route } from "react-router-dom";
import { useEvent, useIdle } from "react-use";

import * as Step from "./steps";

import Canvas from "./components/Canvas";
import IntlProvider from "./components/IntlProvider";
import ShowAfterIf from "./components/ShowAfterIf";
import Recorder from "./components/Recorder";
import ProgressBar from "./components/ProgressBar";

const preventDefault: EventListener = (e) => e.preventDefault();

const App: React.FC = () => {
  const countdown = 3e3; // 3 seconds
  const duration = 15e3; //  15 seconds

  const isIdle = useIdle(18e4, false); // 3 minutes

  // Prevent default pinching
  useEvent("gesturestart", preventDefault, document);
  useEvent("gesturechange", preventDefault, document);
  // Prevent right-clicking
  useEvent("contextmenu", preventDefault, document);
  // Prevent scrolling and wheeling
  useEvent("scroll", preventDefault, document);
  useEvent("wheel", preventDefault, document);

  return (
    <IntlProvider>
      <Switch>
        <Route path="/" exact>
          <Step.Home />
        </Route>
        <Route path="/info" exact>
          <Step.Home />
          <Step.Info />
        </Route>
        <Route path="/:scene">
          <Canvas />
          <Step.Next />
        </Route>
      </Switch>
      <Route>
        <ShowAfterIf condition={isIdle} children={<Step.ScreenSaver />} />
      </Route>
      <Switch>
        <Route path="/:scene" exact>
          {({ location }) => (location.pathname === "/panorama" ? <Step.Start /> : null)}
        </Route>
        <Route path="/:scene/play">
          <Step.Play />
        </Route>
        <Route path="/:scene/recorder">
          <Step.PreRecorder />
        </Route>
        <Route path="/:scene/countdown">
          <Step.Countdown countdown={countdown} />
        </Route>
        <Route path="/:scene/record/:id">
          <Recorder duration={duration} />
          <ProgressBar duration={duration} />
        </Route>
        <Route path="/:scene/share/:id">
          <Step.Share />
        </Route>
        <Route path="/:scene/refresh">
          <Step.Refresh />
        </Route>
        <Route path="/:scene/info">
          <Step.Info />
        </Route>
        <Route path="/:scene/confirm">
          <Step.Refresh />
        </Route>
      </Switch>
    </IntlProvider>
  );
};

export default App;
