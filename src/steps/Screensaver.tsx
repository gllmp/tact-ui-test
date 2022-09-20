import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHardRefresh } from "../hooks/location";

const ScreenSaverStep: React.FC = () => {
  const refresh = useHardRefresh("/panorama");
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/panorama") refresh();
  }, [location, refresh]);

  return null;
};

export default ScreenSaverStep;
