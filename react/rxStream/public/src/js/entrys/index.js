
import React from 'react'
import { render } from 'react-dom'
// 引入React-Router模块
import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexLink} from 'react-router';

import Header from '../components/header/header.js';

render((
    <Header />
), document.getElementById('app'));

