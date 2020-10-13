import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Formik } from 'formik';
import * as Yup from 'yup';


class DishModalForm extends Component {
    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object,
        onSubmit: PropTypes.func.isRequired,
        onRequestClose: PropTypes.func.isRequired
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
                                name: this.props.toEdit ? this.props.toEdit.name : '',
                                description: this.props.toEdit? this.props.toEdit.description: ''
                            }}
                            onSubmit={this.props.onSubmit}
                            validationSchema={Yup.object().shape({
                                name: Yup.string()
                                    .required('Indique el nombre del plato.')
                            })}
                        >
                            {props => {
                                const {
                                    values, touched, errors, isSubmitting,
                                    handleChange, handleBlur, handleSubmit
                                } = props;

                                return (
                                    <form onSubmit={handleSubmit}>
                                        <div className="field">
                                            <label  
                                                className="label"
                                                htmlFor="input-name"
                                            >
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="input-name"
                                                className={
                                                    errors.name && touched.name ? 'input error' : 'input'
                                                }
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errors.name && touched.name && (
                                                <div className="input-feedback">{errors.name}</div>
                                            )}
                                        </div>

                                        <div className="field">
                                            <label  
                                                className="label"
                                                htmlFor="input-description"
                                            >
                                                Algo adicional que quiera indicar
                                            </label>
                                            <textarea
                                                name="description"
                                                id="input-description"
                                                className={
                                                    errors.description && touched.description ? 'textarea error' : 'textarea'
                                                }
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errors.description && touched.description && (
                                                <div className="input-feedback">{errors.description}</div>
                                            )}
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

export default DishModalForm;
