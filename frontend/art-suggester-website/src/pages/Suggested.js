/*
 * Johann Caancan
 */
import "./Suggested.css"
import { useState } from "react";
import NavBar from "../components/NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faDownload, faStar } from '@fortawesome/free-solid-svg-icons'

export default function Suggested() {
    const [numSuggested, setNumSuggested] = useState(8);
    const [suggested, setSuggested] = useState ([1,2,3,4,5,6,7,8]);
    
    function addFav (){
        setNumSuggested(numSuggested + 1);
        const newSuggested = [...suggested, numSuggested];
        setSuggested(newSuggested);
    }

    function delFav(toDelIndex){
        const newSuggested = suggested.filter((suggestedItem,index) => suggestedItem !== index);
        setSuggested (newSuggested);
    }

    return (
        <>
            <NavBar />
            <h2>Suggested Page</h2>
            {/* <button onClick={() => {addFav()}}>Add Favourite</button> */}
            <div className="main">
            <ul className = 'favourites'>
            {suggested.map ((suggestedItem, index) => {
                return (
                    <div className="favItem" key = {index}>
                        {/* <li>{suggestedItem}</li> */}
                        <img src={`http://localhost:5000/suggestedImages/${index}`} alt="image" className="img"/>
                        {
                        <div className="icons">
                            <FontAwesomeIcon icon={faDownload} className="download"/>
                            <FontAwesomeIcon icon={faStar} className="star" onClick={() => delFav(index)}/>
                        </div>}
                    </div>
                )
            }
                            )
            }
            </ul>
            </div>
            
            
        </>
    );
};