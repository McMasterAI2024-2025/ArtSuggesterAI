import React, { useRef, useState, useEffect } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ setUploadFile, setPanelOpen }) => {
  // states to track camera activity and captured image activity
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // getUserMedia api
  useEffect(() => {
    // browser support => activate camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        })
        .catch((err) => {
          console.error("Error accessing the camera:", err);
        });
    }
    // clean stream i.e. stop camera video feed
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // use canvas to draw image
  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // get current video frame and draw to image
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL('image/jpeg');
    setImageCaptured(capturedImage);
    setUploadFile(dataURLtoFile(capturedImage, "captured-image.jpg"));
  };

  // convert Base64 data to image file
  const dataURLtoFile = (dataURL, filename) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // return .jpg file from byte arr
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
