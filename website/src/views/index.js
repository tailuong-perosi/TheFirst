import React, {useState} from 'react'

import { Switch, Route, Redirect, BrowserRouter } from 'react-router-dom'
import { ROUTES } from 'consts'

import { getshopping, getshoppingone} from 'apis/shopping_dairy'


//base layout
import BaseLayout from 'components/Layout'
import Authentication from 'components/authentication'

//views
import LoginBusiness from './login-business'
import Login from './login'
import Register from './register'
import OTP from './otp'
import Setting from './setting'
import PasswordNew from './password-new'
import ForgetPassword from './forget-password'
import Overview from './overview'
import VerifyAccount from './verify-account'

import NotFound from './not-found/404'


import Brand from './brand'


const DEFINE_ROUTER = [


  
  

  
 
  

  {
    path: ROUTES.OVERVIEW,
    Component: () => <Overview />,
    title: 'Tổng quan',
    permissions: [],
    exact: true,
  },
 


  
  
 
 
  {
    path: ROUTES.SETTING,
    Component: () => <Setting />,
    title: 'Cài đặt',
    permissions: [],
    exact: true,
  },


  {
    path: ROUTES.BRAND,
    Component: () => <Brand />,
    title: 'Danh sách thương hiệu',
    permissions: [],
    exact: true,
  },


]

const AUTH_ROUTER = [
  {
    path: ROUTES.CHECK_SUBDOMAIN,
    Component: () => <LoginBusiness />,
    exact: true,
    title: 'Login business',
    permissions: [],
  },
  {
    path: ROUTES.LOGIN,
    Component: () => <Login />,
    exact: true,
    title: 'Login',
    permissions: [],
  },
  {
    path: ROUTES.REGISTER,
    Component: () => <Register />,
    exact: true,
    title: 'Register',
    permissions: [],
  },
  {
    path: ROUTES.OTP,
    Component: () => <OTP />,
    exact: true,
    title: 'OTP',
    permissions: [],
  },
  {
    path: ROUTES.VERIFY_ACCOUNT,
    Component: () => <VerifyAccount />,
    title: 'Xác thực tài khoản',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.PASSWORD_NEW,
    Component: () => <PasswordNew />,
    exact: true,
    title: 'New password',
    permissions: [],
  },
  {
    path: ROUTES.FORGET_PASSWORD,
    Component: () => <ForgetPassword />,
    exact: true,
    title: 'Forget password',
    permissions: [],
  },


]

export default function Views() {
  
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact={true}>
          <Redirect to={ROUTES.OVERVIEW}  
          />
        </Route>

        {DEFINE_ROUTER.map(({ Component, ...rest }, index) => (
          <Route {...rest} key={index}>
            <Authentication {...rest}>
              <BaseLayout>
                <Component />
              </BaseLayout>
            </Authentication>
          </Route>
        ))}

        {AUTH_ROUTER.map(({ Component, ...rest }, index) => (
          <Route {...rest} key={index}>
            <Component />
          </Route>
        ))}

        <Route path="*">
          <NotFound />
        </Route>

        {/* ở đây */}
      </Switch>
    </BrowserRouter>
  )
}
