import React from 'react'

const Button = ({disable}) => {
  return (
    <div>{disable ? <small style={{pointerEvents:'none'}}>fetching...</small> : '➟'}</div>
  )
}

export default Button