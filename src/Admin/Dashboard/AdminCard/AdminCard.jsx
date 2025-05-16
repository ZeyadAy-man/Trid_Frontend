import React from 'react';
import './AdminCard.css';
import { Link } from 'react-router';

const AdminCard = () => {
    return (
        <section className="userCardContainer" aria-label="Admin Card">
            <img src="../OLP.jpg" alt="Admin avatar" className="imageOfUser" />
            <div className="userNameAndAddressContainer">
                <span className="userNameTitle">Zeyad Ayman</span>
                <span className="addressTitle">Saft El laban, Egypt</span>
            </div>
            <div className="containerOfButtons">
                <Link to="./showAdmin">
                    <button className="button" type="button">Show</button>
                </Link>
                <Link to="./showAdmin">
                    <button className="button" type="button">Edit</button>
                </Link>
            </div>
        </section>
    );
};

export default AdminCard;
