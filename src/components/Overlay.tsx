import React, { useCallback, useRef, useState } from "react";
import LanguageSelector from "./LanguageSelector";
import styles from "../styles/overlay.module.css";
import { useClickAway } from "react-use";

export type SlotComponent = React.FC<{ close: React.MouseEventHandler }>;
type OverlayProps = {
  full?: boolean;
  header?: SlotComponent | null;
  footer?: SlotComponent | null;
  closeOnClick?: boolean;
  onClose?: React.MouseEventHandler;
  className?: string;
};
const headerElement: SlotComponent = ({ close }) => (
  <>
    <LanguageSelector />
    <div className={styles.exit} onClick={close}>
      &times;
    </div>
  </>
);
const Overlay: React.FC<OverlayProps> = ({
  full,
  footer,
  header = headerElement,
  onClose,
  closeOnClick,
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const close = useCallback<React.MouseEventHandler>(
    (e) => {
      setIsOpen((opened) => {
        if (typeof onClose === "function" && opened) onClose(e);
        return false;
      });
    },
    [onClose]
  );

  useClickAway(
    ref,
    (e) => {
      const event = e as unknown;
      closeOnClick && close(event as React.PointerEvent);
    },
    ["touchstart", "pointerdown"]
  );

  return isOpen ? (
    <div
      onPointerDown={full && closeOnClick ? (close as unknown as React.PointerEventHandler) : undefined}
      className={styles.overlay}
    >
      <div ref={ref} className={full ? styles.full : styles.card}>
        {header && <div className={styles.header}>{header({ close })}</div>}
        <div className={`${styles.body} ${className ?? ""}`}>{children}</div>
        {footer && <div className={styles.footer}>{footer({ close })}</div>}
      </div>
    </div>
  ) : null;
};

export default Overlay;
