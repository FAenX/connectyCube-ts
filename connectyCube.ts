// import ConnectyCube from 'connectycube';
import axios from 'axios';
import shortid from 'shortid';

import crypto from 'crypto';
import moment from 'moment';
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
};

export class VideocallService {
  constructor(/* Add @inject to inject parameters */) {}

  private async connectyCubeSettings() {
    const config = {headers: {'CB-Account-Key': CB_KEY}};
    const res = await axios.get(SETTINGS_URL, config);
    return res;
  }

  private async apiEndpoint() {
    const endpoints = await this.connectyCubeSettings();
    const {data} = endpoints;
    const apiEndpoint = data.api_endpoint;
    return apiEndpoint;
  }

  // create user session
  private async createSession() {
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
    const signature = crypto.createHmac('sha1', CB_SECRET + '')
      .update(querystring.stringify(params))
      .digest('hex');

    // axios request
    const data = JSON.stringify({
      ...params,
      signature,
    });

    const config = {headers: {
      'Content-Type': 'application/json',
    },
    };

    const response = axios.post(
      `${apiEndpoint}/${endPoints.session}`,
      data,
      config,
    );
    return await response.then(res=>{
      const response = res;
      return response.data;
    }).catch(res=>{
      const response = res.response;
      throw new Error(response.data);
    });
  }

  // signup users
  async signup(user: User): Promise<any> {
    const res = await this.createSession();
    const {session} = res;
    const data = JSON.stringify({
      'user': {
        'login': user.email,
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
      throw new Error(response.data);
    });
  }
}

interface User{
    password: string,
    email: string,
    facebookId?: string,
    twitterId?: string,
    fullName: string,
    phone: string,
}

