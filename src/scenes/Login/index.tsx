import './index.less';

import * as React from 'react';

import { Button, Checkbox, Form, Input, Modal, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import imageFormLogin from '../../images/user.png';

import AccountStore from '../../stores/accountStore';
import AuthenticationStore from '../../stores/authenticationStore';
import { FormInstance } from 'antd/lib/form';
import { L } from '../../lib/abpUtility';
import { Redirect } from 'react-router-dom';
import SessionStore from '../../stores/sessionStore';
import Stores from '../../stores/storeIdentifier';
import TenantAvailabilityState from '../../services/account/dto/tenantAvailabilityState';
import rules from './index.validation';

const FormItem = Form.Item;
declare var abp: any;

export interface ILoginProps {
  authenticationStore?: AuthenticationStore;
  sessionStore?: SessionStore;
  accountStore?: AccountStore;
  history: any;
  location: any;
}

@inject(Stores.AuthenticationStore, Stores.SessionStore, Stores.AccountStore)
@observer
class Login extends React.Component<ILoginProps> {
  formRef = React.createRef<FormInstance>();
  changeTenant = async () => {
    let tenancyName = this.formRef.current?.getFieldValue('tenancyName');
    const { loginModel } = this.props.authenticationStore!;

    if (!tenancyName) {
      abp.multiTenancy.setTenantIdCookie(undefined);
      window.location.href = '/';
      return;
    } else {
      await this.props.accountStore!.isTenantAvailable(tenancyName);
      const { tenant } = this.props.accountStore!;
      switch (tenant.state) {
        case TenantAvailabilityState.Available:
          abp.multiTenancy.setTenantIdCookie(tenant.tenantId);
          loginModel.tenancyName = tenancyName;
          loginModel.toggleShowModal();
          window.location.href = '/';
          return;
        case TenantAvailabilityState.InActive:
          Modal.error({ title: L('Error'), content: L('TenantIsNotActive') });
          break;
        case TenantAvailabilityState.NotFound:
          Modal.error({ title: L('Error'), content: L('ThereIsNoTenantDefinedWithName{0}', tenancyName) });
          break;
      }
    }
  };

  handleSubmit = async (values: any) => {
    const { loginModel } = this.props.authenticationStore!;
    await this.props.authenticationStore!.login(values);
    sessionStorage.setItem('rememberMe', loginModel.rememberMe ? '1' : '0');
    const { state } = this.props.location;
    window.location = state ? state.from.pathname : '/';
  };

  public render() {
    let { from } = this.props.location.state || { from: { pathname: '/' } };
    if (this.props.authenticationStore!.isAuthenticated) return <Redirect to={from} />;

    const { loginModel } = this.props.authenticationStore!;
    return (
      <div style={{justifyContent:"center",marginTop:"10%", marginLeft:"25%",marginRight:"5%", maxHeight:"200px", maxWidth:"1000px"}}>
           <div className="row justify-content-center">
              <div className="col-xl-10 col-lg-12 col-md-9">
                  <div className="card o-hidden border-0 shadow-lg my-5"  >
                      <div className="card-body p-0" >
                          <div className="row">
                              <div className="col-lg-6 d-none d-lg-block bg-login-image" style={{backgroundImage:imageFormLogin}}></div>
                              <div className="col-lg-6">
                                  <div className="p-5">
                                      <div className="text-center">
                                          <h1 className="h4 text-gray-900 mb-4">Chào mừng trở lại!</h1>
                                      </div>
                                      <Form className="" onFinish={this.handleSubmit} ref={this.formRef}>
                                          <div className="form-group" >
                                          <FormItem name={'userNameOrEmailAddress'} rules={rules.userNameOrEmailAddress}>
                                          <Input placeholder={L('UserNameOrEmail')} prefix={<UserOutlined/>} type="email" size="large" />
                                          </FormItem>
                                          </div>
                                          <div className="form-group">
                                          <FormItem name={'password'} rules={rules.password}>
                                          <Input placeholder={L('Password')} prefix={<LockOutlined/>} type="password" size="large" />  
                                          </FormItem>
                                          </div>
                                          <div className="form-group">
                                              <div className="custom-control custom-checkbox small">
                                                  <Checkbox checked={loginModel.rememberMe} onChange={loginModel.toggleRememberMe} style={{ paddingRight: 8 }}  />
                                                    {L('RememberMe')}
                                              </div>
                                          </div>
                                          <a href="index.html" className="btn btn-primary btn-user btn-block">
                                              <Button style={{ backgroundColor: 'transparent', color: 'white', borderRadius:'8px',height:'0px', borderColor:'transparent' }} htmlType={'submit'}>
                                                  Login
                                              </Button>
                                          </a>
                                          
                                          <Divider> Phương thức đăng nhập khác </Divider>

                                          <a href="index.html" className="btn btn-google btn-user btn-block">
                                              <i className="fab fa-google fa-fw"></i> Login with Google
                                          </a>
                                      </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
              </div>
           </div>
    );
  }
}

export default Login;
