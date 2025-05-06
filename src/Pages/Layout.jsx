import React, { useState } from "react"
import SideBar from "../Components/SideBar"
import { Outlet } from "react-router"
import SignoutPopup from "../Components/SignoutPopup";

export default function Layout(){
    const [isVisible, setIsVisible] = useState(false);
    return(
        <div>
            <SignoutPopup isVisible={isVisible} setVisibilityOfPopup={setIsVisible}/>   
            <SideBar setVisibilityOfPopup={setIsVisible}/>
            <main style={{marginLeft: '10px'}}>
                <Outlet/>
            </main>
        </div>
    )
}