import React from "react";
import { IoEnter } from "react-icons/io5";
import { ThreeCircles } from "react-loader-spinner";

const Button = ({ disable, translate }) => {
  // const icon = '➟';
  const timestamp = "";

  return (
    <div title={!disable && "Click to Translate"} style={{ display: "flex" }}>
      {disable ? (
        <ThreeCircles
          height="80"
          width="80"
          radius="9"
          color="var(--text-secondary)"
          ariaLabel="loading"
          style={{ cursor: "default" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => translate(timestamp)}
          className="middle-translate-btn"
          aria-label="Translate"
        >
          <IoEnter size={24} />
        </button>
      )}
    </div>
  );
};

export default Button;
