import React, { useState, useCallback, useMemo } from 'react';
import Lightbox from 'lightbox-react';
import { useUserFacade } from '../hooks/user.hook';
import '../styles/Login.scss';

const LoginConfirm: React.FC = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [{ isLoginConfirmShown }, , , , , showLoginConfirm, loginConfirm] = useUserFacade();

    const handleSubmit = useCallback(async () => {
        const loginElement = document.getElementById('loginconfirm-email') as HTMLInputElement;
        if (loginElement && loginElement.value) {
            setEmail(loginElement.value);
            try {
                await loginConfirm(loginElement.value);
                showLoginConfirm(false);
            } catch (e) {
                window.alert(e);
            }
        }
    }, [setEmail]);

    const LoginContent = useMemo(() => (
        <div className="Login Lightbox-container">
            <h2 className="Login-title Lightbox-title">Confirm Email</h2>
            <div className="Login-step Login-step--active Lightbox-section">
                <h3>Signing in with a new device?</h3>
                <small><label htmlFor="loginconfirm-email">Confirm your email</label></small>
                <input
                    autoFocus
                    id="loginconfirm-email"
                    type="text"
                    placeholder="email"
                    onKeyUp={(evt) => evt.key === 'Enter' && handleSubmit()}
                />
                <button onClick={handleSubmit}>Submit</button>
            </div>
            <div className="Login-step Login-step--active Lightbox-section">
                <h3>Not your login link?</h3>
                <a className="LoginConfirm-cancel" href="/">Continue without Logging In</a>
            </div>
        </div>
    ), [handleSubmit, email]);

    const closeLightbox = useCallback(() => {
        setEmail(null);
        showLoginConfirm(false);
    }, [setEmail]);

    if (!isLoginConfirmShown) {
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
}

export default LoginConfirm;