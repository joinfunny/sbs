 import React from 'react';
 import { render } from 'react-dom';
 import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexLink} from 'react-router';

 import Header from '../components/framework/header.js';

 import LeftNavigations from '../components/framework/left.js';

 import Main from '../components/framework/main.js';

render(( 
    <div>
        <Header />
        <LeftNavigations />
        <Main />
    </div>
), document.getElementById('app'));

