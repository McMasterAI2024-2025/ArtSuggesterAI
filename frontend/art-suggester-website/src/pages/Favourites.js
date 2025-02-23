import "./Favourites.css";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faStar, faVectorSquare } from "@fortawesome/free-solid-svg-icons";

export default function Favourites({ userEmail, userPassword }) {
    const [favourites, setFavourites] = useState([]);

    // Fetch the user's favourites when the component mounts
    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getFavImages?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}`);
                const data = await response.json();
                if (response.ok) {
                    console.log(data);
                    setFavourites(data.favourites);
                } else {
                    console.error("Failed to fetch favourites:", data);
                }
            } catch (error) {
                console.error("Error fetching favourites:", error);
            }
        };
        fetchFavourites();
    }, [userEmail, userPassword]);

    const delFav = async (filename) => {
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
            setFavourites(favourites.filter(fav => fav.filename !== filename));
        })
        .catch(error => console.error("Error removing favorite:", error));
    };

    function downloadImage(file_id) {
        const imgUrl = `http://localhost:5000/serveImage/${file_id}`;
        const link = document.createElement("a");
        link.href = imgUrl;
        link.download = "favourite_image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <NavBar />
            <h2>Favourites</h2>
            <div className="main">
                {favourites.length > 0 ? (
                    <ul className="favourites">
                        {favourites.map((favItem, index) => (
                            <div className="favItem" key={index}>
                                <img 
                                    src={`http://localhost:5000/serveImage/${favItem.file_id}`} 
                                    alt="favourite" 
                                    className="img" 
                                />
                                <div className="icons">
                                    <FontAwesomeIcon 
                                        icon={faDownload} 
                                        className="download" 
                                        onClick={() => downloadImage(favItem.file_id)} 
                                    />
                                    <FontAwesomeIcon 
                                        icon={faStar} 
                                        className="star" 
                                        onClick={() => delFav(favItem.filename)} 
                                    />
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p>No favourites found.</p>
                )}
            </div>
        </>
    );
};
