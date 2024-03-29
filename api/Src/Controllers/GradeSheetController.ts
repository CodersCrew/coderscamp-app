import { Grade } from '../Models/GradeSheet'
import GradeSheetService from '../Services/GradeSheetService'
import { Request, Response } from 'express'
import * as mongoose from 'mongoose'
import { ParticipantDto, UpdateParticipantsDto } from '../Models/DTO/GradeSheetDto'

export default class GradeSheetController {
  gradeSheetService: GradeSheetService
  constructor(gradeSheetService: GradeSheetService) {
    this.gradeSheetService = gradeSheetService
  }

  getGradeSheet = async (req: Request, res: Response) => {
    const id = req.params.id
    const sheet = await this.gradeSheetService.findGradeSheetById(id)
    if (!sheet)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json(sheet)
  }

  getGradeSheets = async (req: Request, res: Response) => {
    const sheets = await this.gradeSheetService.getGradeSheets()
    res.status(200).json(sheets)
  }

  getParticipantGradeSheets = async (req: Request, res: Response) => {
    const userId = req.params.id
    const sheets = await this.gradeSheetService.getParticipantGradeSheets(
      userId,
    )
    res.status(200).json(sheets)
  }

  getParticipantGradeSheet = async (req: Request, res: Response) => {
    const id = req.params.id
    const userId = req.params.userId
    const sheet = await this.gradeSheetService.getParticipantGradeSheet(id, userId)
    if (!sheet)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json(sheet)
  }

  getMentorGradeSheets = async (req: Request, res: Response) => {
    const userId = req.params.id
    const sheets = await this.gradeSheetService.getMentorGradeSheets(userId)
    res.status(200).json(sheets)
  }

  getMentorGradeSheet = async (req: Request, res: Response) => {
    const id = req.params.id
    const userId = req.params.userId
    const sheet = await this.gradeSheetService.getMentorGradeSheet(id, userId)
    if (!sheet)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json(sheet)
  }

  getReviewerGradeSheets = async (req: Request, res: Response) => {
    const userId = req.params.id
    const sheets = await this.gradeSheetService.getReviewerGradeSheets(userId)
    res.status(200).json(sheets)
  }

  getReviewerGradeSheet = async (req: Request, res: Response) => {
    const id = req.params.id
    const userId = req.params.userId
    const sheet = await this.gradeSheetService.getReviewerGradeSheet(id, userId)
    if (!sheet)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json(sheet)
  }

  getReviewerGrades = async (req: Request, res: Response) => {
    const id = req.params.id
    const mentorId = req.params.mentorId
    const sheet = await this.gradeSheetService.getReviewerGrades(id, mentorId)
    if (!sheet)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json(sheet.grades)
  }

