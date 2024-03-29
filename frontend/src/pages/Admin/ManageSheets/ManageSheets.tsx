import React, { useRef } from 'react'
import styles from './ManageSheets.module.css'
import AddButton from '../../../components/AddButton'
import SelectSortBy from '../../../components/SelectSortBy'
import SearchInput from '../../../components/SearchInput'
import ReusableTable from '../../../components/ReusableTable'
import {
  Container,
  CssBaseline,
  LinearProgress,
  Paper,
} from '@material-ui/core'
import { GridSelectionModelChangeParams } from '@material-ui/data-grid'
import { useHistory } from 'react-router-dom'
import DeleteButton from '../../../components/DeleteButton'
import PageHeader from '../../../components/PageHeader'
import {
  sortSheets,
  searchSheet,
  useSheets,
  useCreateSheet,
  useDeleteSheet,
  useUserMe,
} from '../../../hooks'
import { GradeSheetDto, UserType } from '../../../models'

export interface ManageSheetsProps {}

const ManageSheets: React.FC<ManageSheetsProps> = () => {
  const history = useHistory()
  const selectedSheets = useRef([] as string[])

  const tableName = 'Sheets'
  const { data: userMeData } = useUserMe()
  const { data: sheets, error, isLoading } = useSheets(userMeData)
  const { mutate: createSheet } = useCreateSheet({ invalidate: 'sheets' })
  const { mutate: deleteSheet } = useDeleteSheet({ invalidate: 'sheets' })

  const changeSortBy = (value: string) => {
    sortSheets(value as keyof GradeSheetDto)
  }

  const changeSearch = (value: string) => {
    const column = 'mentorSurname'
    const search = value
    searchSheet(column, search)
  }

  const sortByOptions = ['mentorName', 'mentorSurname', 'projectName']
  const sortByLabels = {
    mentorName: 'Mentor name',
    mentorSurname: 'Mentor surname',
    projectName: 'Project name',
  }
  const columns = [
    {
      field: 'mentorSurname',
      headerName: 'Mentor surname',
      width: 200,
      sortable: true,
    },
    {
      field: 'mentorName',
      headerName: 'Mentor name',
      width: 150,
      sortable: true,
    },
    {
      field: 'projectName',
      headerName: 'Project name',
      width: 250,
      sortable: true,
    },
  ]

  const handleSheetSelection = (params: GridSelectionModelChangeParams) => {
    selectedSheets.current = params.selectionModel as string[]
  }

  const deleteSelectedSheets = () => {
    selectedSheets.current.forEach((sheetId) => {
      deleteSheet(sheetId)
    })
    selectedSheets.current = []
  }

  const handleRowClick = (data: { id: string | number }) => {
    history.push(`/gradesheets/${data.id}`)
  }

  if (!userMeData || isLoading) return <LinearProgress />

  return (
    <Container className={styles.manageSheets} aria-label="Manage Sheets">
      <CssBaseline />
      <PageHeader name="Sheets">
        <SearchInput
          onSubmit={changeSearch}
          placeholder="Search by ID or mentor surname"
        />
      </PageHeader>
      <Paper className={styles.container}>
        <div className={styles.manageContainer}>
          <h2 className={styles.manageHeader}>Manage Sheets</h2>
          {userMeData.type === UserType.Admin && (
            <div className={styles.buttons}>
              <AddButton
                text="Add"
                onClick={() => createSheet(null)}
                aria-label="Add sheet"
              />
              <DeleteButton
                confirmTitle="Are you sure you want to delete selected grade sheets?"
                onConfirm={deleteSelectedSheets}
              />
            </div>
          )}
          <span className={styles.selectSortBy}>
            <SelectSortBy
              onChange={changeSortBy}
              initialValue=""
              options={sortByOptions}
              labels={sortByLabels}
            />
          </span>
        </div>
        <ReusableTable
          name={tableName}
          columns={columns}
          isLoading={isLoading}
          error={error}
          data={sheets ?? []}
          onRowClick={handleRowClick}
          onSelectionModelChange={handleSheetSelection}
          checkboxSelection
        />
      </Paper>
    </Container>
  )
}

export default ManageSheets
