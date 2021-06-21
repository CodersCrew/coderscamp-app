import { Paper } from '@material-ui/core'
import React, { useRef, useState } from 'react'
import styles from '../../pages/Admin/ManageSheet/ManageSheet.module.css'
import AddButton from '../AddButton'

import FindModal from '../FindModal/FindModal'
import DeleteButton from '../DeleteButton'
import { User } from '../../models'
import {
  useAddUserToSheet,
  useDeleteUserFromSheet,
  useSheet,
  useUsersOfType,
} from '../../hooks'
import { useParams } from 'react-router-dom'
import { GridSelectionModelChangeParams } from '@material-ui/data-grid'
import ReusableTable from '../ReusableTable'

export interface GradeSheetParticipantsProps {}

export const GradeSheetParticipants: React.FC<GradeSheetParticipantsProps> = () => {
  const participantsTableName = 'Participants'
  let { sheetId } = useParams<{ sheetId: string }>()
  const { data: sheet, error, isLoading, isFetching } = useSheet(sheetId)
  const selectedParticipants = useRef<string[]>([])
  const [openUsersModal, setOpenUsersModal] = useState<boolean>(false)
  const { mutate: addParticipant } = useAddUserToSheet(sheetId, {})
  const { mutate: deleteParticipant } = useDeleteUserFromSheet(sheetId, {})
  const participantsQuery = useUsersOfType('Participant', {
    enabled: openUsersModal,
  })

  const handleAddUserSelection = (row: User) => {
    addParticipant(row.id)
  }

  const handleParticipantSelection = (row: GridSelectionModelChangeParams) => {
    selectedParticipants.current = row.selectionModel as string[]
  }

  const deleteSelectedUsers = () => {
    selectedParticipants.current.forEach((user) => deleteParticipant(user))
    selectedParticipants.current = []
  }

  const participantColumns = [
    { field: 'name', headerName: 'Participant name', width: 270 },
    { field: 'surname', headerName: 'Participant surname', width: 250 },
  ]

  return (
    <Paper className={styles.container}>
      <div className={styles.manageContainer}>
        {openUsersModal && (
          <FindModal<User>
            onRowSelection={handleAddUserSelection}
            query={participantsQuery}
            queryKey="Participants"
            columns={participantColumns}
            searchPlaceholder="Search by surname"
            searchBy="surname"
            name="Find participant"
            open={openUsersModal}
            handleClose={() => setOpenUsersModal(false)}
            handleOpen={() => setOpenUsersModal(true)}
          />
        )}
        <h2 className={styles.manageHeader}>Users</h2>
        <div className={styles.buttons}>
          <AddButton
            aria-label="Add participant"
            text="Add"
            onClick={() => setOpenUsersModal(true)}
          />
          <DeleteButton
            confirmTitle="Are you sure you want to delete this user?"
            onConfirm={deleteSelectedUsers}
          />
        </div>
      </div>
      <div className={styles.table}>
        <ReusableTable
          aria-label="Participants table"
          name={participantsTableName}
          columns={participantColumns}
          data={
            sheet?.participants.map((user) => ({
              id: user.id,
              name: user.name,
              surname: user.surname,
            })) ?? []
          }
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          checkboxSelection={true}
          onSelectionModelChange={handleParticipantSelection}
        />
      </div>
    </Paper>
  )
}
