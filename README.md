# connectyCube-ts

```javascript

connectycube typescript wrapper

import {ConnectyCube} from '@coderafiki/connectycube-ts'


const {
  CB_KEY,
  CB_AUTH,
  CB_APP_ID,
  CB_SECRET,
} = process.env;




const connectyCube = new ConnectyCube(
    CB_KEY + '', CB_AUTH + '', CB_APP_ID + '', CB_SECRET + '')

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
