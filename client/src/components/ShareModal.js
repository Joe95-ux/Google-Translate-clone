import React from "react";
import { IoMdClose } from "react-icons/io";
import { BsFacebook, BsTwitterX } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { useShareModal } from "../hooks/useShareModal";

const ShareModal = ({ from, to, textToTranslate, translatedText }) => {
  const { isOpen, onOpen, onClose } = useShareModal();

  return (
    <div className="share-modal-wrapper">
      <div className="share-modal-inner">
        <div className="share-head">
          <h4>Share Translation</h4>
          <IoMdClose
            size={22}
            className="close-history-btn"
            onClick={onClose}
          />
        </div>
        <div className="share-body">
            <span title="share on X">
                <BsTwitterX size={24} className="close-history-btn"/>
            </span>
            <span title="share on facebook">
                <BsFacebook size={24} className="close-history-btn"/>
            </span>
            <span title="share by email">
                <MdOutlineEmail size={24} className="close-history-btn"/>
            </span>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
