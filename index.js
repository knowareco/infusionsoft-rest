const utf8 = require('utf8');
const base64 = require('base-64');
const request = require('request');

class Infusionsoft {
    /**
     * Constructs a new Infusionsoft object
     * @param {String} clientId Your Infusionsoft developer Client ID
     * @param {String} clientSecret Your Infusionsoft developer Client Secret
     */
    constructor(clientId, clientSecret) {
        this.IS_API_VERSION = 'v1';
        this.IS_API_ENDPOINT = `https://api.infusionsoft.com/crm/rest/${this.IS_API_VERSION}`;
        this.IS_API_AUTH_ENDPOINT = 'https://api.infusionsoft.com/token';
        this.IS_OAUTH_REQUEST_ENDPOINT = 'https://signin.infusionsoft.com/app/oauth/authorize';
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Returns an encoded query string from an object
     * @param {Object} filters An object of any kind
     */
    _parseFilters(filters) {
        let query = Object.keys(filters).map(key => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(filters[key])
        }).join('&');

        return `?${query}`;
    }

    requestPermission(redirectUri) {
        return `${this.IS_OAUTH_REQUEST_ENDPOINT}?client_id=${this.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=full`;
    }

    requestToken(code, redirectUri) {
        return new Promise((resolve, reject) => {
            request.post({
                url: this.IS_API_AUTH_ENDPOINT,
                form: {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri
                }
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(body), response);
                }
            });
        });
    }

    refreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            const bytes = utf8.encode(`${this.clientId}:${this.clientSecret}`);

            request.post({
                url: this.IS_API_AUTH_ENDPOINT,
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                },
                headers: {
                    "Authorization": `Basic ${base64.encode(bytes)}`
                }
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body, response);
                }
            });
        });
    }

    /**
     * 
     * @param {Object} opts
     */
    api(opts) {
        return new Promise((resolve, reject) => {
            let payload = {
                method: opts.method,
                url: `${this.IS_API_ENDPOINT}${opts.path}`,
                json: true,
                headers: {
                    "Authorization": `Bearer ${opts.token}`
                }
            };

            if (opts.body) {
                payload.body = opts.body;
            }

            request(payload, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body, response);
                }
            })
        });
    }

    /**
     * Retrieves profile/company info for an account.
     * @param {String} token A valid authentication access token
     */
    getAccountInfo(token) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'GET',
                path: '/account/profile',
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Updates profile/company info for an account.
     * @param {String} token A valid authentication access token
     * @param {Object} payload 
     */
    updateAccountInfo(token, payload) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'PUT',
                path: '/account/profile',
                body: payload,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Retrieve a list of Commissions based on Affiliate or Date Range
     * @param {String} token A valid authentication access token
     * @param {Object} filters 
     */
    getAffiliateCommissions(token, filters) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'GET',
                path: `/affiliates/commissions${this._parseFilters(filters)}`,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Get the custom fields for the Affiliate object
     * @param {String} token A valid authentication access token
     */
    getAffiliateModel(token) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'GET',
                path: `/affiliates/model`,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Retrieves all appointments for the authenticated user
     * @param {String} token A valid authentication access token
     * @param {*} filters 
     */
    getAppointments(token, filters) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'GET',
                path: `/appointments${this._parseFilters(filters)}`,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Creates a new appointment as the authenticated user
     * @param {String} token A valid authentication access token
     * @param {*} payload 
     */
    createAppointment(token, payload) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'POST',
                path: '/appointments',
                body: payload,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Deletes the specified appointment
     * @param {String} token A valid authentication access token
     * @param {Number} appointmentId The ID of the appointment to delete
     */
    deleteAppointment(token, appointmentId) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'DELETE',
                path: `/appointments/${appointmentId}`,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Retrieves a specific appointment with respect to user permissions. The authenticated user will need the "can view all records" permission for Task/Appt/Notes
     * @param {String} token A valid authentication access token
     * @param {Number} appointmentId The ID of the appointment to retrieve
     */
    getAppointment(token, appointmentId) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'GET',
                path: `/appointments/${appointmentId}`,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Updates the provided values of a given appointment
     * @param {String} token A valid authentication access token
     * @param {Number} appointmentId The ID of the appointment to retrieve
     * @param {Object} payload
     */
    updateAppointment(token, appointmentId, payload) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'PATCH',
                path: `/appointments/${appointmentId}`,
                body: payload,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Replaces all values of a given appointment
     * @param {String} token A valid authentication access token
     * @param {Number} appointmentId The ID of the appointment to retrieve
     * @param {Object} payload
     */
    replaceAppointment(token, appointmentId, payload) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'PUT',
                path: `/appointments/${appointmentId}`,
                body: payload,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Get the custom fields for the Appointment object
     * @param {String} token A valid authentication access token
     */
    getAppointmentsModel(token) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'GET',
                path: `/appointments/model`,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Adds a custom field of the specified type and options to the Appointment object.
     * @param {String} token A valid authentication access token
     * @param {Object} payload
     */
    createAppointmentsCustomField(token, payload) {
        return new Promise((resolve, reject) => {
            this.api({
                method: 'POST',
                path: `/appointments/model/customFields`,
                body: payload,
                token
            }).then(body => {
                resolve(body);
            }).catch(err => {
                reject(err);
            });
        });
    }
}

module.exports = Infusionsoft;
