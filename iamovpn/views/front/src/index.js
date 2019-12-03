import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router';
import { Router } from 'react-router-dom';

import { combineReducers, createStore, applyMiddleware, compose} from 'redux';
import { Provider } from 'react-redux';

import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import { loadProgressBar } from 'axios-progress-bar';
import 'axios-progress-bar/dist/nprogress.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MyPage from "./components/MyPage";

import history from './history';
import * as reducers from './modules';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';


const apiClient = axios.create({
    baseURL: document.querySelector('#host').value,
    responseType: 'json',
    withCredentials: true
});
loadProgressBar({}, apiClient);


let composeEnhancers = compose;
if (document.querySelector('#development') !== undefined) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}


const store = createStore(
    combineReducers(reducers),
    composeEnhancers(
        applyMiddleware(
            axiosMiddleware(apiClient, {returnRejectedPromiseOnError: true})
        )
    )
);


ReactDOM.render(
    <Provider store={store}>
        <App>
            <Router history={history}>
                <Switch>
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/my" component={MyPage} />
                    <Route path="/login" component={Login} />
                    <Route path="/" component={Login} />
                </Switch>
            </Router>
        </App>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
