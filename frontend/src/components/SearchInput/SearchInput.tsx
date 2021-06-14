import React, { useState } from 'react'
import styles from './SearchInput.module.css'
import { InputAdornment, FormControl, OutlinedInput } from '@material-ui/core'
import { SearchRounded } from '@material-ui/icons'
import { useDidUpdateEffect } from '../../hooks'

export interface SearchInputProps {
  onSubmit: (value: string) => void
  placeholder: string
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const searchOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  useDidUpdateEffect(() => {
    onSubmit(searchTerm)
  }, [searchTerm])

  return (
    <FormControl variant="outlined" className={styles.searchInput}>
      <OutlinedInput
        value={searchTerm}
        placeholder={placeholder}
        onChange={searchOnChange}
        startAdornment={
          <InputAdornment position="start">
            <SearchRounded />
          </InputAdornment>
        }
      />
    </FormControl>
  )
}

export default React.memo(SearchInput)
