import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    FormControlLabel,
    FormGroup,
    Checkbox,
    TextField,
    Button,
    ButtonGroup,
    Typography
} from '@material-ui/core';
import { withSnackbar } from 'notistack';

import * as userActions from "../modules/user";

const defaultUser = {
    uid: null,
    id: '',
    name: '',
    password: '',
    admin: false,
    active: true
};


class UserForm extends Component {
    constructor(props) {
        super(props);
        const callback = this.props.callback || (() => {});
        const user = this.props.user || defaultUser;

        this.state = {
            callback: callback,
            user: this.marshalUser(user),
            error: {
                id: false,
                name: false,
                password: false,
                admin: false,
                active: false
            }
        };
    };

    marshalUser(user) {
        const marshaled = defaultUser;
        Object.keys(marshaled).forEach(key => {
            if (user[key] || (typeof user[key] === 'boolean')) {
                marshaled[key] = user[key];
            }
        });
        if (user.uid !== null) {
            delete marshaled['password'];
        }
        return marshaled;
    }

    componentDidMount() {
        const {dispatch, enqueueSnackbar, user} = this.props;

        if ((user || null) !== null && (user.uid || null) !== null) {
            dispatch(userActions.get(user.uid))
                .then(response => {
                    this.setState({
                        user: this.marshalUser(response.payload.data.user)
                    });
                }).catch(response => {
                    const {status, data} = response.error.response;
                    enqueueSnackbar(`${status}: ${data.message}`, {variant: "error"});
                })
        } else {
            this.setState({
                user: defaultUser
            });
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const prevUser = prevProps.user || {uid: ''};
        const currentUser = this.props.user || {uid: ''};
        if (prevUser.uid !== currentUser.uid) {
            this.setState({
                user: this.marshalUser(this.props.user || defaultUser)
            });
        }
    };

    handleUserChange(e) {
        const {user} = this.state;
        user[e.target.name] = (typeof user[e.target.name] === "boolean")? e.target.checked : e.target.value;

        this.setState({user: user})
    };

    saveUser() {
        const {dispatch, enqueueSnackbar} = this.props;
        const user = this.state.user;

        if ((user.uid || null) !== null) {
            dispatch(userActions.modify(user.uid, user))
                .then(response => {
                    enqueueSnackbar("Saved", {variant: "success"});
                    this.state.callback(true);
                })
                .catch(response => {
                    const {status, data} = response.error.response;
                    if (data.hasOwnProperty('errors')) {
                        Object.values(data.errors).forEach(msg => {
                            enqueueSnackbar(msg, {variant: "error"});
                        });
                    } else {
                        enqueueSnackbar(`${status}: ${data.message}`, {variant: "error"});
                    }
                })
        } else {
            dispatch(userActions.create(user))
                .then(response => {
                    enqueueSnackbar("Saved", {variant: "success"});
                    this.state.callback(true);
                })
                .catch(response => {
                    const {status, data} = response.error.response;
                    if (data.hasOwnProperty('errors')) {
                        Object.values(data.errors).forEach(msg => {
                            enqueueSnackbar(msg, {variant: "error"});
                        });
                    } else {
                        enqueueSnackbar(`${status}: ${data.message}`, {variant: "error"});
                    }
                })
        }
    };

    renderForm() {
        return Object.keys(this.state.user).map(attr => {
            if (attr !== 'uid') {
                if (typeof defaultUser[attr] === 'boolean') {
                    return <FormGroup key={attr}>
                        <FormControlLabel
                            control={<Checkbox
                                name={attr}
                                checked={this.state.user[attr]}
                                onChange={this.handleUserChange.bind(this)}
                            />}
                            label={`is ${attr}`}
                        />
                    </FormGroup>
                } else {
                    return <TextField
                        key={attr}
                        required
                        fullWidth
                        label={attr.toUpperCase()}
                        name={attr}
                        type={(attr === "password")? "password":"string"}
                        value={this.state.user[attr]}
                        error={this.state.error[attr]}
                        onChange={this.handleUserChange.bind(this)}
                    />
                }
            }
            return null;
        });
    }

    render() {
        const {title} = this.props;
        return <div>
            {title? <Typography variant="h6">{title}</Typography>:null}
            <form onSubmit={e => e.preventDefault()}>
                {this.renderForm()}
                <ButtonGroup fullWidth={true}>
                    <Button color="primary" onClick={this.saveUser.bind(this)}>
                        Save
                    </Button>
                    <Button color="secondary" onClick={() => this.state.callback(false)}>
                        Cancel
                    </Button>
                </ButtonGroup>
            </form>
        </div>
    }
}

export default connect()(withSnackbar(UserForm));