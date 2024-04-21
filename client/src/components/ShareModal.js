import React, {useRef, useEffect} from "react";
import { IoMdClose } from "react-icons/io";
import { BsTwitterX } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useShareModal } from "../hooks/useShareModal";

const ShareModal = ({ from, to, textToTranslate, translatedText }) => {
  const { onClose } = useShareModal();
  const shareRef = useRef()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target) && event.target.id !== 'toggle-share') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleWhatsAppShare = () => {
    const message = `Translation from ${from} to ${to}:\n\nOriginal text: ${textToTranslate}\n\nTranslated text: ${translatedText}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const tweetText = `Translation from ${from} to ${to}:\n\nOriginal text: ${textToTranslate}\n\nTranslated text: ${translatedText}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = 'Check out this translation';
    const body = `Translation from ${from} to ${to}:\n\nOriginal text: ${textToTranslate}\n\nTranslated text: ${translatedText}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="share-modal-wrapper" ref={shareRef}>
      <div className="share-modal-inner" >
        <div className="share-head">
          <h4>Share Translation</h4>
          <IoMdClose
            size={22}
            className="close-history-btn"
            onClick={onClose}
          />
        </div>
        <div className="share-body">
            <div title="share on X" className="share-icon" onClick={handleTwitterShare}>
                <BsTwitterX size={24}/>
            </div>
            <div title="share on whatsapp" className="share-icon" onClick={handleWhatsAppShare}>
                <FaWhatsapp size={24}/>
            </div>
            <div title="share by email" className="share-icon" onClick={handleEmailShare}>
                <MdOutlineEmail size={24}/>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
