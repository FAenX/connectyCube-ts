/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
// import ConnectyCube from 'connectycube';
import axios from 'axios';
const crypto = require('crypto');
const querystring = require('querystring');
const shortid = require('shortid');


const SETTINGS_URL = 'https://api.connectycube.com/account_settings';


/*
endpoint names
*/
const endPoints = {
  users: 'users',
  session: 'session',
  login: 'login',
  events: 'events',
};

function paramsWithUser(args: object) {

  const message: any = {...args}

  const sessionMsg = Object.keys(message)
    .map((val) => {
      if (typeof message[val] === 'object') {
        return Object.keys(message[val])
          .map(function (val1) {
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

export class ConnectyCube {
  private CB_KEY: string // application key
  private CB_AUTH: string // authentication key
  private CB_APP_ID: string
  private CB_SECRET: string
  constructor(
    CB_KEY: string, // application key
    CB_AUTH: string, // authentication key
    CB_APP_ID: string,
    CB_SECRET: string,
  ) {
    this.CB_KEY = CB_KEY
    this.CB_APP_ID = CB_APP_ID
    this.CB_AUTH = CB_AUTH
    this.CB_SECRET = CB_SECRET
  }

  private async connectyCubeSettings() {
    const config = {headers: {'CB-Account-Key': this.CB_KEY}};
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
  async createSession(user?: Login) {
    const apiEndpoint = await this.apiEndpoint();
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = shortid.generate();

    const params = {
      'application_id': this.CB_APP_ID,
      'auth_key': this.CB_AUTH,
      nonce,
      timestamp,
    };

    // hash signature
    let signature = crypto.createHmac('sha1', this.CB_SECRET)
      .update(querystring.stringify(params))
      .digest('hex');

    if (user) {
      const newParams = {...params, user: {}}
      if (user.login && user.password) {
        newParams.user = {login: user.login, password: user.password};
      }

      const paramsNew = paramsWithUser(newParams);

      signature = crypto.createHmac('sha1', this.CB_SECRET)
        .update(paramsNew)
        .digest('hex');
    }

    let data = JSON.stringify({
      ...params,
      signature,
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    };

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
    return response.then(res => {
      return res.data;
    }).catch(err => {
      throw new Error(err.response.data);
    });
  }

  // signup users
  async signup(user: User): Promise<ConnectyCubeUser> {
    try{
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
      const config = {
        headers:
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
      return response.then(re => {
        return re.data;
      }).catch(err => {
        throw new Error(err.response.data);
      });
    }catch(e){throw new Error(e.message)}
    
  }

  // login users
  async login(user: Login) {
    const res = await this.createSession();
    const {session} = res;
    const data = JSON.stringify({
      'login': user.login,
      'password': user.password,
    });
    const config = {
      headers:
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
    return response.then(re => {
      return re.data;
    }).catch(err => {
      throw new Error(err.response.data);
    });
  }

  /*
    send push notifications
  */
  async sendPushNotification(userId: string, notification: string) {
    const res = await this.createSession({
      login: 'h1-workstation', password: 'password'
    });
    const {session} = res;
    // api endpoint
    const apiEndpoint = await this.apiEndpoint();

    const config = {
      headers:
      {
        'CB-Token': `${session.token}`,
        'Content-Type': 'application/json',
      },
    };

    const message = JSON.stringify({
      'message': notification,
    });
    const payload = Buffer.from(message).toString('base64');

    const data = {
      'event': {
        'notification_type': 'push',
        'environment': 'development',
        'user': {'ids': `${userId}`},
        'message': `${payload}`,
        // 'push_type': 'gcm',
      },
    };

    console.log(message);

    const response = axios.post(
      `${apiEndpoint}/${endPoints.events}`,
      data,
      config,
    );

    // response
    return response.then(re => {
      return re.data;
    }).catch(err => {
      console.log(err.data);
    });
  }
}

type User = {
  password: string,
  login: string,
  facebookId?: string,
  twitterId?: string,
  fullName?: string,
  phone?: string,
  email?: string
}

type Login = {
  login: string
  password: string
}

type ConnectyCubeUser = {
  user: {id: string}
}
