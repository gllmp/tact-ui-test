import React from "react";
import { FormattedMessage } from "react-intl";

import Overlay from "../components/Overlay";
import { RecordButton } from "../components/Button";

const RecordPopup: React.FC = () => {
  return (
    <Overlay closeOnClick>
      <div style={{ display: "flex" }}>
        <p>
          <FormattedMessage id="record.popup.message" />
        </p>
        <RecordButton rounded>REC</RecordButton>
      </div>
    </Overlay>
  );
};

export default RecordPopup;
