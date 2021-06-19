import GradeSheetRepository from '../Repositories/GradeSheetRepository'
import GradeSheetModel, { GradeSheet, Grade } from '../Models/GradeSheet'
import * as mongoose from 'mongoose'
import * as _ from 'lodash'
import {
  CreateGradeSheetDto,
  GradeSheetDto,
  GradeSheetsDto,
  ParticipantDto,
  ReviewerDto,
  UpdateParticipantsDto,
} from '../Models/DTO/GradeSheetDto'

function transformToGradeSheetsDto(sheets: any[]): GradeSheetsDto | null {
  return sheets.map((sheet: any) => ({
    id: sheet._id,
    mentorId: sheet.mentor[0] && sheet.mentor[0]._id,
    mentorName: sheet.mentor[0] && sheet.mentor[0].name,
    mentorSurname: sheet.mentor[0] && sheet.mentor[0].surname,
    projectId: sheet.project[0] && sheet.project[0]._id,
    projectName: sheet.project[0] && sheet.project[0].name,
  }))
}

function transformToGradeSheetDto(sheetTuple: any[]): GradeSheetDto | null {
  if (sheetTuple.length !== 1) return null
  const sheet = sheetTuple[0]
  const participants: ParticipantDto[] = sheet.participantData.map(
    (user, idx) => ({
      id: user._id,
      name: user.name,
      surname: user.surname,
      engagement: sheet.participants[idx].engagement,
      role: sheet.participants[idx].role,
      rolePoints: sheet.participants[idx].rolePoints,
    }),
  )
  const reviewers: ReviewerDto[] = sheet.reviewers.map((reviewer) => ({
    id: reviewer._id,
    name: `${reviewer.name} ${reviewer.surname}`,
    email: reviewer.email,
  }))
  return {
    id: sheet._id,
    mentorId: sheet.mentor[0] && sheet.mentor[0]._id,
    mentorName:
      sheet.mentor[0] && `${sheet.mentor[0].name} ${sheet.mentor[0].surname}`,
    projectId: sheet.project[0] && sheet.project[0]._id,
    projectName: sheet.project[0] && sheet.project[0].name,
    projectUrl: sheet.project[0] && sheet.project[0].projectUrl,
    projectDescription: sheet.project[0] && sheet.project[0].description,
    mentorGrades: sheet.mentorGrades,
    reviewers,
    mentorReviewerGrades: sheet.mentorReviewerGrades,
    participants,
  }
}

export default class GradeSheetService {
  repository: GradeSheetRepository
  constructor(repository: GradeSheetRepository) {
    this.repository = repository
  }

  async findGradeSheetById(id: string): Promise<GradeSheetDto | null> {
    const sheet = await this.repository.find({ id })
    return transformToGradeSheetDto(sheet)
  }

  async getGradeSheets(): Promise<GradeSheetsDto | null> {
    const sheets = await this.repository.find({})
    return transformToGradeSheetsDto(sheets)
  }

  async getParticipantGradeSheets(participantId: string) {
    const sheets = await this.repository.find({
      participantId,
    })
    return transformToGradeSheetsDto(sheets)
  }

  async getParticipantGradeSheet(id: string, participantId: string) {
    const sheet = await this.repository.find({ id, participantId })
    return transformToGradeSheetDto(sheet)
  }

  async getMentorGradeSheets(mentorId: string) {
    const sheets = await this.repository.find({ mentorId })
    return transformToGradeSheetsDto(sheets)
  }

  async getMentorGradeSheet(id: string, mentorId: string) {
    const sheet = await this.repository.find({ id, mentorId })
    return transformToGradeSheetDto(sheet)
  }

  async getReviewerGradeSheets(mentorReviewerId: string) {
    const sheets = await this.repository.find({
      mentorReviewerId,
    })
    return transformToGradeSheetsDto(sheets)
  }

  async getReviewerGradeSheet(id: string, mentorReviewerId: string) {
    const sheet = await this.repository.find({
      id,
      mentorReviewerId,
    })
    return transformToGradeSheetDto(sheet)
  }

