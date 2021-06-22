import { Paper } from '@material-ui/core'
import React, { useRef, useState } from 'react'
import styles from '../../pages/Admin/ManageSheet/ManageSheet.module.css'
import AddButton from '../AddButton'

import EditGradeModal from '../EditGradeModal'
import DeleteButton from '../DeleteButton'
import { Grades, SheetGrade } from '../../models'
import { usePatchMentorGrade, useSheet } from '../../hooks'
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

export interface GradeSheetMentorGradesProps {}

export const GradeSheetMentorGrades: React.FC<GradeSheetMentorGradesProps> = () => {
  const mentorGradesTableName = 'Mentor Grades'

  const selectedGrades = useRef<string[]>([])

  const [editedGrade, setEditedGrade] = useState<Grade>({
    quality: '',
    points: 0,
  })

  let { sheetId } = useParams<{ sheetId: string }>()
  const { data: sheet, error, isLoading } = useSheet(sheetId)
  const { mutate: patchMentorGrade } = usePatchMentorGrade(sheetId, {})
  const handleGradeSelection = (row: GridSelectionModelChangeParams) => {
    selectedGrades.current = row.selectionModel as string[]
  }

  const handleEditGrade = (grades: Grades) => {
    const gradesToDelete =
      editedGrade.quality !== Object.keys(grades)[0]
        ? [editedGrade.quality]
        : []

    patchMentorGrade({ grades, gradesToDelete })
  }

  const deleteSelectedGrades = () => {
    patchMentorGrade({ grades: {}, gradesToDelete: selectedGrades.current })
    selectedGrades.current = []
  }

  const addMentorGrade = (grade: Grade) => {
    const newGrades = {
      [grade.quality]: _.omit(grade, 'quality'),
    }
    patchMentorGrade({ grades: newGrades })
  }

  const gradeColumns = [
    { field: 'quality', headerName: 'Quality', width: 270 },
    { field: 'points', headerName: 'Points', width: 250 },
    { field: 'comment', headerName: 'Comment', width: 250 },
  ]

  return (
    <Paper className={styles.container}>
      <div className={styles.manageContainer}>
        {editedGrade.quality && (
          <EditGradeModal
            quality={editedGrade.quality}
            initPoints={editedGrade.points}
            initComment={editedGrade.comment ?? ''}
            initDescription={editedGrade.description ?? ''}
            onClickSave={handleEditGrade}
            open={!!editedGrade.quality}
            handleClose={() => setEditedGrade({ quality: '', points: 0 })}
            handleOpen={() => 0}
          />
        )}
        <h2 className={styles.manageHeader}>Mentor grades</h2>
        <div className={styles.buttons}>
          <AddButton
            aria-label="Add grade"
            text="Add"
            onClick={() =>
              addMentorGrade({
                quality: 'NewGrade',
                points: 0,
                description: '',
                comment: '',
              })
            }
          />
          <DeleteButton
            confirmTitle="Are you sure you want to delete this grade?"
            onConfirm={deleteSelectedGrades}
          />
        </div>
      </div>
      <div className={styles.table}>
        <ReusableTable
          aria-label="Grades table"
          name={mentorGradesTableName}
          columns={gradeColumns}
          data={gradesObjectToArray(sheet?.mentorGrades ?? {})}
          isLoading={isLoading}
          error={error}
          onSelectionModelChange={handleGradeSelection}
          onRowClick={(params) =>
            setEditedGrade({
              quality: params.row.quality,
              points: params.row.points,
              comment: params.row.comment,
              description: params.row.description,
            })
          }
          checkboxSelection
        />
      </div>
    </Paper>
  )
}
