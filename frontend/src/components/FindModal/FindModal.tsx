import React, { useEffect, useState } from 'react'
import { Backdrop, CssBaseline, Fade, Modal } from '@material-ui/core'

import ReusableTable from '../ReusableTable'
import SearchInput from '../SearchInput'

import styles from './FindModal.module.css'
import { UseQueryResult } from 'react-query'
import { genericSearch } from '../../hooks/useQuery/useGenericQuery'


interface FindModalProps<T> {
  onRowSelection: any
  query: UseQueryResult<T[]>
  columns: { field: string; width: number; fieldName?: string }[]
  searchBy: keyof T
  name: string
  queryKey: string
  open: boolean
  handleClose: () => void
  handleOpen: () => void
  searchPlaceholder?: string
}

const FindModal = <T extends unknown>({
  onRowSelection,
  query,
  columns,
  searchBy,
  name,
  queryKey,
  open,
  handleClose,
  handleOpen,
  searchPlaceholder,
}: FindModalProps<T>) => {
  const {data, error, isLoading}= query;
  const [search, setSearch] = useState('')

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

  function handleRowClick(params: any) {
    onRowSelection(params.row)
    handleClose()
  }

  return (
    <>
      <CssBaseline />
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
              </div>
              <div className={styles.container__body__table}>
                <ReusableTable
                  name={name}
                  data={data}
                  isLoading={isLoading}
                  error={error}
                  columns={columns}
                  onRowClick={handleRowClick}
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