import { X } from "lucide-react";

const ContextTranslationViewBox = ({ translationOptions, onClose }) => {
  const entries = Object.entries(translationOptions || {}).filter(
    ([context, translation]) => context && translation
  );

  if (entries.length === 0) return null;

  return (
    <div className="translation-container context-panel">
      <div className="context-panel-header">
        <h4>Context translations</h4>
        <button type="button" className="context-panel-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="context-panel-body">
        {entries.map(([context, translation], index) => (
          <div key={`${context}-${index}`} className="context-panel-item">
            <div className="context-panel-label">{context}</div>
            <div className="context-panel-value">{translation}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextTranslationViewBox;