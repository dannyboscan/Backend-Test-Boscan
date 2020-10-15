import Swal from 'sweetalert2'


export const axiosError = async (error) => {
    const title = "Error";
    const text = 'An error has occurred, please try again later';

    const Error404 = 'No results found';
    if (error.response && error.response.hasOwnProperty('data') && error.response.data) {
        const {data} = error.response;
        if (error.response.data.hasOwnProperty('detail')) {
            Swal.fire(title, data.detail, "error");
        } else if (Array.isArray(data)) {
            Swal.fire(title, data.join(', '), "error");
        } else if (data.hasOwnProperty('error') && data.error.trim().length > 0) {
            Swal.fire(title, data.error, "error");
        } else if (data instanceof Object && Object.keys(data).length > 0) {
            const message = Object.values(data)[0];
            Swal.fire(title, Array.isArray(message)? message[0]: message, "error");
        } else if (error.response.data instanceof Blob && error.response.status === 404) {
            Swal.fire(title, Error404, "error");
        } else {
            Swal.fire(title, text, "error");
        }
    } else {
        Swal.fire(title, text, "error");
    }
};
