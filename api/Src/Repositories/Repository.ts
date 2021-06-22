import * as mongoose from 'mongoose'

export class Repository<T extends mongoose.Document>
  implements Write<T>, Read<T> {
  model: mongoose.Model<T>

  constructor(schemaModel: mongoose.Model<T>) {
    this.model = schemaModel
    return this
  }

  async getAll(): Promise<T[]> {
    return this.model.find({})
  }

  async getAllByCourse({ courseId }: mongoose.FilterQuery<T>): Promise<T[]> {
    return this.model.find({ courseId })
  }

  async getById(id: mongoose.Types.ObjectId): Promise<T> {
    return this.model.findById(id)
  }

  async create(obj: Partial<T>): Promise<T> {
    return this.model.create(obj)
  }

  async updateById(
    id: mongoose.Types.ObjectId,
    obj: mongoose.UpdateQuery<T>,
  ): Promise<T> {
    //todo add some protection to disable duplicates
    return await this.model.findByIdAndUpdate(id, obj, {
      useFindAndModify: false,
      upsert: false,
    })
  }

  async deleteById(id: mongoose.Types.ObjectId): Promise<T> {
    return this.model.findByIdAndDelete({ _id: id })
  }

  async save(doc: T): Promise<T> {
    return doc.save()
  }
}

export interface Write<T extends mongoose.Document> {
  create: (item: Partial<T>) => Promise<T>
  save: (item: T) => Promise<T>
  deleteById: (id: mongoose.Types.ObjectId) => Promise<T>
  updateById: (
    id: mongoose.Types.ObjectId,
    obj: mongoose.UpdateQuery<T>,
  ) => Promise<T>
}

export interface Read<T extends mongoose.Document> {
  getById: (id: mongoose.Types.ObjectId) => Promise<T>
  getAllByCourse: ({ courseId }: mongoose.FilterQuery<T>) => Promise<T[]>
  getAll: () => Promise<T[]>
}
