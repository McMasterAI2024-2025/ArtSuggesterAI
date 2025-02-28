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
  const [c1,setC1] = useState("None");
  const [c2,setC2] = useState("None");
  const [c3,setC3] = useState("None");
  const [c4,setC4] = useState("None");
  const [c5,setC5] = useState("None");
  const [m1,setM1] = useState("Normal");
  const [m2,setM2] = useState("Normal");
  const [m3,setM3] = useState("Normal");
  const [m4,setM4] = useState("Normal");
  const [m5,setM5] = useState("Normal");

  // Update states when uploadData changes
  useEffect(() => {
    if (uploadData) {
      console.log("Updating data")
      if (uploadData.Colours) {
        setDetectedColors(uploadData.Colours.join(", "));
      }
      if (uploadData.Medium) {
        setDetectedMediums(uploadData.Medium);
      }
    }
  }, [uploadData]);

  useEffect(() => {
    const info = detectedColors.split(",")
    const processed = info.map(item => item.split("_"))
    console.log(processed)
    const len = detectedColors.length
    if(len > 0){
      setC1(processed[0][0]);
    }
    if(len > 1){
      setC2(processed[1][0]);
      console.log(c2);
    }
    if(len > 2){
      setC4(processed[2][0]);
    }
    if(len > 3){
      setC3(processed[3][0]);
      console.log(c2);
    }
    if(len > 4){
      setC5(processed[4][0]);
    }
  })

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
          <div className="color-select">
            <label for="c1">Color 1</label>
            <select id="c1" name="c1" className = "color" value = {c1} onChange={(e) => setC1(e.target.value)}>
                <option value="">(None)</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
                <option value="gray">Gray</option>
                <option value="cyan">Cyan</option>
                <option value="magenta">Magenta</option>
                <option value="lime">Lime</option>
                <option value="teal">Teal</option>
                <option value="navy">Navy</option>
                <option value="white">White</option>
            </select>
            <select id="modeSelect1">
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c2">Color 2</label>
            <select id="c2" name="c2" className = "color" value = {c2} onChange={(e) => setC2(e.target.value)}>
                <option value="">(None)</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
                <option value="gray">Gray</option>
                <option value="cyan">Cyan</option>
                <option value="magenta">Magenta</option>
                <option value="lime">Lime</option>
                <option value="teal">Teal</option>
                <option value="navy">Navy</option>
                <option value="white">White</option>
            </select>
            <select id="modeSelect2">
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c3">Color 3</label>
            <select id="c3" name="c3" value = {c3} onChange={(e) => setC3(e.target.value)}>
                <option value="">(None)</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
                <option value="gray">Gray</option>
                <option value="cyan">Cyan</option>
                <option value="magenta">Magenta</option>
                <option value="lime">Lime</option>
                <option value="teal">Teal</option>
                <option value="navy">Navy</option>
                <option value="white">White</option>
            </select>
            <select id="modeSelect3">
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c4">Color 4</label>
            <select id="c4" name="c4" value = {c4} on onChange={(e) => setC4(e.target.value)}>
                <option value="">(None)</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
                <option value="gray">Gray</option>
                <option value="cyan">Cyan</option>
                <option value="magenta">Magenta</option>
                <option value="lime">Lime</option>
                <option value="teal">Teal</option>
                <option value="navy">Navy</option>
                <option value="white">White</option>
            </select>
            <select id="modeSelect4">
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c5">Color 5</label>
            <select id="c5" name="c5" value = {c5} on onChange={(e) => setC5(e.target.value)}>
                <option value="">(None)</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
                <option value="gray">Gray</option>
                <option value="cyan">Cyan</option>
                <option value="magenta">Magenta</option>
                <option value="lime">Lime</option>
                <option value="teal">Teal</option>
                <option value="navy">Navy</option>
                <option value="white">White</option>
            </select>
            <select id="modeSelect5">
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>


          
          {/*
          <div className="input-group">
            <label>Colours Detected</label>
            <textarea
              value={detectedColors}
              onChange={(e) => setDetectedColors(e.target.value)}
              className="detected-info"
            />
          </div>
          */}

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