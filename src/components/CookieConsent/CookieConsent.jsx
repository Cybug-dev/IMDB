import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie, ShieldCheck } from "lucide-react";
import "./CookieConsent.scss";

const PROMPT_DELAY_MS = 15_000;
const MotionDialog = motion.div;

function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const acceptButtonRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(true), PROMPT_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isVisible) acceptButtonRef.current?.focus();
  }, [isVisible]);

  const saveConsent = () => {
    setIsVisible(false);
  };

  const motionProps = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 32, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 24, scale: 0.98 },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDialog
          className="cookie-consent"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          {...motionProps}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cookie-consent__icon" aria-hidden="true">
            <Cookie size={21} />
          </div>

          <div className="cookie-consent__content">
            <div className="cookie-consent__heading">
              <p className="cookie-consent__eyebrow">
                <ShieldCheck size={14} aria-hidden="true" />
                Privacy choices
              </p>
              <h2 id="cookie-consent-title">Your experience, your choice</h2>
            </div>

            <p id="cookie-consent-description">
              We use essential cookies to keep IMDb running and optional cookies
              to understand what helps make your movie experience better.
            </p>

            <div className="cookie-consent__actions">
              <button
                type="button"
                className="cookie-consent__decline"
                onClick={saveConsent}
              >
                Decline optional
              </button>
              <button
                ref={acceptButtonRef}
                type="button"
                className="cookie-consent__accept"
                onClick={saveConsent}
              >
                Accept all cookies
              </button>
            </div>
          </div>
        </MotionDialog>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
