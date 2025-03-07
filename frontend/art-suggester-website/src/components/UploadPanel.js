/*
 * Harrison Johns, Johann Caancan
 */

import React, { useState, useEffect } from "react"
import './UploadPanel.css'
import { Navigate, useNavigate } from "react-router-dom";
import { faBorderNone } from "@fortawesome/free-solid-svg-icons";

const UploadPanel = ({ closePanel, img_url, uploadData }) => {
  // Initialize states with uploadData if available, otherwise use placeholders
  const [detectedColors, setDetectedColors] = useState(
    uploadData?.colours || '{red, blue, yellow, ...}'
  );
  const [detectedMediums, setDetectedMediums] = useState(
    uploadData?.medium || '{pencil crayons, paint, marker, ...}'
  );

  const [colorsAndModes, setColorsAndModes] = useState([["Bruh","normal"],["(None)","normal"],["(None)","normal"],["(None)","normal"],["(None)","normal"]]);

  function change(colorNum, colorOrMode, value){
    const newList = [...colorsAndModes];
    newList[colorNum][colorOrMode] = value;
    setColorsAndModes(newList);
  }

  //Gets the colors in the right format for the backend
  function undo(){
    let c1;
    let c2;
    let c3;
    let c4;
    let c5;
    if (colorsAndModes[0][0] == "(None)"){
      c1 = null;
    }
    else{
      c1 = colorsAndModes[0][0] + "_" + colorsAndModes[0][1];
    }
    if (colorsAndModes[1][0] == "(None)") {
      c2 = null;
    } else {
      c2 = colorsAndModes[1][0] + "_" + colorsAndModes[1][1];
    }
    
    if (colorsAndModes[2][0] == "(None)") {
      c3 = null;
    } else {
      c3 = colorsAndModes[2][0] + "_" + colorsAndModes[2][1];
    }
    
    if (colorsAndModes[3][0] == "(None)") {
      c4 = null;
    } else {
      c4 = colorsAndModes[3][0] + "_" + colorsAndModes[3][1];
    }
    
    if (colorsAndModes[4][0] == "(None)") {
      c5 = null;
    } else {
      c5 = colorsAndModes[4][0] + "_" + colorsAndModes[4][1];
    }

    return([c1,c2,c3,c4,c5])
  }
  //Function to split the list into color andmode
  function splitCAndM(){
    const cAndMLen = detectedColors.length
    //console.log("THIS IS GREAT " + detectedColors, cAndMLen)
    //Values if that colour doesnt exist
    var c1 = "(None)";
    var c2 = "(None)";
    var c3 = "(None)";
    var c4 = "(None)";
    var c5 = "(None)";
    var m1 = "normal";
    var m2 = "normal";
    var m3 = "normal";
    var m4 = "normal";
    var m5 = "normal";

    //IDK how to do this better
    if (cAndMLen >= 1) {
      [c1, m1] = String(detectedColors[0]).split("_");
    }
    if (cAndMLen >= 2) {
      [c2, m2] = String(detectedColors[1]).split("_");
    }
    if (cAndMLen >= 3) {
      [c3, m3] = String(detectedColors[2]).split("_");
    }
    if (cAndMLen >= 4) {
      [c4, m4] = String(detectedColors[3]).split("_");
    }
    if (cAndMLen >= 5) {
      [c5, m5] = String(detectedColors[4]).split("_");
    }
    const newList = [[c1, m1], [c2, m2], [c3, m3], [c4, m4], [c5, m5]];
    setColorsAndModes(newList);
  }

  // Update states when uploadData changes
  useEffect(() => {
    if (uploadData) {
      if (uploadData.colours) {
        setDetectedColors(uploadData.colours);
        splitCAndM();
      }
      if (uploadData.Medium) {
        setDetectedMediums(uploadData.Medium);
      }
    }
  }, [uploadData]);

  useEffect(() => {console.log("NEW :" + colorsAndModes)}, [colorsAndModes])

  const navigate = useNavigate();

  const HandleConfirm = async () => {
    // Create the dictionary in the required format
    let toSend = undo();
    console.log(toSend)
    const fixed_dict = {
        medium: detectedMediums,
        //colours: detectedColors.split(", ")  // Convert string back to array
        colours: toSend
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
            <select id="c1" name="c1" className = "color" value = {colorsAndModes[0][0]} onChange={(e) => change(0,0,e.target.value)}>
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
            <select id="modeSelect1" value = {colorsAndModes[0][1]} onChange={(e) => change(0,1,e.target.value)}>
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c2">Color 2</label>
            <select id="c2" name="c2" className = "color" value = {colorsAndModes[1][0]} onChange={(e) => change(1,0,e.target.value)}>
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
            <select id="modeSelect2" value = {colorsAndModes[1][1]} onChange={(e) => change(1,1,e.target.value)}>
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c3">Color 3</label>
            <select id="c3" name="c3" value = {colorsAndModes[2][0]} onChange={(e) => change(2,0,e.target.value)}>
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
            <select id="c4" name="c4" value = {colorsAndModes[3][0]} onChange={(e) => change(3,0,e.target.value)}>
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
            <select id="modeSelect4" value = {colorsAndModes[3][1]} onChange={(e) => change(3,1,e.target.value)}>
                <option value="normal">Normal</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div className="color-select">
            <label for="c5">Color 5</label>
            <select id="c5" name="c5" value = {colorsAndModes[4][0]} onChange={(e) => change(4,0,e.target.value)}>
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
            <select id="modeSelect5" value = {colorsAndModes[4][1]} onChange={(e) => change(4,1,e.target.value)}>
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
            <select
              value={detectedMediums}
              onChange={(e) => setDetectedMediums(e.target.value)}
              className="detected-info"
            >
              <option value="paint">Paint</option>
              <option value="pencil crayons">Pencil Crayons</option>
              <option value="marker">Marker</option>
            </select>
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