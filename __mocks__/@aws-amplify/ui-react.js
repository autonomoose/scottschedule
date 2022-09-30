import React from 'react';

export const Authenticator = props => {
    return (<div data-testid='authenticator'> My authent</div>);
}

export const useAuthenticator = props => {
    const user = {
        username: 'testusr',
    }
    return ({ user, authStatus: 'authenticated' });
}


