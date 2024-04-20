import React from "react";
import { IoEnter } from "react-icons/io5";
import { ThreeCircles } from "react-loader-spinner";

const Button = ({ disable, translate }) => {
  // const icon = '➟';

  return (
    <div title={!disable && "Click to Translate"} style={{ display: "flex" }}>
      {disable ? (
        <ThreeCircles
          height="80"
          width="80"
          radius="9"
          color="rgb(148 163 184)"
          ariaLabel="loading"
          style={{ cursor: "default" }}
        />
      ) : (
        <IoEnter size={30} onClick={translate} style={{ cursor: "pointer" }} />
      )}
    </div>
  );
};

export default Button;
