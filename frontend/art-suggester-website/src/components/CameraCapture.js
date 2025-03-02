import React, { useRef, useState, useEffect } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ setUploadFile, setPanelOpen, deviceId }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });

        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      } catch (err) {
        console.error("Error accessing the camera:", err);
      }
    };

    if (deviceId) startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL('image/jpeg');
    setImageCaptured(capturedImage);
    setUploadFile(dataURLtoFile(capturedImage, "captured-image.jpg"));
  };

  const dataURLtoFile = (dataURL, filename) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="camera-capture-container">
      <div className="camera-preview">
        <video ref={videoRef} autoPlay></video>
        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
      </div>

      <div className="capture-actions">
        <button onClick={captureImage} disabled={!isCameraActive}>Capture</button>
        {imageCaptured && (
          <div>
            <img src={imageCaptured} alt="Captured" style={{ maxWidth: '300px', marginTop: '10px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
