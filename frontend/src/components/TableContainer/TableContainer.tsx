import React, { FC } from 'react'

import styles from './TableContainer.module.css'

const TableContainer: FC = ({ children }) => {
  return <div className={styles.table}>{children}</div>
}

export { TableContainer }
