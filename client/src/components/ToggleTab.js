import { useState, useEffect } from "react";
import { TiInfo } from "react-icons/ti";
import {toast} from "sonner";

export default function ToggleTab({ isContext, setIsContext, isTranslating }) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    toast.info(`Context is now ${isContext ? "on" : "off"}`);
  }, [isContext]);

  return (
    <div className="switch-tab-wrapper">
      <div className="toggle-container">
        <button
          style={{ cursor: isTranslating ? 'not-allowed' : 'pointer' }}
          className={`toggle-option ${!isContext ? "active" : ""}`}
          onClick={() => setIsContext(false)}
          disabled={isTranslating}
        >
          CONTEXT OFF
        </button>
        <button
          style={{ cursor: isTranslating ? 'not-allowed' : 'pointer' }}
          className={`toggle-option ${isContext ? "active" : ""}`}
          onClick={() => setIsContext(true)}
          disabled={isTranslating}
        >
          CONTEXT ON
        </button>
        <div className={`toggle-slider ${isContext ? "right" : "left"}`}></div>
      </div>
      <div className="toggle-title">
      <button
        className="info-icon"
        onClick={() => setShowTooltip(!showTooltip)}
        aria-label="More information"
        disabled={isTranslating}
      >
        <TiInfo size={16}/>
      </button>
      {showTooltip && (
        <div className="tooltip">
          <p>Turn on or off to provide context to translations with AI</p>
          <div className="tooltip-arrow"></div>
        </div>
      )}
      </div>
    </div>
  );
}
