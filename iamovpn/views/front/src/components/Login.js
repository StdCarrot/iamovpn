import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Box,
    Typography,
    Container
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

import Copyright from "./Copyright";

import history from "../history";
import * as userActions from '../modules/user';


const styles = theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
});


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: {
                value: '',
                error: false
            },
            password: {
                value: '',
                error: false
            }
        };
    }

    handleChange(e) {
        let value = e.target.value;
        let error = false;
        if (value.length < 4) {
            error = true
        }

        this.setState({
            [e.target.name]: {
                value: value,
                error: error
            }
        });
    }

    handleSubmit(e) {
        const { dispatch, enqueueSnackbar } = this.props;
        let state = this.state;
        let error = false;

        ['id', 'password'].forEach(k => {
            if (state[k].value < 4) {
                error = state[k].error = true;
            }
        });
        if (error) {
            this.setState(state);
        } else {
            dispatch(
                userActions.login(
                    state.id.value,
                    state.password.value
                )
            ).then(response => {
                const user = response.payload.data.user;
                if (user.admin === true) {
                    history.push('/dashboard');
                } else {
                    history.push('/my');
                }
            })
            .catch(response => {
                const {id, password} = this.state;
                const {status, data} = response.error.response;
                if (data.hasOwnProperty('errors')) {
                    Object.values(data.errors).forEach(msg => {
                        enqueueSnackbar(msg, {variant: "error"});
                    });
                } else {
                    enqueueSnackbar(`${status}: ${data.message}`, {variant: "error"});
                }

                id.error = password.error = true;
                this.setState({
                    id: id,
                    password: password
                });
            });
        }

        e.preventDefault();
    }

    render() {
        const { classes } = this.props;

        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form
                        onSubmit={this.handleSubmit.bind(this)}
                        className={classes.form}
                        noValidate
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="id"
                            label="ID"
                            name="id"
                            autoComplete="id"
                            autoFocus
                            value={this.state.id.value}
                            error={this.state.id.error}
                            onChange={this.handleChange.bind(this)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={this.state.password.value}
                            error={this.state.password.error}
                            onChange={this.handleChange.bind(this)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright/>
                </Box>
            </Container>
        );
    }
}

export default connect()(withSnackbar(withStyles(styles)(Login)));
