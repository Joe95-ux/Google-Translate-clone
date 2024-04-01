import React from 'react'

const Header = () => {
  return (
    <div style={{display:"flex", justifyContent:"flex-start", alignItems:"center", padding:"1rem 0", marginBottom:"2.5rem"}}>
        <img style={{with:"40px", height:"40px", objectFit:"contain"}} src="/assets/logo.png" alt="Logo"/>
        <h2 style={{color:"#F5F5F5", fontWeight:"500px", fontSize:"18px", margin:"0 0 0 5px"}}>TranslateIt.io</h2>


    </div>
  )
}

export default Header