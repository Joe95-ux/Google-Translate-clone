import { useState } from "react";
import { BsInfoSquare } from "react-icons/bs";

export default function ToggleTab({ isContext, setIsContext }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="switch-tab-wrapper">
      <div className="toggle-container">
        <button
          className={`toggle-option ${!isContext ? "active" : ""}`}
          onClick={() => setIsContext(false)}
        >
          CONTEXT OFF
        </button>
        <button
          className={`toggle-option ${isContext ? "active" : ""}`}
          onClick={() => setIsContext(true)}
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
      >
        <BsInfoSquare size={16} style={{color:"#38BDF8"}}/>
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
