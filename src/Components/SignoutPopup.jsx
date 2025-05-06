import React, { useEffect, useState } from 'react';
import '../Styles/SignoutPopup.css'
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faXmark } from '@fortawesome/free-solid-svg-icons';
import FlashyButton from './FlashyButton';
import { Link } from 'react-router';
const SignoutPopup = ({isVisible, setVisibilityOfPopup}) => {
    const navigate = useNavigate();
    const [style, setStyle] = useState({cursor: 'pointer', width: '20px', height: '20px', color:'black'});
    const handleCancel = () => {
        setVisibilityOfPopup(false);
    }
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      };
    const handleHover = () => {
        setStyle({cursor: 'pointer', width: '20px', height: '20px', color: '#c42d1c', transform: 'scale(1.2)', transition: '0.25s'})
    }
    const handleLeave = () => {
        setStyle({cursor: 'pointer', width: '20px', height: '20px', color: 'black', transform: 'scale(1)', transition: '0.25s'})
    }
    return (
        <>
            <div className='containerOfPopupMessage'>
                <div className={isVisible ? 'visiblePopup' : 'hiddenPopup'}>
                    <div className="containerOfIconsOfPopup">
                        <FontAwesomeIcon icon={faDoorOpen} style={{width: '25px', height: '25px', color: '#c42d1c'}}/>
                        <FontAwesomeIcon icon={faXmark} style={style}onClick={handleCancel}onMouseEnter={handleHover} onMouseLeave={handleLeave}/>
                    </div>
                    <div className="textOfPopup">
                        <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Exiting</h2>
                        <p>Are you sure you want to exit?</p>
                    </div>
                    <div className="containerOfButtonsOfPopup">
                        <FlashyButton textInsideButton={"Cancel"} handleClick={handleLogout}/>
                        <FlashyButton textInsideButton={"Yes"} handleClick={handleClick}/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignoutPopup;
