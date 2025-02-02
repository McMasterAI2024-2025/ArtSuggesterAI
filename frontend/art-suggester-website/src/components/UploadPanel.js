/*
 * Harrison Johns, Johann Caancan
 */

import React, { useState } from "react"
import './UploadPanel.css'
import { Navigate, useNavigate } from "react-router-dom";

const UploadPanel = ({ closePanel, img_url } ) => {
  // States to hold the detected color information
  // this states should be retrieved from backend
  const [detectedColors, setDetectedColors] = useState('red, blue, yellow, ...');
  const [detectedMediums, setDetectedMediums] = useState('pencil crayons, paint, marker');

  const navigate = useNavigate();
  const HandleConfirm = () => {

    //Send medium and color to backend
    fetch("http://localhost:5000/sendMediumAndColor", {
      method: "POST",
      body: JSON.stringify({
        mediums: detectedMediums,
        colors: detectedColors,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).catch((error) => console.log(error))
      .then((response) => response.json()).catch((error) => console.log(error))
      .then((json) => console.log(json)).catch((error) => console.log(error));

    console.log("Confirmed!");
    navigate("/suggested");
  
  };

  return (
    <div className="upload-details-panel">
      <div className="upload-top-row">
        <h2 className="panel-title">Upload Details</h2>
        <div className="exit-x-container" onClick={closePanel}>
          <div className="exit-x">
            <span>x</span>
          </div>
        </div>
      </div>
      
      <div className="upload-details-columns">
        <div>
            <div className="input-group">
            <label>Colours Detected</label>
            <textarea
              value={detectedColors}
              onChange={(e) => setDetectedColors(e.target.value)}
              className="detected-info"
            />
          </div>

          <div className="input-group">
            <label>Medium(s) Detected</label>
            <textarea
              value={detectedMediums}
              onChange={(e) => setDetectedMediums(e.target.value)}
              className="detected-info"
            />
          </div>
          
          <button
            onClick={HandleConfirm}
            className="confirm-button"
          >
            Confirm
          </button>
        </div>
        <div className="image-placeholder">
          <img src={img_url} />
        </div>
      </div>
    </div>
  );
}

export default UploadPanel