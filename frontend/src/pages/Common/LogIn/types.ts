import { UserType } from '../../../models'

export interface FormValues {
  email: string
  password: string
}

export interface loginResponseData {
  _id: string
  type: UserType
}
