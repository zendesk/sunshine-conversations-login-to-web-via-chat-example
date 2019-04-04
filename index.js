const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Smooch = require('smooch-core');

const PORT = process.env.PORT || 8000;
const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'password';
const AUTHCODE = process.env.AUTHCODE || 'e784a9593a8172c7';
const WEB_SECRET = process.env.WEB_SECRET || 'secret';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';
const SMOOCH_SECRET = process.env.SMOOCH_SECRET || '';
const KEY_ID = process.env.KEY_ID || '';

const smooch = new Smooch({
  keyId: KEY_ID,
  secret: SMOOCH_SECRET,
  scope: 'app'
});

express()
  .use(cookieParser())
  .get('/secure', function(req, res, next) {
    // verify token
    jwt.verify(req.cookies.token, WEB_SECRET, (error) => {
      if (error) {
        res.status(401).send("<h1>You are not logged in. Go log in.</h1>");
        return;
      }

      // continue to secure page
      next();
    });
  })
  .use(express.static('public'))
  .use(bodyParser.json())
  .post('/login', function(req, res){
    // validate username and password
    if (req.body.username !== USERNAME || req.body.password !== PASSWORD) {
      res.status(401).json({});
      return;
    }

    // respond with auth code which will be exchanged in future for session token
    res.json({ authcode: AUTHCODE });
  })
  .post('/exchange', function(req, res){
    // validate auth code
    if (req.body.authcode !== AUTHCODE) {
      res.status(401).json({});
      return;
    }

    // respond with session token
    const token = jwt.sign({}, WEB_SECRET, { expiresIn: '5m' });
    res.json({ token });
  })
  .post('/start', async function(req, res) {
    console.log(req.body.appUser._id);
    if (req.body.trigger === 'conversation:start') {
      try {
        // send login webview
        await smooch.appUsers.sendMessage(req.body.appUser._id, {
          role: 'appMaker',
          type: 'text',
          text: 'Please authenticate to continue:',
          actions: [{
            type: 'webview',
            text: 'Login',
            uri: `${BASE_URL}/login`,
            fallback: `${BASE_URL}/login`,
            openOnReceive: true
          }]
        });
      } catch (err) {
        console.log(err.message);
      }
    }
    res.json({});
  })
  .listen(PORT, () => console.log(`Running on port ${PORT}`));
