import {
  AuthorizerProvider,
  useAuthorizer,
} from './contexts/AuthorizerContext';

export function multiply(a: number, b: number): Promise<number> {
  return Promise.resolve(a / b);
}

export {
  useAuthorizer,
  // Authorizer,
  AuthorizerProvider,
  // AuthorizerSignup,
  // AuthorizerBasicAuthLogin,
  // AuthorizerMagicLinkLogin,
  // AuthorizerForgotPassword,
  // AuthorizerSocialLogin,
  // AuthorizerResetPassword,
};
