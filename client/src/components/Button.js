import React from 'react'
import { IoEnter } from "react-icons/io5";

const Button = ({disable}) => {
  // const icon = '➟';
  return (
    <div title={!disable && "Click to Translate"}>{disable ? <small style={{pointerEvents:'none'}}>fetching...</small> : <IoEnter size={30}/>}</div>
  )
}

export default Button