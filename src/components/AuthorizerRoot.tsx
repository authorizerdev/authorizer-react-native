import React, { FC, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import type { AuthToken } from '@authorizerdev/authorizer-js';
import { Views } from '../constants';
import { useAuthorizer } from '../contexts/AuthorizerContext';
import { styles } from '../styles';

const AuthorizerRoot: FC<{
  onLogin?: (data: AuthToken) => void;
  onSignup?: (data: AuthToken) => void;
  onMagicLinkLogin?: (data: any) => void;
  onForgotPassword?: (data: any) => void;
}> = ({ onLogin, onSignup, onMagicLinkLogin, onForgotPassword }) => {
  const [view, setView] = useState(Views.Login);
  const { config } = useAuthorizer();
  return (
    <SafeAreaView style={styles().wrapper}>
      {view === Views.Login &&
        config.is_basic_authentication_enabled &&
        !config.is_magic_link_login_enabled && (
          <Text>AuthorizerBasicAuthLogin</Text>
        )}

      {view === Views.Signup &&
        config.is_basic_authentication_enabled &&
        !config.is_magic_link_login_enabled && <Text>AuthorizerSignup</Text>}

      {view === Views.Login && config.is_magic_link_login_enabled && (
        <Text>AuthorizerMagicLinkLogin</Text>
      )}

      {view === Views.ForgotPassword && <Text>AuthorizerForgotPassword</Text>}
    </SafeAreaView>
  );
};

export default AuthorizerRoot;
