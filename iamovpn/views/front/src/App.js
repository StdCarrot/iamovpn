import React, {Component} from 'react';
import {connect} from 'react-redux';
import {SnackbarProvider} from 'notistack';

import './App.css';
import * as userActions from "./modules/user";
import history from "./history";


class App extends Component {
    routeUser() {
        const {dispatch, me} = this.props;

        if (me) {
            if (me.admin) {
                history.push('/dashboard')
            } else {
                history.push('/user')
            }
        } else {
            dispatch(userActions.checkSession())
                .then((response) => {
                    console.log('Authorized!');
                    const user = response.payload.data.user;
                    if (user.admin === true) {
                        history.push('/dashboard');
                    } else {
                        history.push('/my');
                    }
                })
                .catch((response) => {
                    history.push('/login');
                });
        }
    };

    componentDidMount() {
        this.routeUser();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.routeUser();
    };

    render() {
        let layout = (
            <div style={{height: '100%'}}>{this.props.children}</div>
        );
        return (
            <SnackbarProvider className="App" maxSnack={5}>
                {layout}
            </SnackbarProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        me: state.user.get('me')
    }
};
export default connect(mapStateToProps)(App);