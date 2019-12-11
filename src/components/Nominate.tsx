import React, { useCallback, useState } from 'react';
import Lightbox from 'lightbox-react';
import { usePollsFacade } from '../hooks/polls.hook';
import { useUserFacade } from '../hooks/user.hook';
import '../styles/Nominate.scss';

const NominateForm: React.FC = () => {
    const [
        {
            activePoll
        },
        ,
        ,
        ,
        ,
        ,
        ,
        addPollOption,
        ,
        ,
        ,
    ] = usePollsFacade();

/*     const handleSubmit = useCallback(() => {
        const idElement = document.getElementById('nominate-id') as HTMLInputElement;
        const trailerElement = document.getElementById('nominate-trailer') as HTMLInputElement;

        if (idElement && idElement.value && trailerElement && trailerElement.value) {
            addPollOption(activePoll.id, idElement.value, )
        }
    }, [setUISubmit, setEmail]); */

    return (
        <div className="NominateForm Lightbox-container">
            <h2 className="Lightbox-title">Nominate a movie</h2>
            <div className="Lightbox-section">
                <h3><label htmlFor="nominate-id">IMDB id</label></h3>
                <small>https://www.imdb.com/title/<em>id</em></small>
                <input
                    autoFocus
                        id="nominate-id"
                        type="text"
                        placeholder="tt5311514"
                />
            </div>
            <div className="Lightbox-section">
                <h3><label htmlFor="nominate-trailer">Youtube Trailer Link</label></h3>
                <small>Example: <a
                        href="https://www.youtube.com/watch?v=xU47nhruN-Q"
                        target="_blank"
                    >
                        https://www.youtube.com/watch?v=xU47nhruN-Q
                    </a>
                </small>
                <input
                    id="nominate-trailer"
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=xU47nhruN-Q"
                />
            </div>
            <div className="Lightbox-section">
                <button>Submit Nomination</button>
            </div>
        </div>
    );
}

const Nominate: React.FC = () => {
    const [isNominating, setIsNominating] = useState(false);
    const closeLightbox = useCallback(() => setIsNominating(false), [setIsNominating]);
    const openLightbox = useCallback(() => setIsNominating(true), [setIsNominating]);
    const [userState, , , , showLogin] = useUserFacade();
    return (
            <>
            <div className="Nominate">
                <h2 className="Nominate-title">Have another suggestion?</h2>
                {
                    userState.user 
                        ? (
                            <button
                            className="Nominate-button"
                            onClick={openLightbox}
                        >
        
                            <span className="Nominate-icon">+</span>
                            Nominate Movie
                        </button>
                        )
                        : (
                            <button
                            className="Nominate-button"
                            onClick={() => showLogin(true)}
                        >
        
                            Login to Nominate
                        </button>
                        )
                }
            </div>
            { userState.user && isNominating && (
                <Lightbox
                    // @ts-ignore
                    mainSrc={<NominateForm onSubmit={closeLightbox} user={userState.user} />}
                    onCloseRequest={closeLightbox}
                    enableZoom={false}

                />
            )}
        </>
    );
}

export default Nominate;