import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import axios from 'axios';


class Dishes extends Component {
    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object
    };

    render() {
        if (!this.props.isAuthenticated) {
            return (<Redirect to="/signin/" />);
        }

        return (
            <div>
                <div className="columns">
                    <div className="column">
                        <h1 className="title is-1">
                            Platos
                        </h1>
                        <hr />
                    </div>
                </div>
            </div>
        );
    }
}

export default Dishes;