/*
 * Johann Caancan
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import NavBar from "../components/NavBar";
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form submission

        // Send a POST request to the Flask backend
        try {
            const response = await fetch(`http://localhost:5000/login/${encodeURIComponent(email)}/${encodeURIComponent(password)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.status === 200) {
                setMessage("Login successful!");
                // Redirect to the home page or dashboard after 2 seconds
                setTimeout(() => {
                    navigate("/"); // Replace "/" with the desired route after login
                }, 2000);
            } else {
                setMessage(data.message || "Login failed. Please check your credentials."); // Display error message
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            console.error("Error:", error);
        }
    };

    return (
        <>
            <NavBar />
            <main className="loginPage">
                <h1>Mac AI Art Suggester</h1>
                <h2>LOG IN</h2>
                <form onSubmit={handleLogin}> {/* Wrap inputs in a form */}
                    <div className="inputs">
                        <h3 className="inputLabel">Email</h3>
                        <input
                            className="loginInput"
                            placeholder="johndoe@gmail.com"
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
                        <button type="submit" className="Login">
                            Login
                        </button>
                        {message && <p className="message">{message}</p>} {/* Display success/error message */}
                        <div className="line"></div>
                        <p className="noAcc">
                            Don't have an account? <a href="/createAccount">Register now</a>
                        </p>
                    </div>
                </form>
            </main>
        </>
    );
}