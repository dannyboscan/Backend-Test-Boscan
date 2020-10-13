import React, { Component } from 'react';

import {Route, Switch} from "react-router";
import Http404 from '../components/Http404';
import NavBar from '../components/NavBar';
import LoginForm from '../components/LoginForm';
import Orders from './orders';
import Menu from './menus';
import Settings from './settings';
import axios from 'axios';


class App extends Component {
    state = {
        user: null
    };

    logoutUser = () => {
        console.log('logout: ');
        window.localStorage.removeItem('refreshToken');
        this.setState({user: null});
    };

    validRefresh = () => {
        const token = window.localStorage.getItem('refreshToken');
        if (token) {
            axios.post(process.env.REACT_APP_AUTH_TOKEN_REFRESH_URL, {
                refresh: token
            }).then(({data}) => {
                this.setState({user: data});
                window.localStorage.setItem('refreshToken', data.refresh);
                return true;
            }).catch(err => {
                return false;
            })
        }

        return false;
    };

    isAuthenticated = () => {
        return (
            (this.state.user !== null
            && this.state.user.hasOwnProperty('access'))
            || this.validRefresh()
        );
    };

    onSubmitSignIn = values => {
        axios.post(process.env.REACT_APP_AUTH_TOKEN_URL, values).then(({data}) => {
            this.setState({user: data})
            window.localStorage.setItem('refreshToken', data.refresh);
        }).catch((err) => { console.log(err); });
    };

    render() {
        const isAuthenticated = this.isAuthenticated();

        return (
            <div>
                <NavBar
                    isAuthenticated={isAuthenticated}
                    logoutUser={this.logoutUser}
                />

                <section className="section">
                    <div className="container">
                        <div className="columns">
                            <div className="column">
                                <Switch>
                                    <Route
                                        path={"/"}
                                        exact
                                        component={() => (
                                            <Orders
                                                isAuthenticated={isAuthenticated}
                                                user={this.state.user}
                                            />
                                        )}
                                    />
                                    <Route
                                        path={"/signin/"}
                                        exact
                                        component={() => (
                                            <LoginForm
                                                onSubmit={this.onSubmitSignIn}
                                                isAuthenticated={isAuthenticated}
                                            />
                                        )}
                                    />
                                    <Route
                                        path={"/menus/"}
                                        exact
                                        component={() => (
                                            <Menu
                                                isAuthenticated={isAuthenticated}
                                                user={this.state.user}
                                            />
                                        )}
                                    />
                                    <Route
                                        path={"/settings/"}
                                        exact
                                        component={() => (
                                            <Settings
                                                isAuthenticated={isAuthenticated}
                                                user={this.state.user}
                                            />
                                        )}
                                    />
                                    <Route component={Http404}/>
                                </Switch>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default App;