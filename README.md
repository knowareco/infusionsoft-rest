# Node Infusionsoft REST API
A light-weight library that makes integrating with the Infusionsoft REST API (not the legacy XML-RPC API) easier.
![Developed By KNOWARE.CO](https://img.shields.io/badge/developed%20by-KNOWARE.CO-red.svg)

  - Convenience methods for OAuth with Infusionsoft
  - Promised-based API
  - Methods for each route or call the API directly

#### Getting Started
```sh
npm install infusionsoft-rest --save
```

You will need to obtain a `clientId` and `clientSecret` from Infusionsoft. In order to do this, you need to create an [Infusionsoft Developer Account](https://developer.infusionsoft.com/). Once you have your keys, you will be able to provide them to the constructor for this library.

```js
const Infusionsoft = require('infusionsoft-rest');
const is = new Infusionsoft('clientId', 'clientSecret');
```

#### Authenticating with Infusionsoft
Infusionsoft uses OAuth to authenticate with their REST API. This library includes some convenience methods to make getting started quicker. It is up to you to store and manage your access token and refresh token.

##### Request Permission
You need to send your users to an endpoint for them to authenticate and authroize your application to have access to their Infusionsoft account. This library can help you format the link properly with the following method:
```js
const uri = is.requestPermission(redirectUrl);
```
This will return a `String` that you can send your users to in order to complete the request flow. The `redirectUri` you provide is where the user will be sent back to after approving the authorization request. This is when you can request your API token.

##### Request Token
Once permission has been granted, you can request an Access Token from the Infusionsoft REST API using the following method:
```js
is.requestToken(code, redirectUri).then(response => {
    // response contains access token, refresh token and expiration
}).catch(err => {
   // handle errors 
});
```
The code parameter will be provided to you by the redirect from `requestPermission`. You must provide the same `redirectUri` as used when requesting permission. It's time to store your access token and refresh token and begin making API calls. Every endpoint in the Infusionsoft API requires a valid access token.

#### Authentication For Private Internal Apps
If you plan on creating a private integration with your own Infusionsoft account there are a few things to note. You can register your new integration with your account and generate an Access Token and Refresh Token manually via your account settings. To register your application with your Infusionsoft account manually, you can use the [Infusionsoft REST API documentation](https://developer.infusionsoft.com/docs/rest) and click the "TRY THE API" button and authenticate manually. One you register your application with your account and manually generate your API keys, you will need to keep your access token alive indefinately by using the refresh token flow. This can be achieved by either using a cronjob or storing the expiration date in your database. Another common method is to use an interceptor on the HTTP requests to see if the token has expired.

#### Calling the API Directly
You can either use the methods contained in this library for specific actions or call the API directly. The two methods below are functionally the exact same.
```js
is.api({
    method: 'GET',
    path: '/account/profile',
    token: 'YOUR_ACCESS_TOKEN'
}).then(body => {
    // Handle API response
}).catch(err => {
    // Handle errors
});

// -- OR --

is.getAccountInfo('YOUR_ACCESS_TOKEN').then(accountInfo => {
    // Handle API response
}).catch(err => {
    // Handle errors
});
```

The `response` object is also available as a second parameter to the resolve of each promise. You can use it to collect specific status codes and more.
```js
is.api({
    method: 'GET',
    path: '/account/profile',
    token: 'YOUR_ACCESS_TOKEN'
}).then((body, response) => { // Optionally get the entire HTTP response object for debugging
    // Handle API response
}).catch(err => {
    // Handle errors
});
```