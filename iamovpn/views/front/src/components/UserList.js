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
    IconButton,
    Typography,
    Tooltip,
    Modal
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import LockOpen from '@material-ui/icons/LockOpen';
import Lock from '@material-ui/icons/Lock';
import VpnKey from '@material-ui/icons/VpnKey';
import { withStyles } from '@material-ui/core/styles';

import UserForm from "./UserForm";
import PasswordForm from "./PasswordForm";
import * as userActions from "../modules/user";


const styles = theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
});


class UserList extends Component {
    constructor(props) {
        super(props);
        const {size} = this.props;

        this.state = {
            tableSize: size,
            page: 0,
            keyword: '',
            selectedUser: null,
            createUser: false,
            passwordChange: null
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(userActions.getList(
            this.state.keyword,
            this.state.page * this.state.tableSize,
            this.state.tableSize,
        ))
    };

    handleFindKeyword(e) {
        const { dispatch } = this.props;
        dispatch(userActions.getList(
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

        dispatch(userActions.getList(
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

        dispatch(userActions.getList(
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

    handleUserForm(success) {
        const { dispatch } = this.props;
        const newState = {
            createUser: false,
            selectedUser: null,
            passwordChange: null
        };

        if (success) {
            newState.page = 0;
            dispatch(userActions.getList(
                this.state.keyword,
                0,
                this.state.tableSize
            ))
        }

        this.setState(newState);
    };

    renderUsers() {
        const {users} = this.props;
        let result = [];

        if (users.length === 0) {
            result = [
                <TableRow key="user_list_0">
                    <TableCell align={"center"} colSpan={7}>Empty</TableCell>
                </TableRow>
            ]
        } else {
            users.forEach(user => {
                result.push(
                    <TableRow key={user.uid}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.admin? "True" : "False"}</TableCell>
                        <TableCell>
                            {user.active?
                                <Tooltip title="non-Block">
                                    <IconButton size="small">
                                        <LockOpen />
                                    </IconButton>
                                </Tooltip>
                                :
                                <Tooltip title="Blocked">
                                    <IconButton color="secondary" size="small">
                                        <Lock />
                                    </IconButton>
                                </Tooltip>
                            }
                        </TableCell>
                        <TableCell>{user.created.format("YYYY-MM-DD HH:mm")}</TableCell>
                        <TableCell>{user.updated.format("YYYY-MM-DD HH:mm")}</TableCell>
                        <TableCell>
                            <Tooltip title="Edit" size="small">
                                <IconButton
                                    onClick={() => this.setState({selectedUser: user})}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Change password" size="small">
                                <IconButton
                                    onClick={() => this.setState({passwordChange: user})}
                                >
                                    <VpnKey />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                )
            })
        }

        return result;
    };

    render() {
        const {classes} = this.props;
        return <Paper>
            <Modal
                className={classes.modal}
                open={this.state.createUser}
                onClose={() => this.setState({createUser: false})}
            >
                <Paper
                    className={classes.paper}>
                    <UserForm
                        title="Create user"
                        callback={this.handleUserForm.bind(this)}
                    />
                </Paper>
            </Modal>
            <Modal
                className={classes.modal}
                open={this.state.selectedUser !== null}
                onClose={() => this.setState({selectedUser: null})}
            >
                <Paper
                    className={classes.paper}>
                    <UserForm
                        title="Modify user"
                        user={this.state.selectedUser}
                        callback={this.handleUserForm.bind(this)}
                    />
                </Paper>
            </Modal>
            <Modal
                className={classes.modal}
                open={this.state.passwordChange !== null}
                onClose={() => this.setState({passwordChange: null})}
            >
                <Paper
                    className={classes.paper}>
                    <PasswordForm
                        uid={this.state.passwordChange? this.state.passwordChange.uid : null}
                        callback={this.handleUserForm.bind(this)}
                    />
                </Paper>
            </Modal>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Typography
                                align="left"
                                variant="h6"
                            >
                                Users
                                <Tooltip title="Add">
                                    <IconButton
                                        onClick={() => this.setState({createUser: true})}
                                        color="primary"
                                    >
                                        <AddBox />
                                    </IconButton>
                                </Tooltip>
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={4} align="right">
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
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell>Block</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Updated</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.renderUsers()}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} />
                        <TablePagination
                            colSpan={3}
                            count={this.props.user_count}
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
        users: state.user.get('users'),
        user_count: state.user.get('user_count')
    }
};
export default connect(mapStateToProps)(withStyles(styles)(UserList));