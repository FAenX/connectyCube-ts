# connectyCube-ts

```javascript

connectycube typescript wrapper

// usage

import {ConnectyCube} from '@coderafiki/connectycube-ts'


const {
  APPLICATION_KEY,
  AUTHENTICATION_KEY,
  APP_ID,
  AUTHENTICATION_SECRET,
} = process.env;




const connectyCube = new ConnectyCube(
     APPLICATION_KEY, AUTHENTICATION_KEY, APP_ID, AUTHENTICATION_SECRET)


// functions 
// signup
connectyCube.signup({
      // login
      password: 'password',
      login: 'login',
      fullName: `fullname`,
      // phone: patient.mobileNumber,
      email: 'email',
    });
    
    
// login
connectyCube.login({
      // login
      password: 'password',
      login: 'login',
    });
   
    
// send push notification
connectyCube.sendPushNotification({
      // login
      password: 'password',
      login: 'login',
      notification: 'string'
    });
    
// create session
connectyCube.createSession({
      // login
      password: 'password',
      login: 'login',
    });

```
