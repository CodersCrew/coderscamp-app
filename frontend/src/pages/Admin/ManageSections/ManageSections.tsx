import React from 'react'
import { useHistory } from 'react-router-dom'
import { Paper } from '@material-ui/core'
import { GridValueFormatterParams } from '@material-ui/data-grid'
import { useSelector } from 'react-redux'

import SelectSortBy from '../../../components/SelectSortBy'
import SearchInput from '../../../components/SearchInput'
import ReusableTable from '../../../components/ReusableTable'
import UButton from '../../../components/UButton'
import PageHeader from '../../../components/PageHeader'
import { searchSection, sortSections, useSections } from '../../../hooks'
import { ManageSection } from '../../../models'
import { displayFormattedDate } from '../../../api'
import { PageContainer } from '../../../components/PageContainer'
import { RootState } from '../../../app/store'

import styles from './ManageSections.module.css'

export interface ManageSectionsProps {}

const ManageSections: React.FC<ManageSectionsProps> = () => {
  const history = useHistory()
  const tableName = 'Sections'
  const courseId = useSelector(
    (state: RootState) => state.courseList.activeCourse?._id || '',
  )
  const { data: sections, isLoading, isFetching, error } = useSections(courseId)

  const changeSortBy = (value: string) => {
    sortSections(value as keyof ManageSection)
  }

  const changeSearch = (value: string) => {
    const column = /^[0-9a-fA-F]{1,16}$/.test(value) ? 'id' : 'name'
    searchSection(column, value)
  }

  const handleRowClick = (data: { id: string | number }) => {
    history.push(`/sections/${data.id}/edit`)
  }

  const handleAddClick = () => {
    history.push('/sections/create')
  }

  const sortByOptions = ['name', 'startDate', 'endDate', 'courseName']
  const columns = [
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    {
      field: 'startDate',
      headerName: 'Start date',
      width: 200,
      sortable: true,
      valueFormatter: (params: GridValueFormatterParams) =>
        displayFormattedDate(params.value as number),
    },
    {
      field: 'endDate',
      headerName: 'End date',
      width: 200,
      sortable: true,
      valueFormatter: (params: GridValueFormatterParams) =>
        displayFormattedDate(params.value as number),
    },
    {
      field: 'courseName',
      headerName: 'Course name',
      width: 150,
      sortable: true,
    },
  ]

  return (
    <PageContainer label="Manage Sections">
      <PageHeader name="Sections">
        <SearchInput
          onSubmit={changeSearch}
          placeholder="Search by ID or section name"
        />
      </PageHeader>
      <Paper className={styles.container}>
        <div className={styles.manageContainer}>
          <h2 className={styles.manageHeader}>Manage Sections</h2>
          <span className={styles.addButton} aria-label="Add section">
            <UButton text="ADD" color="primary" onClick={handleAddClick} />
          </span>
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
          onRowClick={handleRowClick}
          data={sections}
          isFetching={isFetching}
          isLoading={isLoading}
          error={error}
        />
      </Paper>
    </PageContainer>
  )
}

export default ManageSections
