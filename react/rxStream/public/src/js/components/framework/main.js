'use stricts';
import React from "react";
import { render } from "react-dom";

export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            content:'欢迎'
        }
    }

    render() {
        return (
            <div className="main">
            {
                this.state.content ||''
            }
            </div>
        )
    }
};