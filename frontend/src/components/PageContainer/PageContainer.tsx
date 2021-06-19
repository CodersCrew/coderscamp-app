import React, { FC } from 'react'
import { Container } from '@material-ui/core'

import styles from './PageContainer.module.css'

interface Props {
  label?: string
}

const PageContainer: FC<Props> = ({ label, children }) => {
  return (
    <Container className={styles.pageContainer} aria-label={label}>
      <>{children}</>
    </Container>
  )
}

export { PageContainer }
