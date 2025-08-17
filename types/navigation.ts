// Navigation parameter types for type-safe navigation

export type AuthStackParamList = {
  phone: undefined;
  otp: {
    phone?: string;
    email?: string;
    method: 'PHONE' | 'EMAIL';
  };
  profile: {
    isNewUser?: boolean;
  };
};

export type AppStackParamList = {
  '(tabs)': undefined;
  'chat/[id]': {
    id: string;
    title?: string;
  };
  'chat/group/[id]': {
    id: string;
    title?: string;
  };
  contacts: undefined;
  profile: undefined;
};

export type TabsParamList = {
  chats: undefined;
  settings: undefined;
};

export type RootStackParamList = {
  '(auth)': undefined;
  '(app)': undefined;
};

// Deep linking types
export type LinkingConfig = {
  screens: {
    '(auth)': {
      screens: {
        otp: {
          path: '/verify-otp';
          parse: {
            token: (token: string) => token;
            phone: (phone: string) => phone;
            email: (email: string) => email;
          };
        };
      };
    };
    '(app)': {
      screens: {
        '(tabs)': {
          screens: {
            chats: 'chats';
          };
        };
        'chat/[id]': 'chat/:id';
      };
    };
  };
};