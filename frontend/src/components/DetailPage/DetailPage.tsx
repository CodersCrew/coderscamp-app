import React from 'react'
import PageHeader from '../../components/PageHeader'
import ReusableGoBack from '../../components/ReusableGoBack'
import { PageContainer } from '../PageContainer'

export interface DetailPageProps {
  pageName: string
  elementName: string
}

const DetailPage: React.FC<DetailPageProps> = ({ children, ...restProps }) => {
  return (
    <PageContainer>
      <PageHeader>
        <ReusableGoBack {...restProps} />
      </PageHeader>
      {children}
    </PageContainer>
  )
}

export default DetailPage
