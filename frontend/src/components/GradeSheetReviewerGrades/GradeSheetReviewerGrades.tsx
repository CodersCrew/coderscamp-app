import { Paper } from '@material-ui/core'
import React, { useRef, useState } from 'react'
import styles from '../../pages/Admin/ManageSheet/ManageSheet.module.css'
import AddButton from '../AddButton'

import EditGradeModal from '../EditGradeModal'
import DeleteButton from '../DeleteButton'
import { Grades, SheetGrade } from '../../models'
import { usePatchMentorReviewerGrade, useSheet } from '../../hooks'
import { useParams } from 'react-router-dom'
import { GridSelectionModelChangeParams } from '@material-ui/data-grid'
import ReusableTable from '../ReusableTable'
import _ from 'lodash'

type Grade = SheetGrade & { quality: string }

function gradesObjectToArray(grades: Grades): Grade[] {
  return Object.entries(grades).map(([quality, grade]) => ({
    ...grade,
    quality,
    id: quality,
  }))
}

export interface GradeSheetReviewerGradesProps {}

export const GradeSheetReviewerGrades: React.FC<GradeSheetReviewerGradesProps> = () => {
  const selectedGrades = useRef<string[]>([])

  const [editedGrade, setEditedGrade] = useState<Grade>({
    quality: '',
    points: 0,
  })
  const [editedGradeId, setEditedGradeId] = useState('')

  let { sheetId } = useParams<{ sheetId: string }>()
  const { data: sheet, error, isLoading } = useSheet(sheetId)
  const { mutate: patchMentorReviewerGrade } = usePatchMentorReviewerGrade(
    sheetId,
    {},
  )
  const handleGradeSelection = (row: GridSelectionModelChangeParams) => {
    selectedGrades.current = row.selectionModel as string[]
  }

  const handleEditGrade = (mentorId: string) => (grades: Grades) => {
    const gradesToDelete =
      editedGrade.quality !== Object.keys(grades)[0]
        ? [editedGrade.quality]
        : []

    patchMentorReviewerGrade({ mentorId, grades, gradesToDelete })
  }

  const deleteSelectedGrades = (mentorId: string) => () => {
    patchMentorReviewerGrade({
      mentorId,
      grades: {},
      gradesToDelete: selectedGrades.current,
    })
    selectedGrades.current = []
  }

  const addMentorGrade = (mentorId: string, grade: Grade) => {
    const newGrades = {
      [grade.quality]: _.omit(grade, 'quality'),
    }
    patchMentorReviewerGrade({ mentorId, grades: newGrades })
  }

  const gradeColumns = [
    { field: 'quality', headerName: 'Quality', width: 270 },
    { field: 'points', headerName: 'Points', width: 250 },
    { field: 'comment', headerName: 'Comment', width: 250 },
  ]

  return (
    <>
      {!!editedGradeId && editedGrade.quality && (
        <EditGradeModal
          quality={editedGrade.quality}
          initPoints={editedGrade.points}
          initComment={editedGrade.comment ?? ''}
          initDescription={editedGrade.description ?? ''}
          onClickSave={handleEditGrade(editedGradeId)}
          open={!!editedGrade.quality}
          handleClose={() => {
            setEditedGrade({ quality: '', points: 0 })
            setEditedGradeId('')
          }}
          handleOpen={() => 0}
        />
      )}
      {sheet?.reviewers.map((g) => (
        <Paper className={styles.container} key={g.id}>
          <div className={styles.manageContainer}>
            <h2 className={styles.manageHeader}>{g.name} reviewer grades</h2>
            <div className={styles.buttons}>
              <AddButton
                aria-label="Add grade"
                text="Add"
                onClick={() =>
                  addMentorGrade(g.id, {
                    quality: 'NewGrade',
                    points: 0,
                    description: '',
                    comment: '',
                  })
                }
              />
              <DeleteButton
                confirmTitle="Are you sure you want to delete this grade?"
                onConfirm={deleteSelectedGrades(g.id)}
              />
            </div>
          </div>
          <div className={styles.table}>
            <ReusableTable
              aria-label="Grades table"
              name={g.name + ' grades'}
              columns={gradeColumns}
              data={gradesObjectToArray(g.grades ?? {})}
              isLoading={isLoading}
              error={error}
              onSelectionModelChange={handleGradeSelection}
              onRowClick={(params) => {
                setEditedGradeId(g.id)
                setEditedGrade({
                  quality: params.row.quality,
                  points: params.row.points,
                  comment: params.row.comment,
                  description: params.row.description,
                })
              }}
              checkboxSelection
            />
          </div>
        </Paper>
      ))}
    </>
  )
}
