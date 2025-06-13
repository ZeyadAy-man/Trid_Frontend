import React from 'react';
import './AdminCard.css';
import { Link } from 'react-router';

const AdminCard = ({path, fullName, profileImage, email}) => {
    return (
        <section className="userCardContainer" aria-label="Admin Card">
            <img src={profileImage} alt="Admin avatar" className="imageOfUser" />
            <div className="userNameAndAddressContainer">
                <span className="userNameTitle">{fullName}</span>
                <span className="addressTitle">{email}</span>
            </div>
            <div className="containerOfButtons">
                <Link to={path}>
                    <button className="button" type="button">Show</button>
                </Link>
            </div>
        </section>
    );
};

export default AdminCard;
