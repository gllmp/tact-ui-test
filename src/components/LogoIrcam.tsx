import React from "react";

const LogoIrcam: React.FC<{ width?: number; height?: number }> = (props) => {
  return <img src="/logoircam_blanc.png" alt="Logo Ircam" {...props} />;
};

export default LogoIrcam;
