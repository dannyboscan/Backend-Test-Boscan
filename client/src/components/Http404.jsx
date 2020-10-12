import React, { Component } from 'react';

class Http404 extends Component {
    render() {
        return (
            <section class="section is-medium">
                <div class="container">
                    <div class="columns is-vcentered">
                        <div class="column has-text-centered">
                            <h1 class="title">404 Page Not Found</h1>
                            <a href="/" class="button">Home</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Http404;
