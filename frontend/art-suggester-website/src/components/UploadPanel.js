/*
 * Harrison Johns, Johann Caancan
 */

import React, { useState, useEffect } from "react"
import './UploadPanel.css'
import { Navigate, useNavigate } from "react-router-dom";

const UploadPanel = ({ closePanel, img_url, uploadData }) => {
  // Initialize states with uploadData if available, otherwise use placeholders
  const [detectedColors, setDetectedColors] = useState(
    uploadData?.colours?.join(", ") || '{red, blue, yellow, ...}'
  );
  const [detectedMediums, setDetectedMediums] = useState(
    uploadData?.medium || '{pencil crayons, paint, marker, ...}'
  );

  // Update states when uploadData changes
  useEffect(() => {
    if (uploadData) {
      if (uploadData.Colours) {
        setDetectedColors(uploadData.Colours.join(", "));
      }
      if (uploadData.Medium) {
        setDetectedMediums(uploadData.Medium);
      }
    }
  }, [uploadData]);

  const navigate = useNavigate();

  const HandleConfirm = async () => {
    // Create the dictionary in the required format
    const fixed_dict = {
        medium: detectedMediums,
        colours: detectedColors.split(", ")  // Convert string back to array
    };

    try {
        // Send POST request to Flask backend
        const response = await fetch('http://localhost:5000/confirmInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fixed_dict)
        });

        // Check if request was successful
        if (response.ok) {
            const result = await response.json();
            console.log('Info confirmed:', result);
            navigate("/suggested");  // Only navigate if successful
        } else {
            console.error('Confirmation failed:', await response.json());
        }
    } catch (error) {
        console.error('Error confirming info:', error);
    }
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
            <label>Medium Detected</label>
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