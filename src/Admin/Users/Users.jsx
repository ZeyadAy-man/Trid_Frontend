import {SearchIcon } from "lucide-react";
import "./Users.css"
export default function Users(){
    return(
        <div className="containerOfUsersPage">
            <div className="search-bar">
                <SearchIcon className="search-icon" />
                <input 
                    className="search-input"
                    type="text"
                    placeholder="Search..."
                    />
                <button className="search-button"
                    onClick={() => console.log("Search button clicked")}
                    // TODO: implement search functionality
                >Search</button>
            </div>
            <h1>Users</h1>

        </div>
    )
}