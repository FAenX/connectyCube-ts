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

connectyCube.signup({
      // login
      password: 'password',
      login: 'login',
      fullName: `fullname`,
      // phone: patient.mobileNumber,
      email: 'email',
    });

```
