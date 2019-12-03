import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    TextField,
    Button,
    ButtonGroup
} from '@material-ui/core';
import { withSnackbar } from 'notistack';

import * as userActions from "../modules/user";


class PasswordForm extends Component {
    constructor(props) {
        super(props);
        const callback = this.props.callback || (() => {});
        const uid = this.props.uid || null;

        this.state = {
            callback: callback,
            uid: uid,
            old: "",
            new: "",
            error: {
                old: false,
                new: false
            }
        };
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const callback = this.props.callback || (() => {});
        const uid = this.props.uid || null;

        if (uid !== this.state.uid) {
            this.setState({
                callback: callback,
                uid: uid,
                old: "",
                new: "",
                error: {
                    old: false,
                    new: false
                }
            });
        }
    };

    handlePasswordChange(e) {
        const {error} = this.state;
        error[e.target.name] = (e.target.value || '').length < 6;
        this.setState({[e.target.name]: e.target.value, error: error });
    };

    savePassword() {
        const {dispatch, enqueueSnackbar} = this.props;
        let req = null;
        if (this.state.uid === null) {
            req = dispatch(userActions.modifyMyPassword(this.state.old, this.state.new));
        } else {
            req = dispatch(userActions.modifyPassword(this.state.uid, this.state.new));
        }
        req.then(response => {
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
        });
    };

    render() {
        return <form onSubmit={e => e.preventDefault()}>
            {this.state.uid === null?
                <TextField
                    required
                    fullWidth
                    name="old"
                    label="Old password"
                    type="password"
                    value={this.state.old}
                    error={this.state.error.old}
                    onChange={this.handlePasswordChange.bind(this)}
                />
                :null
            }
            <TextField
                required
                fullWidth
                name="new"
                label="New password"
                type="password"
                value={this.state.new}
                error={this.state.error.new}
                onChange={this.handlePasswordChange.bind(this)}
            />
            <ButtonGroup fullWidth>
                <Button color="primary" onClick={this.savePassword.bind(this)}>
                    Save
                </Button>
                <Button color="secondary" onClick={() => this.state.callback(false)}>
                    Cancel
                </Button>
            </ButtonGroup>
        </form>
    }
}

const mapStateToProps = (state) => {
    return {
        me: state.user.get('me')
    }
};
export default connect(mapStateToProps)(withSnackbar(PasswordForm));