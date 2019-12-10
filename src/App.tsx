import React, { useState, useCallback } from 'react';
import './styles/App.scss';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Poll from './components/Poll';
import Footer from './components/Footer';
import Admin from './components/Admin';
import Login from './components/Login';
import LoginConfirm from './components/LoginConfirm';
import Debug from './components/Debug';
import { useUserSetup } from './hooks/user.hook';

const App: React.FC = () => {
    useUserSetup();

    return (
        <div className="App">
            {/* <Debug /> */}
            <Admin />
            <Login />
            <LoginConfirm />
            <Header />
            <div className="PollArea Container">
                <h2 className="PollAreaHeader">Vote For The Next Movie!</h2>
                <Tabs />
                <Poll />
            </div>
            <Footer />
        </div>
    );
}

export default App;
