import React from 'react'

const Documents = () => {
  return (
    <div className='container-fluid'>
        <div className="drop-container">
            <div className="drop-area">
                <div className="drop-zone"></div>
            </div>
            <h4>Drag and drop</h4>
        </div>
        <div className="browse-container">
            <div className="browse-inner">
                <h4>Or Choose a file</h4>
                <button>Browse files</button>
                <p>Supported file types: .docx, .pdf, .pptx, .xlsx</p>
            </div>
            
        </div>

    </div>
  )
}

export default Documents