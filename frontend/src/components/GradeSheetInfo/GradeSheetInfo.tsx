import { Container, Paper } from '@material-ui/core'
import React, { useState } from 'react'
import styles from '../../pages/Admin/ManageSheet/ManageSheet.module.css'
import AddButton from '../AddButton'
import UButton from '../UButton'
import FindModal from '../FindModal/FindModal'
import { useTeamProjects } from '../../hooks/useQuery/useTeamProjects'
import { TeamProjectDto } from '../../api/TeamProjects.api'
import DeleteButton from '../DeleteButton'
import { User } from '../../models'
import {
  useAddReviewer,
  useSetMentorForSheet,
  useSetProjectForSheet,
  useSetReviewersForSheet,
  useSheet,
  useUsersOfType,
} from '../../hooks'
import { useParams } from 'react-router-dom'

export interface GradeSheetInfoProps { }

export const GradeSheetInfo: React.FC<GradeSheetInfoProps> = () => {
  let { sheetId } = useParams<{ sheetId: string }>()
  const { data: sheet } = useSheet(sheetId)
  const [openMentorsModal, setOpenMentorsModal] = useState<boolean>(false)
  const [openProjectsModal, setOpenProjectsModal] = useState<boolean>(false)
  const [openReviewersModal, setOpenReviewersModal] = useState<boolean>(false)

  const mentorsQuery = useUsersOfType('Mentor', {
    enabled: openMentorsModal || openReviewersModal,
  })
  const teamProjectsQuery = useTeamProjects({
    enabled: openProjectsModal,
  })

  const { mutate: setMentorForSheet } = useSetMentorForSheet(sheetId, {})
  const { mutate: setProjectForSheet } = useSetProjectForSheet(sheetId, {})
  const { mutate: addReviewer } = useAddReviewer(sheetId, {})
  const { mutate: setReviewersForSheet } = useSetReviewersForSheet(sheetId, {})

  const handleProjectSelection = (row: any) => {
    setOpenProjectsModal(false)
    setProjectForSheet(row.id)
  }

  const handleMentorSelection = (row: User) => {
    setOpenMentorsModal(false)
    setMentorForSheet(row.id)
  }

  const handleReviewerSelection = (row: any) => {
    setOpenReviewersModal(false)
    addReviewer(row.id)
  }

  const deleteReviewer = (id: string) => {
    const newReviewers = (sheet?.reviewers ?? [])
      .map((rev) => rev.id)
      .filter((rev) => rev !== id)
    setReviewersForSheet(newReviewers)
  }

  const mentorColumns = [
    { field: 'name', headerName: 'Mentor name', width: 270 },
    { field: 'surname', headerName: 'Mentor surname', width: 250 },
  ]

  const projectColumns = [
    { field: 'teamProjectName', headerName: 'Name', width: 250 },
    { field: 'mentorName', headerName: 'Mentor', width: 250 },
    { field: 'projectUrl', headerName: 'Url', width: 250 },
    { field: 'sectionName', headerName: 'Section', width: 250 },
  ]

  return (
    <Paper className={styles.container}>
      <Container className={styles.manageHeader}>
        <h2>Manage Sheet</h2>
      </Container>
      <div>
        {openMentorsModal && (
          <FindModal<User>
            onRowSelection={handleMentorSelection}
            query={mentorsQuery}
            queryKey="Mentors"
            columns={mentorColumns}
            searchPlaceholder="Search by surname"
            searchBy="surname"
            name="Find mentor"
            open={openMentorsModal}
            handleClose={() => setOpenMentorsModal(false)}
            handleOpen={() => setOpenMentorsModal(true)}
          />
        )}
        {openProjectsModal && (
          <FindModal<TeamProjectDto>
            onRowSelection={handleProjectSelection}
            query={teamProjectsQuery}
            queryKey="teamProjects"
            columns={projectColumns}
            searchPlaceholder="Search by name"
            searchBy="teamProjectName"
            name="Find project"
            open={openProjectsModal}
            handleClose={() => setOpenProjectsModal(false)}
            handleOpen={() => setOpenProjectsModal(true)}
          />
        )}
        {openReviewersModal && (
          <FindModal<User>
            onRowSelection={handleReviewerSelection}
            query={mentorsQuery}
            queryKey="Mentors"
            columns={mentorColumns}
            searchPlaceholder="Search by surname"
            searchBy="surname"
            name="Find mentor reviewer"
            open={openReviewersModal}
            handleClose={() => setOpenReviewersModal(false)}
            handleOpen={() => setOpenReviewersModal(true)}
          />
        )}
        <ul className={styles.teamInfo}>
          <li className={styles.teamInfoRow} key="ProjectInfo">
            <span>Project:</span>
            <span>{sheet?.projectName}</span>
            <UButton
              test-id="change-project"
              text="Change"
              color="primary"
              onClick={() => setOpenProjectsModal(true)}
            />
          </li>
          <li className={styles.teamInfoRow} key="MentorInfo">
            <span>Mentor:</span>
            <span>{sheet?.mentorName ?? '--- ---'}</span>
            <UButton
              test-id="change-mentor"
              text="Change"
              color="primary"
              onClick={() => setOpenMentorsModal(true)}
            />
          </li>
          <li className={styles.reviewersInfo} key="ReviewersInfo">
            <span>Reviewers:</span>
            <ul className={styles.reviewers}>
              {(sheet?.reviewers ?? []).map((reviewer) => (
                <li className={styles.reviewerInfoRow} key={reviewer.id}>
                  <span>{reviewer.name}</span>
                  <DeleteButton
                    confirmTitle={`Are you sure you want to delete reviewer ${reviewer.name}?`}
                    onConfirm={() => deleteReviewer(reviewer.id)}
                  />
                </li>
              ))}
              <li key="AddReviewer">
                <AddButton
                  text="Add reviewer"
                  onClick={() => setOpenReviewersModal(true)}
                />
              </li>
            </ul>
          </li>
        </ul>

        <ul className={styles.teamInfo}>
          <li className={styles.teamInfoRow}>
            <span>Url:</span>
            <span>{sheet?.projectUrl}</span>
          </li>
          <li className={styles.teamInfoRow}>
            <span>Description:</span>
            <span>{sheet?.projectDescription}</span>
          </li>
        </ul>
      </div>
    </Paper>
  )
}
