import React, { useCallback, useMemo, useState } from 'react';
import Lightbox from 'lightbox-react';
import { useUserFacade } from '../hooks/user.hook';
import '../styles/Login.scss';

const Login: React.FC = () => {
    const [submitted, setUISubmit] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [{ isLoginShown }, login, , , showLogin] = useUserFacade();
    
    const handleSubmit = useCallback(() => {
        setUISubmit(true);
        const loginElement = document.getElementById('login-email') as HTMLInputElement;
        if (loginElement && loginElement.value) {
            setEmail(loginElement.value);
            login(loginElement.value);
        }
    }, [setUISubmit, setEmail]);

    const LoginContent = useMemo(() => (
        <div className="Login Lightbox-container">
            <h2 className="Login-title Lightbox-title">Login to Vote</h2>
            <div className={submitted ? "Login-step Lightbox-section" : "Login-step Lightbox-section Login-step--active"}>
                <h3>Step 1: <label htmlFor="login-email">Login with email</label></h3>
                <small>We only send you a sign-in link, no other emails!</small>
                <input
                    autoFocus
                    id="login-email"
                    type="text"
                    placeholder="email"
                    disabled={submitted}
                    onKeyUp={(evt) => evt.key === 'Enter' && handleSubmit()}
                />
                <button onClick={handleSubmit} disabled={submitted}>Submit</button>
            </div>
            <div className={submitted ? "Login-step Lightbox-section Login-step--active" : "Login-step Lightbox-section"}>
                <h3>Step 2: Check your email</h3>
                {email && <small>Email sent to <strong>{email}</strong></small>}
            </div>
        </div>
    ), [handleSubmit, submitted, email]);

    const closeLightbox = useCallback(() => {
        setEmail(null);
        setUISubmit(false);
        showLogin(false);
    }, [setEmail, setUISubmit]);

    if (!isLoginShown) {
        return null;
    }

    return (
        <Lightbox
            // @ts-ignore
            mainSrc={LoginContent}
            onCloseRequest={closeLightbox}
            enableZoom={false}
        />
    )
};

export default Login;