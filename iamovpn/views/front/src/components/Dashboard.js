import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    CssBaseline,
    Box,
    AppBar,
    Toolbar,
    Typography,
    Divider,
    IconButton,
    Container,
    Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';

import UserList from "./UserList";
import LogList from "./LogList";
import Copyright from "./Copyright";
import * as userActions from "../modules/user";
import history from "../history";


const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    }
});

class Dashboard extends Component {
    logout() {
        const { dispatch } = this.props;

        dispatch(userActions.logout())
            .then((response) => {
                history.push('/')
            });
    }

    render() {
        const { classes, me } = this.props;
        if (!(me || {admin: false}).admin) return null;

        return (
            <div className={classes.root}>
                <CssBaseline/>
                <AppBar position="absolute" className={classes.appBar}>
                    <Toolbar className={classes.toolbar}>
                        <Typography component="h1" variant="h6" color="inherit" noWrap className={`${classes.title} ${classes.paper}`}>
                            IAMOVPN
                        </Typography>

                        <IconButton color="inherit"
                                    onClick={this.logout.bind(this)}>
                            <PowerSettingsNewIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <main className={classes.content}>
                    <div className={classes.appBarSpacer}/>
                    <Container maxWidth="lg" className={classes.container}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <UserList size={5}/>
                            </Grid>
                        </Grid>
                        <Divider />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <LogList size={5}/>
                            </Grid>
                        </Grid>
                        <Box pt={4}>
                            <Copyright/>
                        </Box>
                    </Container>
                </main>
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        me: state.user.get('me')
    }
};
export default connect(mapStateToProps)(withStyles(styles)(Dashboard));