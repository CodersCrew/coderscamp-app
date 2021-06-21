import * as mongoose from 'mongoose'
import { IMaterial } from '../Models/Material'

import { Repository } from './Repository'

export default class MaterialRepository extends Repository<
  IMaterial & mongoose.Document
> {}
