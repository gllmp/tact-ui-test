import { useCallback } from "react";
import { useHistory } from "react-router-dom";

export const useHardRefresh = (path = "/", cb?: () => void): (() => void) => {
  const refresh = useCallback(() => {
    if (typeof cb === "function") cb();
    window.location.href = new URL(path, window.location.origin).toString();
  }, [cb, path]);

  return refresh;
};

export const useShallowRefresh: typeof useHardRefresh = (path = "/", cb) => {
  const history = useHistory();
  const refresh = useCallback(() => {
    if (typeof cb === "function") cb();
    history.push(path);
  }, [history, path, cb]);

  return refresh;
};
