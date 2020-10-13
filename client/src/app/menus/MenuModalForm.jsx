import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncSelect from 'react-select/async';
import Portal from "@atlaskit/portal";


const dishOptionsMap = dish => ({
    value: dish.id,
    label: dish.name
});

class MenuModalForm extends Component {
    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object,
        onSubmit: PropTypes.func.isRequired
    };

    loadDishesOptions = (inputValue) => {
        let params = {
            page: 1,
            page_size: 10,
            q: inputValue || ''
        };

        return axios({
            url: process.env.REACT_APP_DISHES_URL,
            method: "get",
            params,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.access}`
            }
        }).then(({data}) => {
            if (data.count > 0) {
                return data.results.map(dishOptionsMap);
            }
        }).catch(err => console.log('err: ', err));
    };

    render() {
        return (
            <div className="modal is-active">
                <div className="modal-background" />
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Menu</p>
                        <button className="delete" aria-label="close" onClick={this.props.onRequestClose} />
                    </header>
                    <section className="modal-card-body">
                        <Formik
                            initialValues={{
                                date: '',
                                dishes: null
                            }}
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                await this.props.onSubmit(values);
                                resetForm();
                                setSubmitting(false);
                            }}
                            validationSchema={Yup.object().shape({
                                date: Yup.string()
                                    .required('Indique la fecha del Menú.'),
                                dishes: Yup.array().nullable()
                                    .required('Indique los platos para el Menú.'),
                            })}
                        >
                            {props => {
                                const {
                                    values, touched, errors, isSubmitting,
                                    handleChange, handleBlur, handleSubmit,
                                    setFieldValue
                                } = props;

                                return (
                                    <form onSubmit={handleSubmit}>
                                        <div className="field">
                                            <label  
                                                className="label"
                                                htmlFor="input-date"
                                            >
                                                Fecha del Menu
                                            </label>
                                            <DatePicker
                                                id="input-date"
                                                name="date"
                                                className="input"
                                                minDate={moment().startOf('day').toDate()}
                                                dateFormat="P"
                                                showWeekNumbers
                                                autoComplete="off"
                                                showMonthDropdown
                                                showYearDropdown
                                                selected={values.date}
                                                onChange={value => setFieldValue('date', value, true)}
                                                onBlur={handleBlur}
                                                popperContainer={({children}) => <Portal>{children}</Portal>}
                                            />
                                            {errors.date && touched.date && (
                                                <div className="input-feedback">{errors.date}</div>
                                            )}
                                        </div>

                                        <div className="field">
                                            <label  
                                                className="label"
                                                htmlFor="input-dishes"
                                            >
                                                Selecione los platos que tendra el Menú
                                            </label>

                                            <AsyncSelect
                                                isMulti
                                                defaultOptions
                                                onChange={value => setFieldValue('dishes', value, true)}
                                                value={values.dishes}
                                                onBlur={handleBlur}
                                                loadOptions={this.loadDishesOptions}
                                                menuPortalTarget={document.body}
                                                styles={{menuPortal: base => ({...base, zIndex: 999999999999})}}
                                            />

                                            {errors.dishes && touched.dishes && (
                                                <div className="input-feedback">{errors.dishes}</div>
                                            )}
                                        </div>

                                        <div className="field">
                                            <label className="checkbox">
                                                <input
                                                    name="reminder_sent"
                                                    type="checkbox"
                                                    value={values.username}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                /> Enviar notificación
                                            </label>
                                        </div>

                                        <div className="field is-grouped is-grouped-right">
                                            <div className="buttons">
                                                <button
                                                    type="button"
                                                    className="button is-link is-light"
                                                    disabled={isSubmitting}
                                                    onClick={this.props.onRequestClose}
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="button is-link"
                                                    disabled={isSubmitting}
                                                >
                                                    Guardar
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                );
                            }}
                        </Formik>
                    </section>
                </div>
            </div>
        );
    }
}

export default MenuModalForm;