  async getReviewerGrades(gradeSheetId: string, mentorId: string) {
    const sheet = await this.findGradeSheetById(gradeSheetId)
    return sheet.mentorReviewerGrades.find(
      (elem) => `${elem.mentorID}` === `${mentorId}`,
    )
  }

  async createGradeSheet(gradeSheet: CreateGradeSheetDto) {
    const reviewers =
      gradeSheet.reviewers?.map((id) => new mongoose.Types.ObjectId(id)) ?? []
    const mentorReviewerGrades =
      gradeSheet.mentorReviewerGrades
        ?.filter((grades) => gradeSheet.reviewers.includes(grades.mentorID))
        ?.map((grade) => ({
          ...grade,
          mentorID: new mongoose.Types.ObjectId(grade.mentorID),
        })) ?? []
    for (let i in gradeSheet.reviewers) {
      const mentorID = gradeSheet.reviewers[i]
      const index = gradeSheet.mentorReviewerGrades.findIndex(
        (grades) => grades.mentorID === mentorID,
      )
      if (index === -1)
        gradeSheet.mentorReviewerGrades.push({
          mentorID,
          grades: {},
        })
    }
    const sheet = new GradeSheetModel({
      projectID: new mongoose.Types.ObjectId(gradeSheet.projectId),
      mentorID: new mongoose.Types.ObjectId(gradeSheet.mentorId),
      participants:
        gradeSheet.participants?.map((u) => ({
          ...u,
          participantID: new mongoose.Types.ObjectId(u.id),
        })) ?? [],
      mentorGrades: gradeSheet.mentorGrades ?? {},
      mentorReviewerGrades,
      reviewers,
    } as GradeSheet)
    await sheet.validate()
    return this.repository.create(sheet)
  }

  async addMentorReviewer(
    gradeSheetId: mongoose.Types.ObjectId,
    mentorId: mongoose.Types.ObjectId,
  ) {
    return await this.repository.addMentorReviewer(gradeSheetId, mentorId)
  }

  async setMentorReviewers(
    gradeSheetId: mongoose.Types.ObjectId,
    mentorIds: mongoose.Types.ObjectId[],
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    sheet.reviewers = sheet.reviewers.filter((rev) =>
      mentorIds.some((id) => `${rev}` === `${id}`),
    )
    sheet.mentorReviewerGrades = sheet.mentorReviewerGrades.filter((grade) =>
      mentorIds.some((id) => `${grade.mentorID}` === `${id}`),
    )
    for (let i in mentorIds) {
      if (sheet.reviewers.some((rev) => `${mentorIds[i]}` === `${rev}`))
        continue
      sheet.reviewers.push(mentorIds[i])
      sheet.mentorReviewerGrades.push({ mentorID: mentorIds[i], grades: {} })
    }
    return await this.repository.save(sheet)
  }

  async setMentor(
    gradeSheetId: mongoose.Types.ObjectId,
    mentorId: mongoose.Types.ObjectId,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    sheet.mentorID = mentorId
    sheet.markModified('mentorID')
    return await this.repository.save(sheet)
  }

  async setProject(
    gradeSheetId: mongoose.Types.ObjectId,
    projectId: mongoose.Types.ObjectId,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    sheet.projectID = projectId
    sheet.markModified('projectID')
    return await this.repository.save(sheet)
  }

