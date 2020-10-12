import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

class Orders extends Component {
    state = {
        menu: null,
        orders: {}
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object
    };

    componentDidMount()  {
        this.getMenuAndOrders();
    };

    getMenuAndOrders = () => {
        if (this.props.isAuthenticated) {
            axios({
                url: process.env.REACT_APP_MENUS_URL,
                method: "get",
                params: {
                    date: moment().format("YYYY-MM-DD")
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.props.user.access}`
                }
            }).then(({data}) => {
                if (data.count > 0) {
                    this.setState({menu: data.results[0]})
                }
            }).catch(err => console.log('err: ', err))
        }
    };

    render() {
        if (!this.props.isAuthenticated) {
            return (<Redirect to="/signin/" />);
        }

        return (
            <div>
                <h1 className="title is-1">
                    Ordenes
                </h1>
                <hr />

                {!this.state.menu && (
                    <div className="notification is-warning">
                        No se encontro un menu para hoy
                    </div>
                )}
            </div>
        );
    }
}

export default Orders;
