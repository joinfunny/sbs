'use stricts';
import React from "react";
import { render } from "react-dom";
import AppSelector from "./header/app-selector";
import AppRealTimer from "./header/app-real-time";
import UserProfile from "./header/user-profile";

export default class Header extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        
        return (
            <div className="header">
                <div className="header-left">
                    <AppSelector />
                </div>
                <AppRealTimer />
                <div className="header-right">
                    <UserProfile />
                </div>
            </div>
        )
    }
};