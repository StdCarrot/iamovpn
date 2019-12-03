import { createAction, handleActions } from "redux-actions";
import { Map } from "immutable";
import moment from "moment";

const CHECK_SESSION = "iamovpn/user/CHECK_SESSION";
const CHECK_SESSION_SUCCESS = "iamovpn/user/CHECK_SESSION_SUCCESS";
const CHECK_SESSION_FAIL = "iamovpn/user/CHECK_SESSION_FAIL";
const LOGIN = "iamovpn/user/LOGIN";
const LOGIN_SUCCESS = "iamovpn/user/LOGIN_SUCCESS";
const LOGOUT = "iamovpn/user/LOGOUT";
const GET = "iamovpn/user/GET";
const GET_SUCCESS = "iamovpn/user/GET_SUCCESS";
const GET_FAIL = "iamovpn/user/GET_FAIL";
const CREATE = "iamovpn/user/CREATE";
const CREATE_SUCCESS = "iamovpn/user/CREATE_SUCCESS";
const CREATE_FAIL = "iamovpn/user/CREATE_FAIL";
const MODIFY = "iamovpn/user/MODIFY";
const MODIFY_SUCCESS = "iamovpn/user/MODIFY_SUCCESS";
const MODIFY_FAIL = "iamovpn/user/MODIFY_FAIL";
const MODIFY_PASSWORD = "iamovpn/user/MODIFY_PASSWORD";
const MODIFY_PASSWORD_SUCCESS = "iamovpn/user/MODIFY_PASSWORD_SUCCESS";
const MODIFY_PASSWORD_FAIL = "iamovpn/user/MODIFY_PASSWORD_FAIL";
const MODIFY_MY_PASSWORD = "iamovpn/user/MODIFY_MY_PASSWORD";
const MODIFY_MY_PASSWORD_SUCCESS = "iamovpn/user/MODIFY_MY_PASSWORD_SUCCESS";
const MODIFY_MY_PASSWORD_FAIL = "iamovpn/user/MODIFY_MY_PASSWORD_FAIL";
const GET_LIST = "iamovpn/user/GET_LIST";
const GET_LIST_SUCCESS = "iamovpn/user/GET_LIST_SUCCESS";
const GET_LIST_FAIL = "iamovpn/user/GET_LIST_FAIL";
const GET_CONFIG = "iamovpn/user/GET_CONFIG";
const GET_CONFIG_SUCCESS = "iamovpn/user/GET_CONFIG_SUCCESS";
const GET_CONFIG_FAIL = "iamovpn/user/GET_CONFIG_FAIL";


export const checkSession = createAction(
    CHECK_SESSION,
    () => {
        return {
            request: {
                method: "GET",
                url: "/api/user/me"
            }
        }
    }
);
export const login = createAction(
    LOGIN,
    (id, pwd) => {
        return {
            request: {
                method: "POST",
                url: "/api/secure/login",
                data: {
                    id: id,
                    password: pwd
                }
            }
        }
    }
);
export const logout = createAction(
    LOGOUT,
    () => {
        return {
            request: {
                method: "DELETE",
                url: "/api/secure/login"
            }
        }
    }
);
export const get = createAction(
    GET,
    (uid) => {
        return {
            request: {
                method: "GET",
                url: `/api/user/${uid}`
            }
        }
    }
);
export const create = createAction(
    CREATE,
    (user) => {
        console.log(user);
        return {
            request: {
                method: "POST",
                url: "/api/user",
                data: user
            }
        }
    }
);
export const modify = createAction(
    MODIFY,
    (user_uid, user) => {
        return {
            request: {
                method: "PUT",
                url: `/api/user/${user_uid}`,
                data: user
            }
        }
    }
);
export const modifyPassword = createAction(
    MODIFY_PASSWORD,
    (user_uid, password) => {
        return {
            request: {
                method: "PUT",
                url: `/api/user/${user_uid}/password`,
                data: {
                    password: password
                }
            }
        }
    }
);
export const modifyMyPassword = createAction(
    MODIFY_MY_PASSWORD,
    (old_pwd, new_pwd) => {
        return {
            request: {
                method: "PUT",
                url: `/api/secure/password`,
                data: {
                    old: old_pwd,
                    new: new_pwd
                }
            }
        }
    }
);
export const getList = createAction(
    GET_LIST,
    (keyword, offset, length) => {
        return {
            request: {
                method: "GET",
                url: "/api/user",
                params: {
                    keyword: keyword,
                    offset: offset,
                    length: length
                }
            }
        }
    }
);
export const getConfig = createAction(
    GET_CONFIG,
    () => {
        return {
            request: {
                method: "GET",
                url: "/api/user/config"
            }
        }
    }
);

const initialState = Map({
    me: null,
    user: null,
    users: [],
    user_count: 0,
    config: null
});
const noUpdate = (state, action) => {
    return state
};
const user = handleActions({
    [CHECK_SESSION]: noUpdate,
    [CHECK_SESSION_SUCCESS]: (state, action) => {
        return state.set("me", action.payload.data.user);
    },
    [CHECK_SESSION_FAIL]: (state, action) => {
        return state.set("me", null);
    },
    [LOGIN]: noUpdate,
    [LOGIN_SUCCESS]: (state, action) => {
        return state.set("me", action.payload.data.user);
    },
    [LOGOUT]: (state, action) => {
        return state.set("me", null);
    },
    [GET]: noUpdate,
    [GET_SUCCESS]: (state, action) => {
        return state.set("user", action.payload.data.user);
    },
    [GET_FAIL]: (state, action) => {
        return state.set("user", null);
    },
    [CREATE]: noUpdate,
    [CREATE_SUCCESS]: noUpdate,
    [CREATE_FAIL]: noUpdate,
    [MODIFY]: noUpdate,
    [MODIFY_SUCCESS]: (state, action) => {
        const user = action.payload.data.user;
        user.created = new moment(user.created);
        user.updated = new moment(user.updated);
        return state.set("user", user);
    },
    [MODIFY_FAIL]: noUpdate,
    [MODIFY_PASSWORD]: noUpdate,
    [MODIFY_PASSWORD_SUCCESS]: noUpdate,
    [MODIFY_PASSWORD_FAIL]: noUpdate,
    [MODIFY_MY_PASSWORD]: noUpdate,
    [MODIFY_MY_PASSWORD_SUCCESS]: noUpdate,
    [MODIFY_MY_PASSWORD_FAIL]: noUpdate,
    [GET_LIST]: noUpdate,
    [GET_LIST_SUCCESS]: (state, action) => {
        const users = action.payload.data.users;
        users.forEach(user => {
            user.created = new moment(user.created);
            user.updated = new moment(user.updated);
        });
        return state.set("users", users)
                    .set("user_count", action.payload.data.count);
    },
    [GET_LIST_FAIL]: (state, action) => {
        return state.set("users", []).set("user_count", 0)
    },
    [GET_CONFIG]: noUpdate,
    [GET_CONFIG_SUCCESS]: (state, action) => {
        return state.set("config", action.payload.data.config);
    },
    [GET_CONFIG_FAIL]: noUpdate,
}, initialState);
export default user;