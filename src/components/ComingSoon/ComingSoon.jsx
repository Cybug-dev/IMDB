import { cloneElement, useCallback, useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import "./ComingSoon.scss";

function ComingSoon({
  trigger,
  featureName,
  open,
  onOpenChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const visible = isControlled ? open : isOpen;
  const featureLabel = featureName ? `${featureName} is ` : "";

  const setVisible = useCallback((nextOpen) => {
    if (!isControlled) setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [isControlled, onOpenChange]);

  useEffect(() => {
    if (!visible) return undefined;

    const timeout = window.setTimeout(() => setVisible(false), 3600);
    return () => window.clearTimeout(timeout);
  }, [visible, setVisible]);

  const triggerElement = trigger
    ? cloneElement(trigger, {
        onClick: (event) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) setVisible(true);
        },
      })
    : null;

  return (
    <>
      {triggerElement}
      {visible && (
        <div className="coming-soon" role="status" aria-live="polite">
          <Sparkles className="coming-soon__icon" aria-hidden="true" size={18} />
          <div>
            <strong>Coming Soon</strong>
            <p>{featureLabel}on its way.</p>
          </div>
          <button
            type="button"
            className="coming-soon__close"
            onClick={() => setVisible(false)}
            aria-label="Dismiss coming soon message"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
      )}
    </>
  );
}

export default ComingSoon;
