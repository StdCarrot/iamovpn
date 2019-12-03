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
    Grid,
    ButtonGroup,
    Button,
    Modal,
    Paper,
    TextareaAutosize
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';



import PasswordForm from "./PasswordForm";
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
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    configArea: {
        width: '100%'
    }
});

class MyPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changePassword: false
        };
    }

    logout() {
        const { dispatch } = this.props;

        dispatch(userActions.logout())
            .then((response) => {
                history.push('/')
            });
    }

    getConfig() {
        const { dispatch } = this.props;
        dispatch(userActions.getConfig());
    }

    handlePasswordForm(success) {
        if (success) {
            this.setState({
                changePassword: false
            });
        }
    }

    render() {
        const { classes, config } = this.props;

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
                            {/* Recent Orders */}
                            <Grid item xs={12}>
                                <Modal
                                    className={classes.modal}
                                    open={this.state.changePassword}
                                    onClose={() => this.setState({changePassword: false})}
                                >
                                    <Paper className={classes.paper}>
                                        <PasswordForm callback={this.handlePasswordForm.bind(this)}/>
                                    </Paper>
                                </Modal>
                                <ButtonGroup fullWidth>
                                    <Button fullWidth onClick={() => this.setState({changePassword: true})}>
                                        Change Password
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                            <Grid item xs={12}>
                                <ButtonGroup fullWidth>
                                    <Button fullWidth onClick={this.getConfig.bind(this)}>
                                        OpenVPN Configuration
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                                {config?
                                    <Grid item xs={12}>
                                        <Typography>
                                            Copy and save below text as "iamovpn.ovpn".
                                        </Typography>
                                        <TextareaAutosize
                                            className={classes.configArea}
                                            rowsMax={50}
                                            value={config}
                                        />
                                    </Grid>
                                :null}
                        </Grid>
                        <Divider />
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
        me: state.user.get('me'),
        config: state.user.get('config')
    }
};
export default connect(mapStateToProps)(withStyles(styles)(MyPage));