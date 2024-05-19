import React from "react";
import { motion } from "framer-motion";

const langLength = 135;

const LanguageLoader = () => {
  const divs = Array.from({ length: langLength }, (_, index) => index);

  return (
    <div className="loader-list">
      {divs.map((div) => (
        <motion.div
          key={div}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{
            width: "250px",
            height: "26px",
            margin: "5px",
            borderRadius: "5px",
            backgroundColor: "#33415529",
          }}
        />
      ))}
    </div>
  );
};

export default LanguageLoader;
