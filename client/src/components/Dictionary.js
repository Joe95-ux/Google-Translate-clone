import React from "react";

const Dictionary = ({ dic, trans }) => {
  return (
    <div className="dictionary-wrapper" style={{marginTop:"2rem"}}>
      <div className="dic-head">
        <h2>{trans}</h2>
        <h3>{dic[0].pos}</h3>
      </div>
      <div className="more-trans">
        <h2>More Translations</h2>
        {dic[0].entry.map((ent, index) => {
          return (
            <div className="entry" key={index}>
              <div className="trans-word"> <span>{ent.word}</span></div>
              
              <div className="alternate-trans">
                <div className="pos">{dic[0].pos}</div>
                {ent.reverse_translation.map((word, index) => (
                    <span key={index}>{word}</span>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dictionary;
