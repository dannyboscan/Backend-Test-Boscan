import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { Formik } from 'formik';
import * as Yup from 'yup';


const LoginForm = props => {
    if (props.isAuthenticated) {
        return (<Redirect to="/" />);
    }

    return (
        <div className="columns">
            <div className="column is-one-third">
                <h1 className="title is-1">
                    Sign In
                </h1>
                <hr />

                <Formik
                    initialValues={{
                        username: '',
                        password: ''
                    }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        props.onSubmit(values);
                        resetForm();
                        setSubmitting(false);
                    }}
                    validationSchema={Yup.object().shape({
                        username: Yup.string()
                            .required('Nombre de usuario requerido.'),
                        password: Yup.string()
                            .required('Contraseña requerida.'),
                    })}
                >
                    {props => {
                        const {
                            values, touched, errors, isSubmitting,
                            handleChange, handleBlur, handleSubmit,
                        } = props;

                        return (
                            <form onSubmit={handleSubmit}>
                                <div className="field">
                                    <label  
                                        className="label"
                                        htmlFor="input-username"
                                    >
                                        Nombre de usuario
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="input-username"
                                        placeholder="Ingrese un nombre de usuario"
                                        className={
                                            errors.username && touched.username ? 'input error' : 'input'
                                        }
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.username && touched.username && (
                                        <div className="input-feedback">{errors.username}</div>
                                    )}
                                </div>

                                <div className="field">
                                    <label  
                                        className="label"
                                        htmlFor="input-password"
                                    >
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="input-password"
                                        placeholder="Ingrese un nombre de usuario"
                                        className={
                                            errors.password && touched.password ? 'input error' : 'input'
                                        }
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.password && touched.password && (
                                        <div className="input-feedback">{errors.password}</div>
                                    )}
                                </div>

                                <div className="is-pulled-right">
                                    <button
                                        type="submit"
                                        className="button is-link"
                                        disabled={isSubmitting}
                                    >
                                        Log in
                                    </button>
                                </div>
                            </form>
                        );
                    }}
                </Formik>
            </div>
        </div>
    );
};

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
};

export default LoginForm;
