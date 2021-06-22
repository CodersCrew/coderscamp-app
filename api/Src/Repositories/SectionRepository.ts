import { Repository } from './Repository'
import * as mongoose from 'mongoose'
import { Section } from '../Models/Section'

export default class SectionRepository extends Repository<
  Section & mongoose.Document
> {
  async getAll() {
    return this.model.find({})
  }

  async getById(id: mongoose.Types.ObjectId) {
    return this.model.findOne(id).populate('course')
  }

  async updateByQuery(query: object, obj: object) {
    return await this.model.updateOne(query, obj, {
      useFindAndModify: false,
      upsert: false,
    })
  }

  async getSectionsByCourseId(courseId: mongoose.Types.ObjectId) {
    return this.model.find({ course: courseId }).populate('course')
  }
}
