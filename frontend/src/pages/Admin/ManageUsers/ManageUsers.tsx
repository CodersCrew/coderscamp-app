import React from 'react'
import { Paper } from '@material-ui/core'
import styles from './ManageUsers.module.css'
import SelectSortBy from '../../../components/SelectSortBy'
import SearchInput from '../../../components/SearchInput'
import ReusableTable from '../../../components/ReusableTable'
import { useHistory } from 'react-router-dom'
import useMultipleSelect from '../../../hooks/useMultipleSelect'
import {
  User,
  UserType,
  UserStatus,
  UserTypeName,
  UserStatusName,
  UserFilters,
  invUserStatusDict,
  invUserTypeDict,
} from '../../../models'
import PageHeader from '../../../components/PageHeader'
import {
  useUsers,
  searchUser,
  sortUsers,
  filterUsers,
  useDidUpdateEffect,
} from '../../../hooks'
import { PageContainer } from '../../../components/PageContainer'

export interface ManageUsersProps {}

const ManageUsers: React.FC<ManageUsersProps> = () => {
  const { isLoading, error, data, isFetching } = useUsers()
  const history = useHistory()
  const tableName = 'Users'

  const [statusSelect, statusFilters] = useMultipleSelect<UserStatusName>({
    options: Object.keys(invUserStatusDict),
    label: 'Filter by status',
  })
  const [typeSelect, typeFilters] = useMultipleSelect<UserTypeName>({
    options: Object.keys(invUserTypeDict),
    label: 'Filter by type',
  })

  const changeSortBy = (value: string) => {
    sortUsers(value as keyof User)
  }

  const changeSearch = (searchTerm: string) => {
    const column = /([-.,&_`() ]|[a-zA-Z0-9]|[À-Ö]|[Ø-ö]|[ø-ǿ]|[Ȁ-ʯ]|[̀-ͯ]|[Ḁ-ỿ]|[Ⅰ-ↈ])+/i.test(
      searchTerm,
    )
      ? 'surname'
      : 'id'
    searchUser(column as keyof User, searchTerm)
  }

  useDidUpdateEffect(() => {
    const filters: UserFilters = {
      type: typeFilters.map(
        (type) => invUserTypeDict[type] as UserType,
      ) as UserType[],
      status: statusFilters.map(
        (status) => invUserStatusDict[status] as UserStatus,
      ) as UserStatus[],
    }
    filterUsers(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilters, statusFilters])

  const sortByOptions = ['name', 'surname', 'type', 'status']
  const columns = [
    { field: 'name', headerName: 'Name', width: 150, sortable: true },
    { field: 'surname', headerName: 'Surname', width: 150, sortable: true },
    { field: 'type', headerName: 'Type', width: 150, sortable: true },
    { field: 'status', headerName: 'Status', width: 130, sortable: true },
  ]

  function handleSelection(params: any) {
    const userID = params.row.id
    const path = `users/${userID}`
    history.push(path)
  }

  return (
    <PageContainer label="Manage Users">
      <PageHeader name="Users">
        <SearchInput
          onSubmit={changeSearch}
          placeholder="User last name or ID"
        />
      </PageHeader>
      <Paper className={styles.tableContainer}>
        <div className={styles.manageContainer}>
          <h2 className={styles.manageHeader}>Manage Users</h2>
          <div className={styles.filtersContainer}>
            {statusSelect}
            {typeSelect}
          </div>
          <span className={styles.selectSortBy}>
            <SelectSortBy
              onChange={changeSortBy}
              initialValue=""
              options={sortByOptions}
            />
          </span>
        </div>
        <ReusableTable
          name={tableName}
          columns={columns}
          onRowClick={handleSelection}
          isLoading={isLoading}
          error={error}
          data={data}
          isFetching={isFetching}
        />
      </Paper>
    </PageContainer>
  )
}

export default React.memo(ManageUsers)
