import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import MenuModalForm from './MenuModalForm';
import moment from 'moment';

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


class Menu extends Component {
    state = {
        menus: null,
        showMenuModalForm: false
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object
    };

    componentDidMount() {
        this.getMenus();
    };

    toggleMenuModalForm = show => {
        this.setState({showMenuModalForm: show});
    };

    getMenus = () => {
        if (this.props.isAuthenticated) {
            axios({
                url: process.env.REACT_APP_MENUS_URL,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.props.user.access}`
                }
            }).then(({data}) => {
                this.setState({menus: data})
            }).catch(err => console.log('err: ', err))
        }
    };

    onSubmitMenu = values => {
        return axios({
            url: process.env.REACT_APP_MENUS_URL,
            method: "post",
            data: {
                date: moment(values.date).format("YYYY-MM-DD"),
                dishes: values.dishes.map(d => d.value)
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.access}`
            }
        }).then(({data}) => {
            this.getMenus();
            this.toggleMenuModalForm(false);
        }).catch(err => console.log('err: ', err));
    };

    render() {
        if (!this.props.isAuthenticated) {
            return (<Redirect to="/signin/" />);
        }

        const {menus} = this.state;

        return (
            <div>
                <div className="columns">
                    <div className="column">
                        <h1 className="title is-1">
                            Menus
                        </h1>
                    </div>
                    <div className="column">
                        <div className="is-pulled-right">
                            <button
                                className="button is-primary"
                                type="button"
                                onClick={() => this.toggleMenuModalForm(true)}
                            >
                                Crear Menu
                            </button>
                        </div>
                    </div>
                </div>
                <hr />

                <div className="columns">
                    <div className="column">
                        {menus && menus.count === 0 ? (
                            <div className="notification is-warning">
                                No existe ningun menu creado
                            </div>
                        ): (
                            <span>asd</span>
                        )}
                    </div>
                </div>

                <div>
                    <Modal
                        isOpen={this.state.showMenuModalForm}
                        onRequestClose={() => this.toggleMenuModalForm(false)}
                        style={modalStyles}
                    >
                        <MenuModalForm
                            onRequestClose={() => this.toggleMenuModalForm(false)}
                            isAuthenticated={this.props.isAuthenticated}
                            user={this.props.user}
                            onSubmit={this.onSubmitMenu}
                        />
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Menu;
