import './UploadSection.css';
import DragNdrop from './DragNDrop';
import React, { useState, useContext, useEffect } from 'react';
import CameraCapture from './CameraCapture';
import { AuthContext } from '../AuthContext';
import { useNavigate } from "react-router-dom";

export default function UploadSection({ uploadFile, setUploadFile, panelOpen, setPanelOpen, setUploadData }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showCamera, setShowCamera] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState("");

    useEffect(() => {
        // Fetch available cameras
        navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            const videoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
        });
    }, []);

    const uploadBtnClick = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (panelOpen || uploadFile == null) return;

        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            const response = await fetch('http://localhost:5000/uploadFile', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                console.log('File uploaded successfully:', result);
                setUploadData(result);
            } else {
                console.error('Upload failed:', result, result.colours);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        setPanelOpen(true);
    }

    return (
        <div className="upload-section">
            <DragNdrop uploadFile={uploadFile} setUploadFile={setUploadFile} />
            
            <button 
                className="take-photo-btn" 
                onClick={() => setShowCamera(prev => !prev)}
            >
                {showCamera ? 'Close Webcam' : 'Open Webcam'}
            </button>

            {showCamera && (
                <>
                    <label>Choose Camera:</label>
                    <select 
                        value={selectedDeviceId} 
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                    >
                        {devices.map((device, index) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${index + 1}`}
                            </option>
                        ))}
                    </select>
                    
                    <CameraCapture 
                        setUploadFile={setUploadFile} 
                        setPanelOpen={setPanelOpen} 
                        deviceId={selectedDeviceId} // Pass selected camera
                    />
                </>
            )}

            <button className="upload-btn" onClick={uploadBtnClick}>Upload</button>
            <p className="supported-types">Supported file types: .pdf, .jpg, .webp, ...</p>
        </div>
    );
};
