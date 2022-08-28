import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiRoute } from '../../utils';
import { Post } from '../../Services/index';
import { Container, Button, TextField } from '@mui/material';

const Register = () => {
  const [registered, setRegistered] = useState('');
  const [firstNameErr, setFirstNameErr] = useState('First Name');
  const [lastNameErr, setLastNameErr] = useState('Last Name');
  const [usernameErr, setUsernameErr] = useState('Username');
  const [passwordErr, setPasswordErr] = useState('Password');
  const navigate = useNavigate();

  const handleSignUp = async (): Promise<void> => {
    try {
      const body = {
        firstName: (document.getElementById('firstName-input') as HTMLInputElement).value,
        lastName: (document.getElementById('lastName-input') as HTMLInputElement).value,
        username: (document.getElementById('register-username-input') as HTMLInputElement).value,
        password: (document.getElementById('register-password-input') as HTMLInputElement).value,
      };
      console.log(body);
      const res = await Post(apiRoute.getRoute('auth'), body).catch(err => console.log(err));
      console.log(res);
      if(!body.firstName) setFirstNameErr(' please enter first name');
      else setFirstNameErr('First Name');
      if(!body.lastName) setLastNameErr(' please enter last name');
      else setLastNameErr('Last Name');
      if(!body.username) setUsernameErr(' please enter username');
      else setUsernameErr('Username');
      if(!body.password) setPasswordErr(' please enter password');
      else setPasswordErr('Password');
      
      if(res.exists) setRegistered('user already exists');
      else if (!body.firstName || !body.lastName || !body.username || !body.password) setRegistered('');
      else {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', body.username);
        navigate('/home');
      }
    } catch (err) {
      console.log('Post failed', err);
    }
  };

  const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if(e.key === 'Enter') handleSignUp();
  };

  return (
    <Container sx={{
      height: '100vh',
      minWidth: '100%',
      justifyContent: 'center',
      display: 'flex',
      direction: 'column',
      textAlign: 'center',
      alignItems: 'center',
      backgroundSize: 'contain',
      bgColor: '#3a4a5b',
      
    }} className='backdrop'>
       <Container maxWidth='sm' className='login-container' 
       sx = {{
          width: '40%',
          minWidth: '300px',
          opacity: '95%',
          direction: 'column',
          textAlign: 'center',
          color: '#3a4a5b',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '1.5rem',
          borderRadius: '2%'
       }}>
      <div>
        <h2>VaaS Registration</h2>
      </div>
      <div>
          </div>
            <TextField
              id='firstName-input'
              label={firstNameErr}
              type='string'
              size='small'
              variant='outlined'
              margin="dense"
              onKeyDown={handleEnterKeyDown}
            />
            {/* <span className='input-error-text'>{usernameErr}</span> */}
          <div>
          </div>
            <TextField
              id='lastName-input'
              label={lastNameErr}
              type='string'
              size='small'
              variant='outlined'
              margin="dense"
              onKeyDown={handleEnterKeyDown}
            />
            {/* <span className='input-error-text'>{usernameErr}</span> */}
          <div>
          </div>
            <TextField
              id='register-username-input'
              label={usernameErr}
              type='username'
              size='small'
              autoComplete='current-username'
              variant='outlined'
              onKeyDown={handleEnterKeyDown}
              margin="dense"
            />
            {/* <span className='input-error-text'>{usernameErr}</span> */}
          <div>
            <TextField
              id='register-password-input'
              label={passwordErr}
              type='password'
              size='small'
              autoComplete='current-password'
              variant='outlined'
              margin="dense"
              onKeyDown={handleEnterKeyDown}
            />
            {/* <span className='input-error-text'>{passwordErr}</span> */}
          </div>

      {/* <Link to='/'>Go back</Link> */}
        <Container id = 'buttonContainer' sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '.5em',
          padding: '.5em',
        }}>
          <Button 
            variant='contained' 
            onClick = {() => navigate('/')}
          > Go Back
          </Button>
            
          <Button 
            variant='contained'
            onClick={handleSignUp} 
            type='button'
          > Sign Up</Button>
        </Container>
        <div><p className='input-error-text'>{registered}</p></div>
      </Container>
    </Container>
  );
};

export default Register;
