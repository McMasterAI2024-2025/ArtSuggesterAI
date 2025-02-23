import "./Suggested.css"
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";

export default function Suggested() {
    const [suggested, setSuggested] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const userEmail = "test"; // Replace with actual logged-in user email
    const userPassword = "test"; // Replace with actual logged-in user password

    useEffect(() => {
        fetchSuggestedImages();
        fetchFavourites();
    }, []);

    function fetchSuggestedImages() {
        fetch("http://localhost:5000/getSuggestedImagesLength")
            .then(response => response.json())
            .then(data => {
                const totalImages = data.length;
                const imagePromises = [];
    
                for (let index = 0; index < totalImages; index++) {
                    imagePromises.push(
                        fetch(`http://localhost:5000/suggestedImages/${index}`)
                            .then(response => {
                                const filename = response.headers.get('X-Filename');
                                //console.log("Fetched image filename:", filename); // Debugging
    
                                return response.blob().then(blob => {
                                    return { filename: filename || `image_${index}`, url: URL.createObjectURL(blob) };
                                });
                            })
                    );
                }

                Promise.all(imagePromises).then(images => {
                    console.log("Final suggested images array:", images); // Debugging
                    setSuggested(images);
                });
            })
            .catch(error => console.error("Error fetching suggested images:", error));
    }

    function fetchFavourites() {
        fetch(`http://localhost:5000/getFavImages?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched favourites:", data);

            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            // Extract filenames only
            const filenames = data.favourites;
            setFavourites(filenames);
        })
        .catch(error => console.error("Error fetching favourites:", error));
    }

    function toggleFavourite(filename) {
        if (favourites.includes(filename)) {
            // Remove from favourites
            fetch(`http://localhost:5000/removeFavImage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, password: userPassword, filename })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error removing favorite:", data.error);
                    return;
                }
                setFavourites(favourites.filter(fav => fav !== filename));
            })
            .catch(error => console.error("Error removing favorite:", error));
        } else {
            // Add to favourites
            fetch(`http://localhost:5000/addFavImage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, password: userPassword, filename })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error adding favorite:", data.error);
                    return;
                }
                setFavourites([...favourites, filename]);
            })
            .catch(error => console.error("Error adding favorite:", error));
        }
    }

    function downloadImage(imgUrl) {
        const link = document.createElement("a");
        link.href = imgUrl;
        link.download = "suggested_image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <NavBar />
            <h2>Suggested Page</h2>
            <div className="main">
                <ul className='favourites'>
                    {suggested.map(({ filename, url }) => (
                        <div className="favItem" key={filename}>
                            <img src={url} alt="Suggested" className="img"/>
                            <div className="icons">
                                <FontAwesomeIcon 
                                    icon={faDownload} 
                                    className="download" 
                                    onClick={() => downloadImage(url)}
                                />
                                <FontAwesomeIcon 
                                    icon={favourites.includes(filename) ? faStar : faStarOutline} 
                                    className="star" 
                                    onClick={() => toggleFavourite(filename)}
                                />
                            </div>
                        </div>
                    ))}
                </ul>
            </div>
        </>
    );
};