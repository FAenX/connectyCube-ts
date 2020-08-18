/* eslint-disable camelcase */
import {bind, /* inject, */ BindingScope} from '@loopback/core';
// import ConnectyCube from 'connectycube';
import axios from 'axios';
import shortid from 'shortid';

import crypto from 'crypto';
import moment from 'moment';
import {HttpErrors, param} from '@loopback/rest';
import querystring from 'querystring';

const SETTINGS_URL = 'https://api.connectycube.com/account_settings';

const {
  CB_KEY,
  CB_AUTH,
  CB_APP_ID,
  CB_SECRET,
} = process.env;

const endPoints = {
  users: 'users',
  session: 'session',
  login: 'login',
};

function paramsWithUser(message:any) {
  const sessionMsg = Object.keys(message)
    .map(function(val) {
      if (typeof message[val] === 'object') {
        return Object.keys(message[val])
          .map(function(val1) {
            return val + '[' + val1 + ']=' + message[val][val1];
          })
          .sort()
          .join('&');
      } else {
        return val + '=' + message[val];
      }
    })
    .sort()
    .join('&');
  return sessionMsg;
}

//

@bind({scope: BindingScope.TRANSIENT})
export class ConnectCube {
  constructor(/* Add @inject to inject parameters */) {}

  private async connectyCubeSettings() {
    const config = {headers: {'CB-Account-Key': CB_KEY}};
    const res = await axios.get(SETTINGS_URL, config);
    return res;
  }

  private async apiEndpoint(user?: Login) {
    const endpoints = await this.connectyCubeSettings();
    const {data} = endpoints;
    const apiEndpoint = data.api_endpoint;
    return apiEndpoint;
  }

  // create user session
  async createSession(user?: Login) {
    const apiEndpoint = await this.apiEndpoint();
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = shortid.generate();

    const params:any = {
      'application_id': CB_APP_ID,
      'auth_key': CB_AUTH,
      nonce,
      timestamp,
    };

    // hash signature
    let signature = crypto.createHmac('sha1', CB_SECRET + '')
      .update(querystring.stringify(params))
      .digest('hex');

    if (user) {
      if (user.login && user.password) {
        params.user = {login: user.login, password: user.password};
      }

      const paramsNew = paramsWithUser(params);
      signature = crypto.createHmac('sha1', CB_SECRET + '')
        .update(paramsNew)
        .digest('hex');
    }

    let data = JSON.stringify({
      ...params,
      signature,
    });

    const config = {headers: {
      'Content-Type': 'application/json',
    }};

    if (user) {
      data = JSON.stringify({
        ...params,
        signature,
        user,
      });
      // axios request
    }

    const response = axios.post(
      `${apiEndpoint}/${endPoints.session}`,
      data,
      config,
    );
    // console.log(await response);
    return await response.then(res=>{
      const response = res;
      return response.data;
    }).catch(res=>{
      const response = res.response;
      throw new HttpErrors.BadRequest(response.data);
    });
  }

  // signup users
  async signup(user: User): Promise<any> {
    const res = await this.createSession();
    const {session} = res;
    const data = JSON.stringify({
      'user': {
        'login': user.login,
        'password': user.password,
        'email': user.email,
        'facebook_id': user.facebookId,
        'twitter_id': user.twitterId,
        'full_name': user.fullName,
        'phone': user.phone,
      },
    });
    const config = {headers:
      {
        'CB-Token': `${session.token}`,
        'Content-Type': 'application/json',
      },
    };
    const apiEndpoint = await this.apiEndpoint();
    const response = axios.post(
      `${apiEndpoint}/${endPoints.users}`,
      data,
      config,
    );
    return await response.then(res=>{
      const response = res;
      return response.data;
    }).catch(res=>{
      const response = res.response;
      throw new HttpErrors.BadRequest(response.data);
    });
  }

  // login users
  async login(user: Login) {
    const res = await this.createSession();
    const {session} = res;
    const data = JSON.stringify({
      'login': user.login,
      'password': user.password,
    });
    const config = {headers:
      {
        'CB-Token': `${session.token}`,
        'Content-Type': 'application/json',
      },
    };
    const apiEndpoint = await this.apiEndpoint();
    const response = axios.post(
      `${apiEndpoint}/${endPoints.login}`,
      data,
      config,
    );
    return await response.then(res=>{
      const response = res;
      return response.data;
    }).catch(res=>{
      const response = res.response;
      throw new HttpErrors.BadRequest(response.data);
    });
  }
}

interface User{
    password: string,
    login: string,
    facebookId?: string,
    twitterId?: string,
    fullName?: string,
    phone?: string,
    email?: string
}

interface Login{
  login: string
  password: string
}

