import React from 'react';
import AppBar from 'material-ui/AppBar';

import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';

/**
 * A simple example of `AppBar` with an icon on the right.
 * By default, the left icon is a navigation-menu.
 */
const AppBarExampleIcon = () => (
  <AppBar
    title="Title"
    iconClassNameRight="muidocs-icon-navigation-expand-more"
  />
);

function handleTouchTap() {
  alert('onTouchTap triggered on the title component');
}

const styles = {
  title: {
    cursor: 'pointer',
  },
};

const AppBarExampleIconButton = () =>(
    <AppBar
        title={<span style={styles.title}>Title</span>}
        onTitleTouchTap={handleTouchTap}
        iconElementLeft={<IconButton><NavigationClose /></IconButton>}
        iconElementRight={<FlatButton label="Save" />}
    />
);

export default {
    AppBarExampleIcon:AppBarExampleIcon,
    AppBarExampleIconButton:AppBarExampleIconButton
};