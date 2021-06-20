import { CourseDto } from './Course.model'

export interface ManageSectionData {
  _id: string
  name: string
  startDate?: string
  endDate?: string
  description?: string
  course: string
}

export interface NewSectionData extends Omit<ManageSectionData, '_id'> {}

export interface ManageSection {
  id: string
  name: string
  startDate?: number
  endDate?: number
  description?: string
  courseName: string
  courseId: string
}

export interface SectionData {
  _id: string
  name: string
  startDate: string
  endDate: string
  referenceProjectId: string
  description: string
}

export interface Section {
  id: string
  name: string
}

export interface SectionDTO {
  _id: string
  course: CourseDto
  description: string
  materials: []
  name: string
  startDate: string
  endDate: string
  testDate: string
  tests: []
}
