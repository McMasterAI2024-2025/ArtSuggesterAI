/*
 * Johann Caancan
 */
import "./Suggested.css"
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";

export default function Suggested() {
    const [suggested, setSuggested] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const userEmail = "test@example.com"; // Replace with actual logged-in user email
    const userPassword = "password"; // Replace with actual logged-in user password

    useEffect(() => {
        fetchSuggestedImages();
        fetchFavourites();
        
        // temp
        console.log(`Favourites: ${favourites}`);
    }, []);

    function fetchSuggestedImages() {
        let images = [];
        let index = 0;

        // Fetch the length of suggested images from the backend
        fetch("http://localhost:5000/getSuggestedImagesLength")
            .then(response => response.json())
            .then(data => {
                const totalImages = data.length;
                console.log("Total images available:", totalImages);

                // Now fetch images one by one based on the total count
                function fetchNextImage() {
                    if (index >= totalImages) {
                        console.log("All images have been fetched.");
                        return; // Stop if we've reached the total number of images
                    }

                    fetch(`http://localhost:5000/suggestedImages/${index}`)
                        .then(response => response.blob())
                        .then(blob => {
                            const imgUrl = URL.createObjectURL(blob);
                            images.push(imgUrl);
                            setSuggested([...images]); // Update state

                            index++; // Move to the next image index
                            fetchNextImage(); // Recursively fetch next image
                        })
                        .catch(error => {
                            console.error("Error fetching suggested images:", error);
                        });
                }

                fetchNextImage(); // Start fetching images
            })
            .catch(error => {
                console.error("Error fetching images length:", error);
            });
    }

    function fetchFavourites() {
        fetch(`http://localhost:5000/getFavImages/${userEmail}/${userPassword}`)
            .then(response => response.json())
            .then(data => {
                setFavourites(data);
            })
            .catch(error => console.error("Error fetching favourites:", error));
    }

    function toggleFavourite(img) {
        let updatedFavourites;
        const imageUrl = encodeURIComponent(img);  // Encode image URL properly
    
        if (favourites.includes(img)) {
            updatedFavourites = favourites.filter(fav => fav !== img);
            // Sending the image URL in the request body as JSON
            fetch(`http://localhost:5000/removeFavImage/${userEmail}/${userPassword}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ imageUrl: imageUrl })  // Sending image URL in the body
            });
        } else {
            updatedFavourites = [...favourites, img];
            // Sending the image URL in the request body as JSON
            fetch(`http://localhost:5000/addFavImage/${userEmail}/${userPassword}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ imageUrl: imageUrl })  // Sending image URL in the body
            });
        }
        setFavourites(updatedFavourites);
    }

    function downloadImage(imgUrl) {
        const link = document.createElement("a");
        link.href = imgUrl;
        link.download = "image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <NavBar />
            <h2>Suggested Page</h2>
            <div className="main">
                <ul className = 'favourites'>
                    {suggested.map ((img, index) => {
                        return (
                            <div className="favItem" key={index}>
                                <img src={img} alt="Suggested" className="img"/>
                                <div className="icons">
                                    <FontAwesomeIcon 
                                        icon={faDownload} 
                                        className="download" 
                                        onClick={() => downloadImage(img)}
                                    />
                                    <FontAwesomeIcon 
                                        icon={favourites.includes(img) ? faStar : faStarOutline} 
                                        className="star" 
                                        onClick={() => toggleFavourite(img)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </ul>
            </div>
            
            
        </>
    );
};