  addMentorReviewer = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorId = new mongoose.Types.ObjectId(req.params.mentorId)
    const sheet = await this.gradeSheetService.addMentorReviewer(id, mentorId)
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Mentor reviewer added' })
  }

  setMentorReviewers = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorIds = req.body.reviewers.map(
      (id: string) => new mongoose.Types.ObjectId(id),
    )
    const sheet = await this.gradeSheetService.setMentorReviewers(id, mentorIds)
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Mentor reviewers set' })
  }

  setMentor = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorId = new mongoose.Types.ObjectId(req.params.mentorId)
    const sheet = await this.gradeSheetService.setMentor(id, mentorId)
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Mentor changed' })
  }

  setProject = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const projectId = new mongoose.Types.ObjectId(req.params.projectId)
    const sheet = await this.gradeSheetService.setProject(id, projectId)
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Project changed' })
  }

  setMentorGrades = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorId = req.body.mentorId
      ? new mongoose.Types.ObjectId(req.params.mentorId)
      : null
    const grades: { [gradeName: string]: Grade } = req.body.grades
    const sheet = await this.gradeSheetService.setMentorGrades(
      id,
      grades,
      mentorId,
    )
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    if (sheet === 'FORBIDDEN')
      return res.status(403).json({ message: 'FORBIDDEN' })
    res.status(200).json({ message: 'Mentor grade set' })
  }

  patchMentorGrades = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorId = req.body.mentorId
      ? new mongoose.Types.ObjectId(req.params.mentorId)
      : null
    const grades: { [gradeName: string]: Grade } = req.body.grades
    const gradesToDelete: string[] = req.body.gradesToDelete ?? []
    const sheet = await this.gradeSheetService.patchMentorGrades(
      id,
      grades,
      gradesToDelete,
      mentorId,
    )
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    if (sheet === 'FORBIDDEN')
      return res.status(403).json({ message: 'FORBIDDEN' })
    res.status(200).json({ message: 'Mentor grade patched' })
  }

  setMentorReviewerGrades = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorId = new mongoose.Types.ObjectId(req.params.mentorId)
    const grades: { [gradeName: string]: Grade } = req.body.grades
    const sheet = await this.gradeSheetService.setMentorReviewerGrades(
      id,
      mentorId,
      grades,
    )
    if (sheet === null)
      return res
        .status(404)
        .json({ message: 'Grade sheet or mentor not found' })
    res.status(200).json({ message: 'Mentor reviewer grade set' })
  }

  patchMentorReviewerGrades = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const mentorId = new mongoose.Types.ObjectId(req.params.mentorId)
    const grades: { [gradeName: string]: Grade } = req.body.grades
    const gradesToDelete: string[] = req.body.gradesToDelete ?? []
    const sheet = await this.gradeSheetService.patchMentorReviewerGrades(
      id,
      mentorId,
      grades,
      gradesToDelete,
    )
    if (sheet === null)
      return res
        .status(404)
        .json({ message: 'Grade sheet or mentor not found' })
    res.status(200).json({ message: 'Mentor reviewer grade patched' })
  }

  addParticipant = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const participantId = new mongoose.Types.ObjectId(req.params.participantId)
    const sheet = await this.gradeSheetService.addParticipant(id, participantId)
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Participant added' })
  }

  updateParticipants = async (req: Request, res: Response) => {
    const id = req.params.id
    const participants: UpdateParticipantsDto = req.body.participants
    const sheet = await this.gradeSheetService.updateParticipants(
      id,
      participants,
    )
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Participants updated' })
  }

  updateParticipantsForMentor = async (req: Request, res: Response) => {
    const id = req.params.id
    const mentorId = req.params.mentorId
    const participants: UpdateParticipantsDto = req.body.participants
    const sheet = await this.gradeSheetService.updateParticipants(
      id,
      participants,
      mentorId,
    )
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Participants updated' })
  }

  setParticipants = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const participants: UpdateParticipantsDto = req.body.participants
    const sheet = await this.gradeSheetService.setParticipants(id, participants)
    if (sheet === null)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Participants set' })
  }

  removeParticipant = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const participantId = new mongoose.Types.ObjectId(req.params.participantId)
    const sheet = await this.gradeSheetService.removeParticipant(
      id,
      participantId,
    )
    if (!sheet)
      return res
        .status(404)
        .json({ message: 'Grade sheet or participant not found' })
    res.status(200).json({ message: 'Grade sheet participant deleted' })
  }

  deleteGradeSheet = async (req: Request, res: Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const sheet = await this.gradeSheetService.deleteGradeSheet(id)
    if (!sheet)
      return res.status(404).json({ message: 'Grade sheet not found' })
    res.status(200).json({ message: 'Grade sheet deleted' })
  }

  createGradeSheet = async (req: Request, res: Response) => {
    try {
      await this.gradeSheetService.createGradeSheet(req.body)
      res.status(201).json({ message: 'Grade sheet created' })
    } catch (err) {
      if (err.name === 'ValidationError')
        return res.status(400).json({ message: err.message })
      res.status(500).json({ message: err.message })
    }
  }
}
