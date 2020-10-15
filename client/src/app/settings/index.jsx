import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import Swal from 'sweetalert2'
import {axiosError} from '../../utils';


const channelOptionsMap = c => ({
    value: c.id,
    label: `#${c.name}`
});

class Settings extends Component {
    state = {
        loading: true,
        channels: [],
        setting: null,
        error: null
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        user: PropTypes.object,
    };

    componentDidMount() {
        this.getSetting();
    }

    getSetting = () => {
        if (this.props.isAuthenticated) {
            axios({
                url: `${process.env.REACT_APP_SLACK_SETTINGS_URL}`,
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.props.user.access}`
                }
            }).then(({data}) => {
                if (data.count) {
                    const setting = data.results[0];
                    this.setState({setting, loading: false});
                    this.getChannles(setting.token);
                } else {
                    this.setState({loading: false});
                }
            }).catch(axiosError);
        }
    };

    getChannles = token => {
        this.setState({error: null})
        axios({
            url: `${process.env.REACT_APP_SLACK_SETTINGS_URL}channels/`,
            method: "post",
            data: {token},
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.access}`
            }
        }).then(({data}) => {
            if (data.ok) {
                const channels = data.channels.map(channelOptionsMap)
                this.setState({channels});
            } else {
                this.setState({error: data.error, channels: []});
            }
        }).catch(axiosError);
    };

    onSubmit = (values, { setSubmitting, resetForm }) => {
        return axios({
            url: process.env.REACT_APP_SLACK_SETTINGS_URL,
            method: "post",
            data: {
                token: values.token,
                channel_id: values.channel.value,
                channel_name: values.channel.label,
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.access}`
            }
        }).then(({data}) => {
            setSubmitting(false);
            Swal.fire(
                'Slack setting',
                'The configuration was saved successfully',
                'success'
            )
        }).catch(axiosError);
    };

    render() {
        if (!this.props.isAuthenticated) {
            return (<Redirect to="/signin/" />);
        }

        return (
            <div>
                <h1 className="title is-1">
                    Settings
                </h1>
                <hr />

                {!this.state.loading && (
                    <div className="columns">
                        <div className="column is-three-quarters">
                            <Formik
                                initialValues={{
                                    token: this.state.setting ? this.state.setting.token: '',
                                    channel: this.state.setting? {
                                        label: this.state.setting.channel_name,
                                        value: this.state.setting.channel_id
                                    } : null
                                }}
                                onSubmit={this.onSubmit}
                                validationSchema={Yup.object().shape({
                                    token: Yup.string()
                                        .required('Token es requerido.'),
                                    channel: Yup.object().nullable()
                                        .required("Seleccione un canal")
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
                                            <label  
                                                className="label"
                                                htmlFor="input-token"
                                            >
                                                Bot User OAuth Access Token
                                            </label>
                                            <div className="field has-addons">
                                                <div className="control is-expanded">
                                                    <input
                                                        type="text"
                                                        name="token"
                                                        id="input-token"
                                                        placeholder="ingrese token del slack"
                                                        className={
                                                            errors.token && touched.token ? 'input error' : 'input'
                                                        }
                                                        value={values.token}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        autoComplete="off"
                                                    />
                                                </div>

                                                <div className="control">
                                                    <button
                                                        type="button"
                                                        className="button is-primary"
                                                        disabled={values.token.trim().length === 0}
                                                        onClick={() => this.getChannles(values.token)}
                                                    >
                                                        Consultar canales
                                                    </button>
                                                </div>
                                            </div>
                                            {errors.token && touched.token && (
                                                <div className="input-feedback">{errors.token}</div>
                                            )}
                                            {this.state.error && touched.token && (
                                                <div className="input-feedback">{this.state.error}</div>
                                            )}

                                            {this.state.channels.length > 0 && (
                                                <Fragment>
                                                    <div className="columns">
                                                        <div className="column is-half">
                                                            <div className="field">
                                                                <label  
                                                                    className="label"
                                                                    htmlFor="input-channel"
                                                                >
                                                                    Seleccione el canal al que desea notificar
                                                                </label>

                                                                <Select
                                                                    defaultOptions
                                                                    onChange={value => setFieldValue('channel', value, true)}
                                                                    value={values.channel}
                                                                    onBlur={handleBlur}
                                                                    options={this.state.channels}
                                                                    menuPortalTarget={document.body}
                                                                    styles={{menuPortal: base => ({...base, zIndex: 999999999999})}}
                                                                />

                                                                {errors.channel && touched.channel && (
                                                                    <div className="input-feedback">{errors.channel}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="field is-grouped is-grouped-right">
                                                        <div className="buttons">
                                                            <button
                                                                type="submit"
                                                                className="button is-link"
                                                                disabled={isSubmitting}
                                                            >
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Fragment>
                                            )}
                                        </form>
                                    );
                                }}
                            </Formik>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Settings;
