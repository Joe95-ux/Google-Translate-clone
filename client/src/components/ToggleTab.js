export default function ToggleTab({ isContext, setIsContext }) {
  return (
    <div className="switch-tab-wrapper">
      <div className="switch-tab-header">
      <h3>Provide Context</h3>
      <p>Turn on or off to provide context to translations with AI</p>
      </div>
      <div className="toggle-container">
        <button
          className={`toggle-option ${!isContext ? "active" : ""}`}
          onClick={() => setIsContext(false)}
        >
          OFF
        </button>
        <button
          className={`toggle-option ${isContext ? "active" : ""}`}
          onClick={() => setIsContext(true)}
        >
          ON
        </button>
        <div className={`toggle-slider ${isContext ? "right" : "left"}`}></div>
      </div>
    </div>
  );
}
