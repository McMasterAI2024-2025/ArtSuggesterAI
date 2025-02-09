import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import NavBar from "../components/NavBar";
import './CreateAccount.css';

export default function CreateAccount() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== verifyPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        // Send a POST request to the Flask backend
        try {
            const response = await fetch(`http://localhost:5000/registerUser/${encodeURIComponent(email)}/${encodeURIComponent(password)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.status === 200) {
                setMessage("User added successfully!");
                setTimeout(() => {
                    navigate("/login"); // Use navigate to redirect
                }, 2000); // Delay for 2 seconds to show the success message
            } else {
                setMessage(data.message || "An error occurred. Please try again."); // Display the error message from the backend
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            console.error("Error:", error);
        }
    };

    return (
        <>
            <NavBar />
            <main className="createAccount">
                <h1>Mac AI Art Suggester</h1>
                <h2>SIGN UP</h2>
                <form onSubmit={handleSubmit}>
                    <div className="inputs">
                        <h3 className="inputLabel">Email</h3>
                        <input
                            className="loginInput"
                            placeholder="user@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <h3 className="inputLabel">Password</h3>
                        <input
                            className="loginInput"
                            type="password"
                            placeholder="password123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <h3 className="inputLabel">Verify Password</h3>
                        <input
                            className="loginInput"
                            type="password"
                            placeholder="password123"
                            value={verifyPassword}
                            onChange={(e) => setVerifyPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="Login">
                            Create Account
                        </button>
                        {message && <p className="message">{message}</p>}
                        <div className="line"></div>
                        <p className="noAcc">
                            Already have an account? <a href="/login">Log in!</a>
                        </p>
                    </div>
                </form>
            </main>
        </>
    );
}