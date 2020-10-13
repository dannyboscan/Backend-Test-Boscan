import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';

import DishModalForm from './DishModalForm';


Modal.setAppElement(document.getElementById("root"));

const modalStyles = {
    content: {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        border: 0,
        background:'transparent'
    }
};

class Dishes extends Component {
    state = {
        dishes: null,
        showDishModalForm: false,
        toEdit: null
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object
    };

    componentDidMount() {
        this.getDishes();
    }

    getDishes = () => {
        if (this.props.isAuthenticated) {
            axios({
                url: process.env.REACT_APP_DISHES_URL,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.props.user.access}`
                }
            }).then(({data}) => {
                this.setState({dishes: data})
            }).catch(err => console.log('err: ', err))
        }
    };

    toggleDishModalForm = show => {
        const newState = {showDishModalForm: show};
        if (!show) {
            newState.toEdit = null;
        }
        this.setState(newState);
    };

    onSubmitDish = (values, { setSubmitting, resetForm }) => {
        const {toEdit} = this.state;
        axios({
            url: toEdit? `${process.env.REACT_APP_DISHES_URL}${toEdit.id}/`: process.env.REACT_APP_DISHES_URL,
            method: toEdit? "patch": "post",
            data: {
                name: values.name,
                description: values.description
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.access}`
            }
        }).then(({data}) => {
            this.getDishes();
            resetForm();
            setSubmitting(false);
            this.toggleDishModalForm(false);
        }).catch(err => console.log('err: ', err));
    };

    onDeleteDish = dishId => {
        axios({
            url: `${process.env.REACT_APP_DISHES_URL}${dishId}/`,
            method: "delete",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.access}`
            }
        }).then(({data}) => {
            this.getDishes();
        }).catch(err => console.log('err: ', err));
    };

    render() {
        if (!this.props.isAuthenticated) {
            return (<Redirect to="/signin/" />);
        }

        const {dishes} = this.state;

        return (
            <div>
                <div className="columns">
                    <div className="column">
                        <h1 className="title is-1">
                            Platos
                        </h1>
                    </div>
                    <div className="column">
                        <div className="is-pulled-right">
                            <button
                                className="button is-primary"
                                type="button"
                                onClick={() => this.toggleDishModalForm(true)}
                            >
                                Crear Plato
                            </button>
                        </div>
                    </div>
                </div>
                <hr />

                {dishes !== null && (
                    <div className="columns">
                        <div className="column">
                            {dishes.count === 0 ? (
                                <div className="notification is-warning">
                                    No existe ningun plato creado
                                </div>
                            ): (
                                <table className="table is-hoverable is-fullwidth">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {dishes.results.map(dish => (
                                            <tr key={dish.id}>
                                                <td>{dish.name}</td>
                                                <td>{dish.description}</td>
                                                <td>
                                                    <div className="buttons">
                                                        <button
                                                            className="button is-small is-danger"
                                                            type="button"
                                                            onClick={() => this.onDeleteDish(dish.id)}
                                                        >
                                                            eliminar
                                                        </button>
                                                        <button
                                                            className="button is-small is-primary"
                                                            type="button"
                                                            onClick={() => this.setState({toEdit: dish}, () => {
                                                                this.toggleDishModalForm(true);
                                                            })}
                                                        >
                                                            Editar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <Modal
                        isOpen={this.state.showDishModalForm}
                        onRequestClose={() => this.toggleDishModalForm(false)}
                        style={modalStyles}
                    >
                        <DishModalForm
                            onRequestClose={() => this.toggleDishModalForm(false)}
                            isAuthenticated={this.props.isAuthenticated}
                            user={this.props.user}
                            toEdit={this.state.toEdit}
                            onSubmit={this.onSubmitDish}
                        />
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Dishes;