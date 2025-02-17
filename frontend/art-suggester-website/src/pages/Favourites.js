import "./Favourites.css"
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faStar } from '@fortawesome/free-solid-svg-icons'

export default function Favourites({ userEmail, userPassword }) {
    const [favourites, setFavourites] = useState([]);  // State for favourites

    // Fetch the user's favourites when the component mounts
    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getFavImages/${userEmail}/${userPassword}`);
                const data = await response.json();
                if (response.ok) {
                    setFavourites(data);  // Set the favourites from the response
                } else {
                    console.error("Failed to fetch favourites:", data);
                }
            } catch (error) {
                console.error("Error fetching favourites:", error);
            }
        };
        fetchFavourites();
    }, [userEmail, userPassword]);  // Dependencies to refetch on email/password change

    // Function to handle removing a favourite
    const delFav = async (index) => {
        const favImage = favourites[index];
        try {
            const response = await fetch(`http://localhost:5000/removeFavImage/${userEmail}/${userPassword}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ imageUrl: favImage })  // Send image URL in the body
            });

            if (response.ok) {
                const updatedFavourites = favourites.filter((fav, i) => i !== index);
                setFavourites(updatedFavourites);  // Update the state after removal
            } else {
                console.error("Failed to remove favourite");
            }
        } catch (error) {
            console.error("Error removing favourite:", error);
        }
    };

    function downloadImage(imgUrl) {
        const link = document.createElement("a");
        link.href = imgUrl;
        link.download = "favourite.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <NavBar />
            <h2>Favourites Page</h2>
            <div className="main">
                <ul className='favourites'>
                    {favourites.map((favItem, index) => {
                        return (
                            <div className="favItem" key={index}>
                                <img src={favItem} alt="favourite" className="img" />
                                <div className="icons">
                                    <FontAwesomeIcon icon={faDownload} className="download" onClick={ downloadImage(favItem) }/>
                                    <FontAwesomeIcon icon={faStar} className="star" onClick={() => { delFav(index) }} />
                                </div>
                            </div>
                        );
                    })}
                </ul>
            </div>
        </>
    );
};
