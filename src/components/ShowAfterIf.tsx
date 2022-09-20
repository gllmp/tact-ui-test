import React, { useCallback, useEffect, useState } from "react";
import { useTimeoutFn } from "react-use";
import { RecoilValueReadOnly, useRecoilValue, atom } from "recoil";

const emptyAtom = atom({ key: "empty", default: false });
const ShowAfterIf: React.FC<{
  atom?: RecoilValueReadOnly<boolean>;
  condition?: boolean;
  delay?: number;
  cb?: () => void;
}> = ({ atom, condition, cb, delay = 0, children }) => {
  const recoilValue = useRecoilValue(atom ?? emptyAtom);
  const [show, setShow] = useState(recoilValue);
  const timeoutFn = useCallback(() => {
    setShow(!!condition);
    if (condition && typeof cb === "function") cb();
  }, [condition, setShow, cb]);
  const [isReady, cancel, reset] = useTimeoutFn(timeoutFn, delay * 1000);

  useEffect(() => {
    if (condition) reset();
    else {
      cancel();
      setShow(false);
    }
    return () => (isReady() === false ? cancel() : undefined);
  }, [isReady, cancel, condition, reset]);

  return show ? <>{children}</> : null;
};

export default ShowAfterIf;
