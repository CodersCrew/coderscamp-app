import { genericSearch, genericSort } from './useGenericQuery'
import * as api from '../../api/Sheet.api'
import { GradeSheetDto } from '../../models'
import { useQuery } from 'react-query'

const queryKey = 'sheets'

const useSheets = (userMeData: any) =>
  useQuery(queryKey, () => api.getSheets(userMeData.type), {
    enabled: !!userMeData,
  })
export default useSheets

export const searchSheet = genericSearch<GradeSheetDto>(queryKey)
export const sortSheets = genericSort<GradeSheetDto>(queryKey)
