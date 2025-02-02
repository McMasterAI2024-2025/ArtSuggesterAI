import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Favourites from './pages/Favourites';
import Suggested from './pages/Suggested';
import NoPage from './pages/NoPage';
import './App.css';
import "@fontsource/fira-code";
import CreateAccount from './pages/CreateAccount';

function App() {
  //Favourite list updating
  const [numFavs, setNumFavs] = useState(0);
  const [favourites, setFavorutites] = useState ([]);

    function addFav (){
        setNumFavs(numFavs + 1);
        const newFav = [...favourites, numFavs];
        setFavorutites(newFav);
        console.log(numFavs)
    }

    function delFav(toDelIndex){
        const newFav = favourites.filter((favItem,favIndex) => favIndex !== toDelIndex);
        setFavorutites (newFav);

    }
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/favourites" element={<Favourites numFavs = {numFavs} setNumFavs = {setNumFavs} addFav = {addFav}
                                              setFavorutites = {setFavorutites} favourites = {favourites} delFav = {delFav}/>} />
          <Route path="/suggested" element={<Suggested />} />
          <Route path = "/createAccount" element={<CreateAccount/>} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
