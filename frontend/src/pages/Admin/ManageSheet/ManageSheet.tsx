import React from 'react'
import styles from './ManageSheet.module.css'
import { Container, CssBaseline } from '@material-ui/core'
import { useParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader'
import ReusableGoBack from '../../../components/ReusableGoBack'
import { useSheet } from '../../../hooks'
import { GradeSheetInfo } from '../../../components/GradeSheetInfo'
import { GradeSheetParticipants } from '../../../components/GradeSheetParticipants'
import { GradeSheetMentorGrades } from '../../../components/GradeSheetMentorGrades'
import { GradeSheetReviewerGrades } from '../../../components/GradeSheetReviewerGrades'

export interface ManageSheetProps {}

const ManageSheet: React.FC<ManageSheetProps> = () => {
  let { sheetId } = useParams<{ sheetId: string }>()
  const { data: sheet } = useSheet(sheetId)

  return (
    <Container className={styles.manageSheet} aria-label="Manage Sheet">
      <CssBaseline />
      <PageHeader>
        <ReusableGoBack
          pageName="Sheets"
          pageLink="/gradesheets"
          elementName={sheet?.mentorName ?? sheetId}
        />
      </PageHeader>

      <GradeSheetInfo />
      <GradeSheetParticipants />
      <GradeSheetMentorGrades />
      <GradeSheetReviewerGrades />
    </Container>
  )
}

export default ManageSheet
