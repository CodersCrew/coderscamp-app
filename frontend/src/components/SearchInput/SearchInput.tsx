import React, { createRef, useRef, useState } from 'react'
import styles from './SearchInput.module.css'
import {
  InputAdornment,
  IconButton,
  FormControl,
  OutlinedInput,
} from '@material-ui/core'
import { ArrowForwardOutlined, SearchRounded } from '@material-ui/icons'
import { useDidUpdateEffect } from '../../hooks'

export interface SearchInputProps {
  onSubmit: (value: string) => void
  placeholder: string
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, onSubmit }) => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>()
  const handleSubmit: React.MouseEventHandler = () => {
    if (inputRef.current) setValue(inputRef.current.value)
  }
  const search = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  //FIXME: Tutaj wywoływana jest funkcja do wyszukiwania
  useDidUpdateEffect(() => {
    console.log(value)
    onSubmit(value)
  }, [value])

  return (
    <FormControl variant="outlined" className={styles.searchInput}>
      <OutlinedInput
        value={value}
        placeholder={placeholder}
        onChange={search}
        startAdornment={
          <InputAdornment position="start">
            <SearchRounded />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="arrow button"
              onClick={handleSubmit}
              edge="end"
            >
              <ArrowForwardOutlined />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  )
}

export default React.memo(SearchInput)
