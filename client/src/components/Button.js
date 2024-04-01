import React from 'react'

const Button = ({disable}) => {
  return (
    <div title={!disable && "Submit"}>{disable ? <small style={{pointerEvents:'none'}}>fetching...</small> : '➟'}</div>
  )
}

export default Button