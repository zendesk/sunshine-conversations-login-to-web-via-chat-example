# Objective

This repository shows an example of an end to end flow of authenticating a user on a website using a Smooch conversation extension. It's only meant as a proof of concept and should not form the basis of any secure auth (usernames, passwords and other values are hard coded).

# How it works

## Providing the login form to the user
When the user opens the page the `startConversation` method is called, the web server handles the `conversation:start` webhook event from Smooch and sends a conversation extension webview to the user prompting them to login.

## login
Once the user provides their username and password a call is made to the web server to exchange the credentials for an auth code. The auth code is then sent from the webview to the page hosting the Smooch widget via the `window.postMessage` method.

The auth code is exchanged by the main page with the web server for a session token with a 5 minute expiry which is set as a cookie.

The browser is then redirected to the secure page: _/secure_.

# Setup and usage

1. In _public/index.html_ set the value of `APP_ID` to your Smooch app ID.
2. In _index.js_ set the value of `SMOOCH_SECRET` and `KEY_ID` to a Smooch app scoped secret key pair.
3. Run `npm start` to load the server (if you're developing locally you'll need to expose your server to the Web so that Smooch can send webhook events).
4. Configure a webhook in your Smooch app's dashboard to point at this service: the webhook should point at the _/start_ endpoint and send the **conversation:start** trigger.
5. Visit the root in your browser (e.g., http://localhost:8000/) to begin the default username and password is admin/password.
