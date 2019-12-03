import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';
import moment from "moment";

const GET_LIST = 'iamovpn/log/GET_LIST';
const GET_LIST_SUCCESS = 'iamovpn/log/GET_LIST_SUCCESS';
const GET_LIST_FAIL = 'iamovpn/log/GET_LIST_FAIL';


export const getList = createAction(
    GET_LIST,
    (keyword, offset, length) => {
        return {
            request: {
                method: 'GET',
                url: '/api/log',
                params: {
                    keyword: keyword,
                    offset: offset,
                    length: length
                }
            }
        }
    }
);

const initialState = Map({
    logs: [],
    log_count: 0
});
const log = handleActions({
    [GET_LIST]: (state, action) => {
        return state
    },
    [GET_LIST_SUCCESS]: (state, action) => {
        const logs = action.payload.data.logs;
        logs.forEach(log => {
            log.created = new moment(log.created);
            log.updated = new moment(log.updated);
            log.connected = new moment(log.connected);
        });
        return state.set('logs', logs)
                    .set('log_count', action.payload.data.count);
    },
    [GET_LIST_FAIL]: (state, action) => {
        return state.set('log', []).set('log_count', 0)
    },
}, initialState);
export default log;