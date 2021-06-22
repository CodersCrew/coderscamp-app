import * as mongoose from 'mongoose'
import { Section } from '../Models/Section'
import SectionRepository from '../Repositories/SectionRepository'

export default class SectionService {
  private sectionRepository: SectionRepository

  constructor(sectionRepository: SectionRepository) {
    this.sectionRepository = sectionRepository
  }

  getSections = async (): Promise<mongoose.Document[]> => {
    return this.sectionRepository.getAll()
  }

  getSectionsByCourseId = async (
    courseId: mongoose.Types.ObjectId,
  ): Promise<mongoose.Document[]> => {
    return this.sectionRepository.getSectionsByCourseId(courseId)
  }

  getSectionById = async (sectionId: mongoose.Types.ObjectId) => {
    return this.sectionRepository.getById(sectionId)
  }

  createSection = async (section: Section & mongoose.Document) => {
    return this.sectionRepository.create(section)
  }

  updateSection = async (
    id: mongoose.Types.ObjectId,
    section: mongoose.Document,
  ) => {
    return this.sectionRepository.updateById(id, section)
  }

  deleteSection = async (sectionId: mongoose.Types.ObjectId) => {
    return this.sectionRepository.deleteById(sectionId)
  }

  getSectionWithCourse = async (id: mongoose.Types.ObjectId) => {
    return (await this.sectionRepository.getById(id)).populate('courseId')
  }
}
