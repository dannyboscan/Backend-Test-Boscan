import React, { Component } from 'react';

class Http404 extends Component {
    render() {
        return (
            <section className="section is-medium">
                <div className="container">
                    <div className="columns is-vcentered">
                        <div className="column has-text-centered">
                            <h1 className="title">404 Page Not Found</h1>
                            <a href="/" className="button">Home</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Http404;
