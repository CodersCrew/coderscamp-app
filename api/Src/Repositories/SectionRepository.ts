import { Repository } from './Repository'
import * as mongoose from 'mongoose'

export default class SectionRepository extends Repository {
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
