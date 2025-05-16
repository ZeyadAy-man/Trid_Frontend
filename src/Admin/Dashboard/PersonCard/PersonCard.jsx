import React, { useState } from 'react';
import './PersonCard.css';

const PersonCard = ({ givenOption }) => {
    const options = ['User', 'Admin', 'ShopOwner'];
    const [selectedValue, setSelectedValue] = useState(givenOption || options[0]);

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    return (
        <section className='personCardContainer' aria-label='Person Card'>
            <div className="detailsOfPersonContainer">
                <img src='../OLP.jpg' alt="Person avatar" className='imageOfPerson' />
                <div className="userNameAndEmailContainer">
                    <span className='name'>Zeyad Ayman</span>
                    <span className='email'>zeyad@gmail.com</span>
                </div>
            </div>
            <div className="roleOfPerson">
                <label htmlFor="Role" className="visually-hidden">Role</label>
                <select id="Role" value={selectedValue} onChange={handleChange}>
                    {options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <div className="dateOfJoiningContainer">
                <p>2/28/2025</p>
            </div>
            <button type="button" className='buttonOfEditPerson'>Edit</button>
        </section>
    );
};

export default PersonCard;
