import React, { useState } from "react";
import NavBar from "../components/NavBar";
import UploadSection from "../components/UploadSection";
import './Home.css';
import UploadPanel from "../components/UploadPanel";

export default function Home() {
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
    const [uploadData, setUploadData] = useState(null);

    return (
        <>
            <NavBar />
            { uploadPanelOpen && ( <>
                <div className="overlay">
                    <UploadPanel img_url={URL.createObjectURL(uploadFile)} closePanel={() => setUploadPanelOpen(false)} uploadData={uploadData} />
                </div>
            </>)}

            <main className="main-section">
                <img src="images/logoart.png" alt="Art Suggester AI Logo" class="logo"/>
                <p className="home-subtitle">- from the McMaster AI Society</p>
                <UploadSection 
                    uploadFile={uploadFile} 
                    setUploadFile={setUploadFile} 
                    panelOpen={uploadPanelOpen}
                    setPanelOpen={setUploadPanelOpen}
                    setUploadData={setUploadData}  // Pass this to UploadSection
                />
            </main>
        </>
    );
};