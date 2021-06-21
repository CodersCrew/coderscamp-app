import * as mongoose from 'mongoose'
import { Course } from '../Models/Course'
import { Repository } from './Repository'

export default class CourseRepository extends Repository<
  Course & mongoose.Document
> {}
