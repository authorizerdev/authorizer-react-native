/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  FC,
  createContext,
  useReducer,
  useContext,
  useRef,
  useEffect,
} from 'react';
import {
  Authorizer,
  User,
  AuthToken,
  ConfigType,
} from '@authorizerdev/authorizer-js';

import {
  AuthorizerContextPropsType,
  AuthorizerState,
  AuthorizerProviderAction,
  AuthorizerProviderActionType,
} from '../types';

const getIntervalDiff = (accessTokenExpiresAt: number): number => {
  const expiresAt = accessTokenExpiresAt * 1000 - 300000;
  const currentDate = new Date();

  const millisecond = new Date(expiresAt).getTime() - currentDate.getTime();
  return millisecond;
};

const AuthorizerContext = createContext<AuthorizerContextPropsType>({
  config: {
    authorizerURL: '',
    redirectURL: '/',
    is_google_login_enabled: false,
    is_github_login_enabled: false,
    is_facebook_login_enabled: false,
    is_email_verification_enabled: false,
    is_basic_authentication_enabled: false,
    is_magic_link_login_enabled: false,
  },
  user: null,
  token: null,
  loading: false,
  setLoading: () => {},
  setToken: () => {},
  setUser: () => {},
  setAuthData: () => {},
  authorizerRef: new Authorizer({
    authorizerURL: `http://localhost:8080`,
    redirectURL: '/',
  }),
  logout: async () => {},
});

function reducer(
  state: AuthorizerState,
  action: AuthorizerProviderAction
): AuthorizerState {
  switch (action.type) {
    case AuthorizerProviderActionType.SET_USER:
      return { ...state, user: action.payload.user };
    case AuthorizerProviderActionType.SET_TOKEN:
      return {
        ...state,
        token: action.payload.token,
      };
    case AuthorizerProviderActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
      };
    case AuthorizerProviderActionType.SET_CONFIG:
      return {
        ...state,
        config: action.payload.config,
      };
    case AuthorizerProviderActionType.SET_AUTH_DATA:
      return {
        ...action.payload,
      };

    default:
      throw new Error();
  }
}

let initialState: AuthorizerState = {
  user: null,
  token: null,
  loading: true,
  config: {
    authorizerURL: '',
    redirectURL: '/',
    is_google_login_enabled: false,
    is_github_login_enabled: false,
    is_facebook_login_enabled: false,
    is_email_verification_enabled: false,
    is_basic_authentication_enabled: false,
    is_magic_link_login_enabled: false,
  },
};

export const AuthorizerProvider: FC<{
  config: ConfigType;
  onStateChangeCallback?: (stateData: AuthorizerState) => Promise<void>;
}> = ({ config: defaultConfig, onStateChangeCallback, children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    config: {
      ...initialState.config,
      ...defaultConfig,
    },
  });

  let intervalRef: any = null;

  const authorizerRef = useRef(
    new Authorizer({
      authorizerURL: state.config.authorizerURL,
      redirectURL: state.config.redirectURL ? state.config.redirectURL : '/',
    })
  );

  const getToken = async () => {
    const metaRes = await authorizerRef.current.getMetaData();

    try {
      const res = await authorizerRef.current.getSession();
      if (res.access_token && res.user) {
        const token = {
          access_token: res.access_token,
          expires_at: res.expires_at,
        };
        dispatch({
          type: AuthorizerProviderActionType.SET_AUTH_DATA,
          payload: {
            ...state,
            token,
            user: res.user,
            config: {
              ...state.config,
              ...metaRes,
            },
            loading: false,
          },
        });

        const millisecond = getIntervalDiff(res.expires_at);
        if (millisecond > 0) {
          if (intervalRef) clearInterval(intervalRef);
          intervalRef = setInterval(() => {
            getToken();
          }, millisecond);
        }
      } else {
        dispatch({
          type: AuthorizerProviderActionType.SET_AUTH_DATA,
          payload: {
            ...state,
            token: null,
            user: null,
            config: {
              ...state.config,
              ...metaRes,
            },
            loading: false,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: AuthorizerProviderActionType.SET_AUTH_DATA,
        payload: {
          ...state,
          token: null,
          user: null,
          config: {
            ...state.config,
            ...metaRes,
          },
          loading: false,
        },
      });
    }
  };

  useEffect(() => {
    getToken();
    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, []);

  useEffect(() => {
    if (onStateChangeCallback) {
      onStateChangeCallback(state);
    }
  }, [state]);

  const handleTokenChange = (token: AuthToken | null) => {
    dispatch({
      type: AuthorizerProviderActionType.SET_TOKEN,
      payload: {
        token,
      },
    });

    if (token?.access_token) {
      const millisecond = getIntervalDiff(token.expires_at);
      if (millisecond > 0) {
        if (intervalRef) clearInterval(intervalRef);
        intervalRef = setInterval(() => {
          getToken();
        }, millisecond);
      }
    }
  };

  const setAuthData = (data: AuthorizerState) => {
    dispatch({
      type: AuthorizerProviderActionType.SET_AUTH_DATA,
      payload: data,
    });

    if (data.token?.access_token) {
      const millisecond = getIntervalDiff(data.token.expires_at);
      if (millisecond > 0) {
        if (intervalRef) clearInterval(intervalRef);
        intervalRef = setInterval(() => {
          getToken();
        }, millisecond);
      }
    }
  };

  const setUser = (user: User | null) => {
    dispatch({
      type: AuthorizerProviderActionType.SET_USER,
      payload: {
        user,
      },
    });
  };

  const setLoading = (loading: boolean) => {
    dispatch({
      type: AuthorizerProviderActionType.SET_LOADING,
      payload: {
        loading,
      },
    });
  };

  const logout = async () => {
    dispatch({
      type: AuthorizerProviderActionType.SET_LOADING,
      payload: {
        loading: true,
      },
    });
    await authorizerRef.current.logout();
    const loggedOutState = {
      user: null,
      token: null,
      loading: false,
      config: state.config,
    };
    dispatch({
      type: AuthorizerProviderActionType.SET_AUTH_DATA,
      payload: loggedOutState,
    });
  };

  return (
    <AuthorizerContext.Provider
      value={{
        ...state,
        setUser,
        setLoading,
        setToken: handleTokenChange,
        setAuthData: setAuthData,
        authorizerRef: authorizerRef.current,
        logout,
      }}
    >
      {children}
    </AuthorizerContext.Provider>
  );
};

export const useAuthorizer = () => useContext(AuthorizerContext);
