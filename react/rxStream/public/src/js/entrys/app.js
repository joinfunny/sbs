import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MyAwesomeReactComponent from '../material-ui/MyAwesomeReactComponent';
import AppBar from '../material-ui/appBar';

const AppBarComponent = () => (
  <MuiThemeProvider>
    <AppBar.AppBarExampleIcon />
  </MuiThemeProvider>
);

const App = () => (
  <MuiThemeProvider>
    <MyAwesomeReactComponent />
  </MuiThemeProvider >
);

ReactDOM.render(
  <AppBarComponent />,
  document.getElementById('app')
);

/*ReactDOM.render(
  <App />,
  document.getElementById('app')
);*/