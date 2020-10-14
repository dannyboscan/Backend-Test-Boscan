import React, { Component, Fragment } from 'react';
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
                    const menu = data.results[0];
                    this.setState({menu});
                    return axios({
                        url: process.env.REACT_APP_ORDERS_URL,
                        method: "get",
                        params: {
                            menu: menu.id
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.props.user.access}`
                        }
                    }).then(({data}) => {
                        this.setState({orders: data});
                    }).catch(err => console.log('err: ', err))
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
                <h1 className="title is-1" style={{marginBottom: 0}}>
                    Ordenes
                </h1> <small>Aquí podrás encontrar información de los pedidos de hoy</small>
                <hr />

                {!this.state.menu ? (
                    <div className="notification is-warning">
                        No se encontro un menú para hoy
                    </div>
                ) : (
                    <Fragment>
                        <div className="columns">
                            <div className="column">
                                <div className="box">
                                    <h3 className="title is-3" style={{marginTop: 0, marginBottom: 10}}>Menú de Hoy</h3>
                                    <div className="content">
                                        <ol type="1">
                                            {this.state.menu.dishes_data.map(dish => (
                                                <li key={dish.id}>{dish.name}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="columns">
                            <div className="column">
                                <table className="table table is-hoverable is-fullwidth">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Correo</th>
                                            <th>Plato</th>
                                            <th>Observaciones</th>
                                        </tr>
                                    </thead>
                                    {this.state.orders.count > 0 && (
                                        <tbody>
                                            {this.state.orders.results.map(o => (
                                                <tr key={o.id}>
                                                    <th>{o.full_name}</th>
                                                    <th>{o.email}</th>
                                                    <th>
                                                        {o.dishes.map(dish => (
                                                            <span
                                                                key={dish.dish_data.id}
                                                                className="tag is-primary is-light"
                                                            >
                                                                {dish.dish_data.name}
                                                            </span>
                                                        ))}
                                                    </th>
                                                    <th>{o.observations}</th>
                                                </tr>
                                            ))}
                                        </tbody>
                                    )}
                                </table>
                                {!this.state.orders.count > 0 && (
                                    <div className="notification is-warning">
                                        No hay pedidos para hoy
                                    </div>
                                )}
                            </div>
                        </div>
                    </Fragment>
                )}
            </div>
        );
    }
}

export default Orders;
