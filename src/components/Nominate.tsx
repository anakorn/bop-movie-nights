import React from 'react';
import '../styles/Nominate.scss';

const NominateOption: React.FC = () => (
    <div className="Nominate">
        <h2 className="Nominate-title">Have another suggestion?</h2>
        <button className="Nominate-button">
            <span className="Nominate-icon">+</span>
            Nominate Movie
        </button>
    </div>
);

export default NominateOption;