import './UploadSection.css';
import DragNdrop from './DragNDrop';
import React, { useState, useContext } from 'react';
import CameraCapture from './CameraCapture';
import { AuthContext } from '../AuthContext';
import { useNavigate } from "react-router-dom";

export default function UploadSection({ uploadFile, setUploadFile, panelOpen, setPanelOpen, setUploadData }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // webcam state control for showing and hiding the webcam preview
    const [showCamera, setShowCamera] = useState(false);

    const uploadBtnClick = async () => {
        // Redirect to login page if user is not logged in
        if (!user) {
            navigate("/login");
            return;
        }

        if (panelOpen || uploadFile == null) return;

        // form field and associated value
        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            // post request to the flask backend to upload the file
            const response = await fetch('http://localhost:5000/uploadFile', {
                method: 'POST',
                body: formData,
            });

            // check for upload success
            const result = await response.json();
            if (response.ok) {
                console.log('File uploaded successfully:', result);
                setUploadData(result); // You'll need to add this as a prop
            } else {
                console.error('Upload failed:', result, result.colours);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        setPanelOpen(true);
    }

    return (
        <>
            <div className="upload-section">
                <DragNdrop uploadFile={uploadFile} setUploadFile={setUploadFile} />
                <button 
                    className="take-photo-btn" 
                    onClick={() => setShowCamera(prevState => !prevState)} // toggle camera visibility
                >
                    {showCamera ? 'Close Webcam' : 'Open Webcam' /* change button name when camera state is toggled */ }
                </button>
                {showCamera && (
                    <CameraCapture setUploadFile={setUploadFile} setPanelOpen={setPanelOpen} />
                )}
                <button className="upload-btn" onClick={uploadBtnClick}>Upload</button>
                <p className="supported-types">Supported file types: .pdf, .jpg, .webp, ...</p>
            </div>
        </>
    );
};