  async patchMentorGrades(
    gradeSheetId: mongoose.Types.ObjectId,
    grades: { [gradeName: string]: Grade },
    gradesToDelete: string[] = [],
    mentorId: mongoose.Types.ObjectId | null = null,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null) return null
    if (mentorId && !sheet.mentorID.equals(mentorId)) return 'FORBIDDEN'
    gradesToDelete.forEach((g) => delete sheet.mentorGrades[g])
    Object.assign(sheet.mentorGrades, grades)
    sheet.markModified('mentorGrades')
    return await this.repository.save(sheet)
  }

  async setMentorGrades(
    gradeSheetId: mongoose.Types.ObjectId,
    grades: { [gradeName: string]: Grade },
    mentorId: mongoose.Types.ObjectId | null = null,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null) return null
    if (mentorId && !sheet.mentorID.equals(mentorId)) return 'FORBIDDEN'
    sheet.mentorGrades = {}
    Object.assign(sheet.mentorGrades, grades)
    sheet.markModified('mentorGrades')
    return await this.repository.save(sheet)
  }

  async patchMentorReviewerGrades(
    gradeSheetId: mongoose.Types.ObjectId,
    mentorId: mongoose.Types.ObjectId,
    grades: { [gradeName: string]: Grade },
    gradesToDelete: string[] = [],
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null || !sheet.reviewers.includes(mentorId)) return null
    const index = sheet.mentorReviewerGrades.findIndex(
      (grade) => `${grade.mentorID}` === `${mentorId}`,
    )
    gradesToDelete.forEach(
      (g) => delete sheet.mentorReviewerGrades[index].grades[g],
    )
    Object.assign(sheet.mentorReviewerGrades[index].grades, grades)
    sheet.markModified('mentorReviewerGrades')
    return await this.repository.save(sheet)
  }

  async setMentorReviewerGrades(
    gradeSheetId: mongoose.Types.ObjectId,
    mentorId: mongoose.Types.ObjectId,
    grades: { [gradeName: string]: Grade },
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null || !sheet.reviewers.includes(mentorId)) return null
    const index = sheet.mentorReviewerGrades.findIndex(
      (grade) => `${grade.mentorID}` === `${mentorId}`,
    )
    sheet.mentorReviewerGrades[index].grades = {}
    Object.assign(sheet.mentorReviewerGrades[index].grades, grades)
    sheet.markModified('mentorReviewerGrades')
    return await this.repository.save(sheet)
  }

  async addParticipant(
    gradeSheetId: mongoose.Types.ObjectId,
    participantId: mongoose.Types.ObjectId,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null) return null
    if (
      sheet.participants.some(
        (part) => `${part.participantID}` === `${participantId}`,
      )
    )
      return sheet
    sheet.participants.push({
      participantID: participantId,
    })
    sheet.markModified('participants')
    return await this.repository.save(sheet)
  }

  async setParticipants(
    gradeSheetId: mongoose.Types.ObjectId,
    participants: UpdateParticipantsDto,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null) return null
    sheet.participants = participants.map((participant) => ({
      ...participant,
      participantID: new mongoose.mongo.ObjectID(participant.id),
    }))
    sheet.markModified('participants')
    return await this.repository.save(sheet)
  }

  async _updateParticipantsForSheet(
    sheet: (GradeSheet & mongoose.Document) | null,
    participants: UpdateParticipantsDto,
  ) {
    if (sheet === null) return null
    for (let i in participants) {
      const index = sheet.participants.findIndex(
        (part) => `${part.participantID}` === `${participants[i].id}`,
      )
      if (index === -1) continue
      Object.assign(
        sheet.participants[index],
        _.omit(participants[i], ['participantID', '_id']),
      )
    }
    sheet.markModified('participants')
    return await this.repository.save(sheet)
  }

  async updateParticipants(
    gradeSheetId: string,
    participants: UpdateParticipantsDto,
    mentorId?: string,
  ) {
    const sheet = await this.repository.getById(
      new mongoose.mongo.ObjectId(gradeSheetId),
    )
    if (sheet === null || (mentorId && mentorId !== `${sheet.mentorID}`))
      return null
    return this._updateParticipantsForSheet(sheet, participants)
  }

  async removeParticipant(
    gradeSheetId: mongoose.Types.ObjectId,
    participantId: mongoose.Types.ObjectId,
  ) {
    const sheet = (await this.repository.getById(gradeSheetId)) as
      | (GradeSheet & mongoose.Document)
      | null
    if (sheet === null) return null
    const index = sheet.participants.findIndex(
      (part) => `${part.participantID}` === `${participantId}`,
    )
    if (index === -1) return null
    sheet.participants.splice(index, 1)
    sheet.markModified('participants')
    return await this.repository.save(sheet)
  }

  async deleteGradeSheet(id: mongoose.Types.ObjectId) {
    return this.repository.deleteById(id)
  }
}
