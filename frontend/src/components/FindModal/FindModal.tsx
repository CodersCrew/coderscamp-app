import React, { useEffect, useState } from 'react'
import { Backdrop, Fade, Modal } from '@material-ui/core'

import ReusableTable from '../ReusableTable'
import SearchInput from '../SearchInput'

import styles from './FindModal.module.css'
import { UseQueryResult } from 'react-query'
import { genericSearch } from '../../hooks/useQuery/useGenericQuery'
import { GridSelectionModelChangeParams } from '@material-ui/data-grid'
import AddButton from '../AddButton'

interface FindModalProps<T> {
  onRowSelection?: any
  query: UseQueryResult<T[]>
  columns: { field: string; width: number; fieldName?: string }[]
  searchBy: keyof T
  name: string
  queryKey: string
  open: boolean
  isCheckboxSelection?: boolean
  isSaveButton?: boolean
  handleClose: () => void
  handleOpen: () => void
  handleUserSelection?: (params: GridSelectionModelChangeParams) => void
  onSaveButton?: () => void
  searchPlaceholder?: string
}

const FindModal = <T extends unknown>({
  columns,
  searchPlaceholder,
  searchBy,
  queryKey,
  query,
  open,
  onRowSelection,
  name,
  handleOpen,
  handleClose,
  isCheckboxSelection,
  handleUserSelection,
  isSaveButton,
  onSaveButton,
}: FindModalProps<T>) => {
  const [search, setSearch] = useState('')
  const { data, error, isLoading } = query

  useEffect(() => {
    handleOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    genericSearch<T>(queryKey)(`${searchBy}` as keyof T, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function onSearch(name: string) {
    setSearch(name)
  }

  function handleRowClick(params: any, e: any) {
    onRowSelection(params.row)
    handleClose()
  }

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition={true}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={styles.container}>
            <div className={styles.container__header}>
              <span>{name}</span>
            </div>

            <div className={styles.container__body}>
              <div className={styles.container__body__search}>
                <SearchInput
                  onSubmit={onSearch}
                  placeholder={searchPlaceholder ?? ''}
                />
                {isSaveButton && (
                  <AddButton
                    aria-label="Save adding user"
                    text="Save"
                    onClick={onSaveButton}
                  />
                )}
              </div>
              <div className={styles.container__body__table}>
                <ReusableTable
                  name={name}
                  data={data}
                  isLoading={isLoading}
                  error={error}
                  columns={columns}
                  {...(isCheckboxSelection
                    ? {
                        checkboxSelection: true,
                        onSelectionModelChange: handleUserSelection,
                      }
                    : { onRowClick: handleRowClick })}
                />
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </>
  )
}

export default FindModal
