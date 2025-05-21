import { useState, useRef, useEffect } from 'react';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiMoreVertical, 
  FiCopy, 
  FiShare2,
  FiTwitter,
  FiMail,
  FiMessageSquare,
  FiX
} from 'react-icons/fi';

const ContextTranslationViewBox = ({ translationOptions }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [contentToShare, setContentToShare] = useState('');
  const menuRefs = useRef({});
  const shareDialogRef = useRef();

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
    setMenuOpen(null);
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === index ? null : index);
  };

  const closeAllMenus = () => {
    setMenuOpen(null);
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setMenuOpen(null);
  };

  const openShareDialog = (text, e) => {
    e.stopPropagation();
    setContentToShare(text);
    setShareDialogOpen(true);
    setMenuOpen(null);
  };

  const closeShareDialog = () => {
    setShareDialogOpen(false);
  };

  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(contentToShare)}`;
    window.open(url, '_blank');
    closeShareDialog();
  };

  const shareViaEmail = () => {
    const url = `mailto:?body=${encodeURIComponent(contentToShare)}`;
    window.location.href = url;
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(contentToShare)}`;
    window.open(url, '_blank');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareDialogRef.current && !shareDialogRef.current.contains(event.target)) {
        closeShareDialog();
      }
      closeAllMenus();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="translation-container">
      {Object.entries(translationOptions).map(([context, translation], index) => (
        <div 
          key={index} 
          className={`accordion-item ${activeIndex === index ? 'active' : ''}`}
        >
          <div 
            className="accordion-header" 
            onClick={() => toggleAccordion(index)}
          >
            <div className="context-title">{context}</div>
            <div className="header-actions">
              {activeIndex === index ? (
                <FiChevronUp className="chevron-icon" />
              ) : (
                <FiChevronDown className="chevron-icon" />
              )}
              <div 
                className="menu-container"
                ref={el => menuRefs.current[index] = el}
              >
                <FiMoreVertical 
                  className="menu-icon" 
                  onClick={(e) => toggleMenu(index, e)}
                />
                {menuOpen === index && (
                  <div className="dropdown-menu">
                    <div 
                      className="menu-item" 
                      onClick={(e) => copyToClipboard(translation, e)}
                    >
                      <FiCopy className="menu-item-icon" />
                      <span>Copy</span>
                    </div>
                    <div 
                      className="menu-item" 
                      onClick={(e) => openShareDialog(translation, e)}
                    >
                      <FiShare2 className="menu-item-icon" />
                      <span>Share</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="accordion-content">
            {translation}
          </div>
        </div>
      ))}

      {/* Share Dialog */}
      {shareDialogOpen && (
        <div className="share-dialog-overlay">
          <div className="share-dialog" ref={shareDialogRef}>
            <div className="share-dialog-header">
              <h3>Share Translation</h3>
              <button className="close-button" onClick={closeShareDialog}>
                <FiX />
              </button>
            </div>
            <div className="share-options">
              <button className="share-option" onClick={shareViaTwitter}>
                <FiTwitter className="share-icon" />
                <span>Twitter</span>
              </button>
              <button className="share-option" onClick={shareViaEmail}>
                <FiMail className="share-icon" />
                <span>Email</span>
              </button>
              <button className="share-option" onClick={shareViaWhatsApp}>
                <FiMessageSquare className="share-icon" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextTranslationViewBox;