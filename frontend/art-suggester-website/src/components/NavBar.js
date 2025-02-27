import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './NavBar.css';

export default function NavBar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className='nav-header'>
            <nav className='nav'>
                <img src="/images/logo.png" alt="logo" className='nav-logo' />
                <ul className='nav-links'>
                    <li><a href="/">Home</a></li>
                    <li>{user ? 
                        <a href="/favourites">Favourites</a> : 
                        <a href="/login">Favourites</a>
                    }</li>
                    <li><a href="/about">About</a></li>
                </ul>
                <div className='user-section'>
                    {user ? 
                        <button onClick={logout}>Log Out</button> : 
                        <a href="/login">Log In</a>
                    }
                </div>
            </nav>
        </header>
    )
}