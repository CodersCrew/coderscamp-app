import React from 'react'
import { Box, LinearProgress } from '@material-ui/core'
import { useHistory } from 'react-router-dom'

import UButton from '../../../components/UButton'
import ReusableTable from '../../../components/ReusableTable'

import styles from './ReferenceProjects.module.css'

import PageHeader from '../../../components/PageHeader'
import { useProjects } from '../../../hooks'
import useSnackbar from '../../../hooks/useSnackbar'
import { PageContainer } from '../../../components/PageContainer'

export interface ReferenceProjectsProps {}

const ReferenceProjects: React.FC<ReferenceProjectsProps> = () => {
  const history = useHistory()
  const { data: refProjects, isLoading, error} = useProjects()
  const { showError } = useSnackbar()

  const columns = [
    { field: 'projectName', width: 300, headerName: 'Project name' },
    { field: 'sectionName', width: 250, headerName: 'SectionName' },
    { field: 'startDate', width: 150, headerName: 'Start date' },
    { field: 'endDate', width: 150, headerName: 'End date' },
  ]

  function handleSelection(params: any, e: any) {
    const sectionID: string = params.row.id
    const path = `projects/${sectionID}`
    history.push(path)
  }

  function handleAddButton(e: any) {
    const path = `projects/add`
    history.push(path)
  }

  if (error) showError((error as Error).message)

  if (isLoading) return <LinearProgress />
  if (!refProjects) return <div>Error...</div>

  return (
    <PageContainer label="Projects">
      <PageHeader name="Projects" />
      <Box className={styles.container}>
        <Box display="flex" className={styles.container__header}>
          <span>Manage Reference Projects</span>
          <div className={styles.container__header__button}>
            <UButton text="ADD" color="primary" onClick={handleAddButton} />
          </div>
        </Box>
        <ReusableTable
          name=""
          columns={columns}
          onRowClick={handleSelection}
          isLoading={isLoading}
          error={error}
          data={refProjects}
        />
      </Box>
    </PageContainer>
  )
}

export default ReferenceProjects
