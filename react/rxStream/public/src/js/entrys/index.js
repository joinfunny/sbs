 import React from 'react';
 import { render } from 'react-dom';
 import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexLink} from 'react-router';

 import Header from '../components/header/header.js';


render((
    <Header />
), document.getElementById('app'));

