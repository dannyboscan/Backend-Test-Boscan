import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const titleStyle = {
  fontWeight: 'bold',
};


const NavBar = (props) => {
    return (
        <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
            <section className="container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-item nav-title" style={titleStyle}>
                        Cornerlunch
                    </Link>
                </div>
                <div className="navbar-menu">
                    <div className="navbar-start">
                        <Link to="/" className="navbar-item">Ordenes</Link>
                        <Link to="/menus/" className="navbar-item">Menus</Link>
                    </div>

                    <div className="navbar-end">
                        {!props.isAuthenticated ? (
                            <Link to="/signin/" className="navbar-item">Sign in</Link>
                        ): (
                            <Fragment>
                                <Link to="/settings/" className="navbar-item">Settings</Link>
                                <a
                                    href="/"
                                    onClick={e => {e.preventDefault(); props.logoutUser();}}
                                    className="navbar-item link"
                                >
                                    Sign Out
                                </a>
                            </Fragment>
                        )}
                    </div>
                </div>
            </section>
        </nav>
    );
};

NavBar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    logoutUser: PropTypes.func.isRequired
};

export default NavBar;
