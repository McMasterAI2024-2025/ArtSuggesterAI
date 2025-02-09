/*
 * Harrison Johns
 * 
 * To-be-added:
 * get profile pic from firebase
 * make responsive (css)
 */

import './NavBar.css';

export default function NavBar() {
    return (
        <header className='nav-header'>
            <nav className='nav'>
                <img src="/images/logo.png" alt="logo" className='nav-logo' />
                <ul className='nav-links'>
                    <li><a href="/">Home</a></li>
                    <li><a href="/favourites">Favourites</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
                <div className='user-section'>
                    <a href="/login">Log Out</a>
                    {/*<img src="/images/temp-pfp.jpg" alt="profile" className='nav-profile-pic' />*/}
                </div>
            </nav>
        </header>
    )
}