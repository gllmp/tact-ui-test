import React from "react";

import Overlay from "../components/Overlay";
import { ContinueButton, RestartButton } from "../components/Button";
import Controls, { HorizontalSeparator } from "../components/Controls";
import { FormattedMessage } from "react-intl";

const BreakStep: React.FC = () => {
  return (
    <>
      <Overlay closeOnClick>
        <FormattedMessage tagName="h3" id="break.popup.message" />
        <ContinueButton />
        <HorizontalSeparator height={2} />
        <RestartButton rounded bordered />
      </Overlay>
      <Controls />
    </>
  );
};

export default BreakStep;
