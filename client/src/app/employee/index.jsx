import React, { Component } from 'react';
import { withRouter } from "react-router";
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import {axiosError} from '../../utils';


const dishOptionsMap = c => ({
    value: c.id,
    label: `${c.name}`
});

class Employee extends Component {
    state = {
        loading: true,
        menu: null,
        dishes: []
    };

    componentDidMount() {
        this.getMenu();
    }

    getMenu = () => {
        axios.get(
            `${process.env.REACT_APP_MENU_ORDER_URL}${this.props.match.params.token}/`
        ).then(({data}) => {
            console.log('data: ', data);
            this.setState({
                menu: data,
                dishes: data.dishes_data.map(dishOptionsMap)
            });
        }).catch(axiosError).then(()=> {
            this.setState({loading: false});
        })
    };

    onSubmit = (values, { setSubmitting, resetForm }) => {
        return axios.post(process.env.REACT_APP_EMPLOYEE_ORDER_URL, {
            "menu": this.props.match.params.token,
            "full_name": values.full_name,
            "email": values.email,
            "observations": values.observations,
            "dishes": [
                {
                    "dish": values.dish.value,
                    "quantity": 1
                }
            ]
        }).then(res => {
            resetForm();
            setSubmitting(false);
        }).catch(axiosError);
    }

    render() {

        return (
            <div>
                <h1 className="title is-1" style={{marginBottom: 0}}>
                    Menu de Hoy
                </h1>

                <div className="columns">
                    <div className="column">
                        {!this.state.loading && !this.state.menu && (
                            <div className="notification is-warning">
                                Menu no encontrado
                            </div>
                        )}
                    </div>
                </div>

                <div className="columns">
                    <div className="column is-half">
                        {!this.state.loading && this.state.menu && (
                            <div>
                                <Formik
                                    initialValues={{
                                        full_name: '',
                                        email: '',
                                        observations: '',
                                        dish: null
                                    }}
                                    onSubmit={this.onSubmit}
                                    validationSchema={Yup.object().shape({
                                        full_name: Yup.string()
                                            .required('Ingrese su nombre completo'),
                                        email: Yup.string().email()
                                            .required('Ingrese su correo electronico'),
                                        dish: Yup.object().nullable()
                                            .required('Indique el plato que quiere'),
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
                                                        htmlFor="input-full_name"
                                                    >
                                                        Nombre completo
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="full_name"
                                                        id="input-full_name"
                                                        className={
                                                            errors.full_name && touched.full_name ? 'input error' : 'input'
                                                        }
                                                        value={values.full_name}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.full_name && touched.full_name && (
                                                        <div className="input-feedback">{errors.full_name}</div>
                                                    )}
                                                </div>

                                                <div className="field">
                                                    <label  
                                                        className="label"
                                                        htmlFor="input-email"
                                                    >
                                                        Correo electrónico
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="input-email"
                                                        className={
                                                            errors.email && touched.email ? 'input error' : 'input'
                                                        }
                                                        value={values.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.email && touched.email && (
                                                        <div className="input-feedback">{errors.email}</div>
                                                    )}
                                                </div>

                                                <div className="field">
                                                    <label  
                                                        className="label"
                                                        htmlFor="input-dish"
                                                    >
                                                        Seleccione el plato que desea ordenar
                                                    </label>

                                                    <Select
                                                        defaultOptions
                                                        onChange={value => setFieldValue('dish', value, true)}
                                                        value={values.dish}
                                                        onBlur={handleBlur}
                                                        options={this.state.dishes}
                                                        menuPortalTarget={document.body}
                                                        styles={{menuPortal: base => ({...base, zIndex: 999999999999})}}
                                                    />

                                                    {errors.dish && touched.dish && (
                                                        <div className="input-feedback">{errors.dish}</div>
                                                    )}
                                                </div>

                                                <div className="field">
                                                    <label  
                                                        className="label"
                                                        htmlFor="input-observations"
                                                    >
                                                        Algo adicional que quiera indicar
                                                    </label>
                                                    <textarea
                                                        name="observations"
                                                        id="input-observations"
                                                        className={
                                                            errors.observations && touched.observations ? 'textarea error' : 'textarea'
                                                        }
                                                        value={values.observations}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.observations && touched.observations && (
                                                        <div className="input-feedback">{errors.observations}</div>
                                                    )}
                                                </div>

                                                <div className="field is-grouped is-grouped-right">
                                                    <div className="buttons">
                                                        <button
                                                            type="submit"
                                                            className="button is-link"
                                                            disabled={isSubmitting}
                                                        >
                                                            Ordenar
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        );
                                    }}
                                </Formik>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Employee);
