import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableFooter,
    TablePagination,
    TextField,
    IconButton, Typography
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import * as logActions from "../modules/log";


class LogList extends Component {
    constructor(props) {
        super(props);
        const {size} = this.props;

        this.state = {
            tableSize: size,
            page: 0,
            keyword: ''
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(logActions.getList(
            this.state.keyword,
            this.state.page * this.state.tableSize,
            this.state.tableSize,
        ))
    };

    handleFindKeyword(e) {
        const { dispatch } = this.props;
        dispatch(logActions.getList(
            this.state.keyword,
            this.state.page * this.state.tableSize,
            this.state.tableSize,
        ));

        e.preventDefault();
    };

    handleChangePage(event, newPage) {
        const { dispatch } = this.props;

        this.setState({
            page: newPage
        });

        dispatch(logActions.getList(
            this.state.keyword,
            newPage * this.state.tableSize,
            this.state.tableSize,
        ))
    };

    handleChangeRowsPerPage(event) {
        const { dispatch } = this.props;
        const newTableSize = parseInt(event.target.value, 10);

        this.setState({
            tableSize: newTableSize,
            page: 0
        });

        dispatch(logActions.getList(
            this.state.keyword,
            0,
            newTableSize,
        ))
    };

    handleChangeKeyword(e) {
        this.setState({
            keyword: e.target.value
        })
    };

    renderLogs() {
        const {logs} = this.props;
        let result = [];

        if (logs.length === 0) {
            result = [
                <TableRow key="log_list_0">
                    <TableCell align={"center"} colSpan={10}>Empty</TableCell>
                </TableRow>
            ]
        } else {
            logs.forEach(log => {
                result.push(
                    <TableRow key={log.uid}>
                        <TableCell>{log.log_type}</TableCell>
                        <TableCell>{log.user_id}</TableCell>
                        <TableCell>{log.authorized? "True" : "False"}</TableCell>
                        <TableCell>{log.updated.format("YYYY-MM-DD HH:mm")}</TableCell>
                        <TableCell>{log.remote_ip}</TableCell>
                        <TableCell>{log.remote_port}</TableCell>
                        <TableCell>{log.local_ip}</TableCell>
                        <TableCell>{log.in_bytes? `${log.in_bytes} Bytes` :""}</TableCell>
                        <TableCell>{log.out_bytes? `${log.out_bytes} Bytes` :""}</TableCell>
                        <TableCell>{log.duration}</TableCell>
                    </TableRow>
                )
            })
        }

        return result;
    };

    render() {
        return <Paper>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={5}>
                            <Typography
                                align="left"
                                variant="h6"
                            >
                                Logs
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={5} align="right">
                            <form noValidate autoComplete="off" onSubmit={this.handleFindKeyword.bind(this)}>
                                <TextField
                                    label="Keyword"
                                    value={this.state.keyword}
                                    onChange={this.handleChangeKeyword.bind(this)}
                                />
                                <IconButton type="submit">
                                    <SearchIcon/>
                                </IconButton>
                            </form>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>User ID</TableCell>
                        <TableCell>Authorized</TableCell>
                        <TableCell>Last Seen</TableCell>
                        <TableCell>Remote IP</TableCell>
                        <TableCell>Remote Port</TableCell>
                        <TableCell>Local IP</TableCell>
                        <TableCell>In Bytes</TableCell>
                        <TableCell>Out Bytes</TableCell>
                        <TableCell>Duration seconds</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.renderLogs()}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5}></TableCell>
                        <TablePagination
                            colSpan={5}
                            count={this.props.log_count}
                            rowsPerPage={this.state.tableSize}
                            page={this.state.page}
                            onChangePage={this.handleChangePage.bind(this)}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage.bind(this)}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </Paper>
    }
}


const mapStateToProps = (state) => {
    return {
        logs: state.log.get('logs'),
        log_count: state.log.get('log_count')
    }
};
export default connect(mapStateToProps)(LogList)