export const { Hub } = jest.requireActual('aws-amplify');

const mockDefaultCurrentSession = {
    idToken: { payload: {'custom:tenant': 'test'} },
    accessToken: { payload: {
            username: 'mockuname',
            sub: 'mocksub'
}}};



export const Auth = {
    currentSession: jest.fn(() => Promise.resolve(mockDefaultCurrentSession)),
    currentAuthenticatedUser: jest.fn(() => Promise.resolve({
        username: 'testuser1',
        deleteUser: jest.fn(() => Promise.resolve('deleted')),
    })),
    userAttributes: jest.fn(() => Promise.resolve([
        {Name: 'sub', Value: 'test'},
        {Name: 'email_verified', Value: 'true'},
        {Name: 'email', Value: 'testuser1@test.com'},
        {Name: 'custom:tenant', Value: 'test'},
        {Name: 'phone_number_verified', Value: 'false'},
        {Name: 'phone_number', Value: '111'},
    ])),
    updateUserAttributes: jest.fn(() => Promise.resolve()),
    verifyCurrentUserAttribute: jest.fn(() => Promise.resolve()),
    verifyCurrentUserAttributeSubmit: jest.fn(() => Promise.resolve()),
    signIn: jest.fn(() => Promise.resolve()),
    signOut: jest.fn(() => Promise.resolve()),
    changePassword: jest.fn((currUsr, oldpass, newpass) => Promise.resolve('changed')),
};

export const Storage = {
    configure: jest.fn(() => Promise.resolve('origMockfile')),
    get: jest.fn(() => Promise.resolve('origMockfile')),
    put: jest.fn(() => Promise.resolve('origMockfile')),
    remove: jest.fn(() => Promise.resolve('removed origMockfile')),
    list: jest.fn(() => Promise.resolve([
        {key: "public/", size: 0},
        {key: "public/testlabel1", size: 23470},
        {key: "public/testlabel2", size: 22270},
    ]))
}

// used by layout before every authenticated page
export const mockAPIgqlGetCurrentUser = {
    'data': {
        'getCurrentUser': {
            adisable: null, agroups: null,
            nname: "user3test - legacy primary",
            perm: "standard", userid: "mockgraphql"
}}};
export const API = {
    post: jest.fn(() => Promise.resolve({'message': 'passed'})),
    graphql: jest.fn(() => Promise.resolve(mockAPIgqlGetCurrentUser)),
};

