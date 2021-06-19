import GradeSheetService from '../Src/Services/GradeSheetService'
import GradeSheetRepository, {
  GradeSheetFilters,
} from '../Src/Repositories/GradeSheetRepository'
import { GradeSheetDto, GradeSheetsDto } from '../Src/Models/DTO/GradeSheetDto'
import GradeSheetDbModel, {
  Grade,
  GradeSheet,
  Participant,
} from '../Src/Models/GradeSheet'
import { Document, Types } from 'mongoose'
import * as _ from 'lodash'

interface User {
  _id: string
  name: string
  surname: string
  email?: string
}

type TestGradeSheet = {
  _id: string
  project: {
    _id: string
    projectName: string
    projectUrl: string
    description: string
  }[]
  mentor: User[]
  mentorGrades: {
    [prop: string]: Grade
  }
  reviewers: User[]
  mentorReviewerGrades: Array<{
    mentorID: Types.ObjectId
    grades: {
      [prop: string]: Grade
    }
  }>
  participantData: User[]
  participants: Participant[]
  section: {
    _id: string
    name: string
  }
  courseId: string
}

function createFilters(filters: GradeSheetFilters) {
  const {
    id,
    sectionId,
    projectId,
    teamProjectId,
    courseId,
    mentorId,
    participantId,
    mentorReviewerId,
  } = filters

  return (sheet: GradeSheet & Document) => {
    const sheetFilters = [
      !id || `${sheet._id}` === id,
      !teamProjectId || `${sheet.projectID}` === teamProjectId,
      !mentorId || `${sheet.mentorID}` === mentorId,
      !participantId ||
        sheet.participants.some((p) => `${p.participantID}` === participantId),
      !mentorReviewerId ||
        sheet.reviewers.some((revId) => `${revId}` === mentorReviewerId),
    ]
    return sheetFilters.every((f) => f)
  }
}

function projectGradeSheet(sheet: GradeSheet & Document): TestGradeSheet {
  return {
    _id: sheet._id,
    courseId: '1',
    mentor: [
      {
        _id: sheet.mentorID + '',
        surname: 'MentorSurname',
        name: 'MentorName',
        email: 'mentor@email.pl',
      },
    ],
    project: [
      {
        _id: sheet.projectID + '',
        projectName: 'ProjectName',
        description: 'ProjectDescription',
        projectUrl: 'ProjectURL',
      },
    ],
    mentorGrades: sheet.mentorGrades,
    reviewers: sheet.reviewers.map((r) => ({
      _id: r + '',
      name: 'RevName',
      surname: 'RevSurname',
    })),
    mentorReviewerGrades: sheet.mentorReviewerGrades,
    participants: sheet.participants,
    participantData: sheet.participants.map((p) => ({
      _id: p.participantID + '',
      name: 'ParticipantName',
      surname: 'ParticipantSurname',
    })),
    section: {
      _id: 'sectionId',
      name: 'Typescript',
    },
  }
}

class TestRepository extends GradeSheetRepository {
  gradeSheets: Array<GradeSheet & Document>
  constructor() {
    super(GradeSheetDbModel)
    this.gradeSheets = []
  }

  async find(filters: GradeSheetFilters) {
    const filterFunction = createFilters(filters)
    return this.gradeSheets.filter(filterFunction).map(projectGradeSheet)
  }

  async clear() {
    this.gradeSheets = []
  }

  async getAll() {
    return this.gradeSheets
  }

  async getById(id: Types.ObjectId) {
    return this.gradeSheets.find((sheet) => `${sheet._id}` === `${id}`) ?? null
  }

  async getIndexById(id: Types.ObjectId) {
    return this.gradeSheets.findIndex((sheet) => `${sheet._id}` === `${id}`)
  }

  async create(gradeSheet: GradeSheet) {
    const newGradeSheet = new this.model(gradeSheet) as GradeSheet & Document
    this.gradeSheets.push(newGradeSheet)
  }

  async updateById(id: Types.ObjectId, props: object) {
    const index = await this.getIndexById(id)
    Object.assign(this.gradeSheets[index], props)
  }

  async deleteById(id: Types.ObjectId) {
    this.gradeSheets = this.gradeSheets.filter(
      (sheet) => `${sheet._id}` !== `${id}`,
    )
  }

  async addMentorReviewer(
    gradeSheetId: Types.ObjectId,
    mentorId: Types.ObjectId,
  ) {
    const index = await this.getIndexById(gradeSheetId)
    const gradeSheet = this.gradeSheets[index]
    if (
      gradeSheet.reviewers.findIndex(
        (mentor) => `${mentor}` === `${mentorId}`,
      ) > -1
    )
      return gradeSheet
    gradeSheet.reviewers.push(mentorId)
    return gradeSheet
  }

  async getReviewerGrades(
    gradeSheetId: Types.ObjectId,
    mentorId: Types.ObjectId,
  ) {
    const sheet = await this.getById(gradeSheetId)
    return sheet.mentorReviewerGrades.find(
      (grade) => `${grade.mentorID}` === `${mentorId}`,
    )
  }

  async save(doc: Document) {
    return doc
  }
}

const testRepo = new TestRepository()
//@ts-ignore
const service = new GradeSheetService(testRepo)

describe('Test GradeSheetService ', () => {
  const nSheets = 10
  let gradeSheets: Array<GradeSheet & Document>

  beforeEach(async () => {
    await service.createGradeSheet({
      projectId: `${new Types.ObjectId()}`,
      mentorId: `${new Types.ObjectId()}`,
      participants: [],
      reviewers: [],
      mentorGrades: {
        design: { points: 1 },
        extra: { points: 2 },
      },
      mentorReviewerGrades: [],
    })

    for (let i = 0; i < nSheets - 1; i++) {
      const mentorReviewerId = `${new Types.ObjectId()}`
      const reviewerGrades = {
        mentorID: mentorReviewerId,
        grades: {
          code: { points: Math.round(Math.random() * 10) },
          repo: { points: Math.round(Math.random() * 10) },
          extra: { points: Math.round(Math.random() * 10) },
        },
      }
      const mentorReviewerGrades = i / nSheets > 0.5 ? [reviewerGrades] : []
      await service.createGradeSheet({
        projectId: `${new Types.ObjectId()}`,
        mentorId: `${new Types.ObjectId()}`,
        participants: [],
        reviewers: [mentorReviewerId],
        mentorGrades: {
          code: { points: Math.round(Math.random() * 10) },
          repo: { points: Math.round(Math.random() * 10) },
          extra: { points: Math.round(Math.random() * 10) },
        },
        mentorReviewerGrades,
      })
    }

    gradeSheets = testRepo.gradeSheets
  })

  afterEach(async () => {
    await testRepo.clear()
  })

  test(`create ${nSheets} sheets`, () => {
    expect(gradeSheets).toHaveLength(nSheets)
  })

  test('find sheet by id', async () => {
    const sheet = await service.findGradeSheetById(gradeSheets[0]._id + '')
    expect(sheet.mentorId).toEqual(gradeSheets[0].mentorID + '')
  })

  test('get sheets', async () => {
    const sheets = await service.getGradeSheets()
    expect(sheets).toHaveLength(nSheets)
  })

  test('add mentor reviewer', async () => {
    const idx = 0
    const sheetId = gradeSheets[idx]._id
    const mentorId = new Types.ObjectId()
    expect(gradeSheets[idx].reviewers).toHaveLength(0)
    await service.addMentorReviewer(sheetId, mentorId)
    expect(gradeSheets[idx].reviewers).toHaveLength(1)
  })

  test('set mentor', async () => {
    const idx = 1
    const sheetId = gradeSheets[idx]._id
    const mentorId = new Types.ObjectId()
    await service.setMentor(sheetId, mentorId)
    expect(gradeSheets[idx].mentorID).toBe(mentorId)
    const sheet = await service.getMentorGradeSheet(`${sheetId}`, `${mentorId}`)
    const sheets = await service.getMentorGradeSheets(`${mentorId}`)
    expect(sheets).toHaveLength(1)
    expect(sheet.mentorId).toBe(`${mentorId}`)
  })

  test('set project', async () => {
    const idx = 1
    const sheetId = gradeSheets[idx]._id
    const projectId = new Types.ObjectId()
    await service.setProject(sheetId, projectId)
    expect(gradeSheets[idx].projectID).toBe(projectId)
  })

  test('set mentor reviewers', async () => {
    const idx = 1
    const sheetId = gradeSheets[idx]._id
    const mentorIds = [gradeSheets[idx].reviewers[0], new Types.ObjectId()]
    expect(gradeSheets[idx].reviewers).toHaveLength(1)
    await service.setMentorReviewers(sheetId, mentorIds)
    expect(gradeSheets[idx].reviewers).toHaveLength(mentorIds.length)
  })

  test('set mentor grade', async () => {
    const idx = 7
    const sheet: GradeSheet = _.cloneDeep(gradeSheets[idx])
    const sheetId = gradeSheets[idx]._id
    const grades = {
      ExtraGrade: { points: 111 },
      Design: { points: 10 },
      repo: { points: 9 },
      App: { points: 10 },
    }
    await service.setMentorGrades(sheetId, grades)
    for (let name in grades)
      expect(gradeSheets[idx].mentorGrades[name]).toEqual(grades[name])
    for (let name in sheet.mentorGrades)
      if (!(name in grades))
        expect(gradeSheets[idx].mentorGrades[name]).toBe(undefined)
    expect(await service.setMentorGrades(Types.ObjectId(), grades)).toBeNull()
  })

  test('patch mentor grade', async () => {
    const idx = 7
    const sheet: GradeSheet = _.cloneDeep(gradeSheets[idx])
    const sheetId = gradeSheets[idx]._id
    const grades = {
      ExtraGrade: { points: 111 },
      Design: { points: 10 },
      repo: { points: 9 },
      App: { points: 10 },
    }
    await service.patchMentorGrades(sheetId, grades)
    for (let name in grades)
      expect(gradeSheets[idx].mentorGrades[name]).toEqual(grades[name])
    for (let name in sheet.mentorGrades)
      if (!(name in grades))
        expect(gradeSheets[idx].mentorGrades[name]).toEqual(
          sheet.mentorGrades[name],
        )
    expect(await service.setMentorGrades(Types.ObjectId(), grades)).toBeNull()

    expect(sheet.mentorGrades['extra']).not.toBe(undefined)
    await service.patchMentorGrades(sheetId, grades, ['extra'])
    const newSheet = await service.getMentorGradeSheet(`${sheetId}`, `${sheet.mentorID}`)
    expect(newSheet.mentorGrades['extra']).toBe(undefined)
  })

  test('get/set mentor reviewer grades', async () => {
    const idx = 7
    const prevSheet: GradeSheet = _.cloneDeep(gradeSheets[idx])
    const sheetId = gradeSheets[idx]._id
    const mentorIdx = 0
    const mentorId = gradeSheets[idx].reviewers[0]
    const setGrades = {
      ExtraGrade: { points: 33 },
      Design: { points: 11 },
      repo: { points: 12 },
      App: { points: 13 },
    }
    await service.setMentorReviewerGrades(sheetId, mentorId, setGrades)
    const reviewerGrades = await service.getReviewerGrades(
      `${sheetId}`,
      `${mentorId}`,
    )
    for (let name in setGrades)
      expect(reviewerGrades.grades[name]).toBe(setGrades[name])
    for (let name in prevSheet.mentorReviewerGrades[0].grades)
      if (!(name in setGrades))
        expect(reviewerGrades.grades[name]).toBe(undefined)
    expect(
      await service.setMentorReviewerGrades(
        Types.ObjectId(),
        mentorId,
        setGrades,
      ),
    ).toBeNull()
    expect(
      await service.setMentorReviewerGrades(
        sheetId,
        Types.ObjectId(),
        setGrades,
      ),
    ).toBeNull()
  })

  test('patch mentor reviewer grades', async () => {
    const idx = 7
    const prevSheet: GradeSheet = _.cloneDeep(gradeSheets[idx])
    const sheetId = gradeSheets[idx]._id
    const mentorIdx = 0
    const mentorId = gradeSheets[idx].reviewers[0]
    const setGrades = {
      ExtraGrade: { points: 33 },
      Design: { points: 11 },
      repo: { points: 12 },
      App: { points: 13 },
    }
    await service.patchMentorReviewerGrades(sheetId, mentorId, setGrades)
    const reviewerGrades = await service.getReviewerGrades(
      `${sheetId}`,
      `${mentorId}`,
    )
    for (let name in setGrades)
      expect(reviewerGrades.grades[name]).toBe(setGrades[name])
    for (let name in prevSheet.mentorReviewerGrades[0].grades)
      if (!(name in setGrades))
        expect(reviewerGrades.grades[name]).toEqual(
          prevSheet.mentorReviewerGrades[mentorIdx].grades[name],
        )
    
    let sheet = await service.getReviewerGradeSheet(
      `${sheetId}`,
      `${mentorId}`,
    )
    expect(sheet.mentorReviewerGrades[0].grades['extra']).not.toBe(undefined)
    await service.patchMentorReviewerGrades(sheetId, mentorId, setGrades, ['extra'])
    sheet = await service.getReviewerGradeSheet(
      `${sheetId}`,
      `${mentorId}`,
    )
    const sheets = await service.getReviewerGradeSheets(`${mentorId}`)
    expect(sheets).toHaveLength(1)
    expect(sheet.reviewers[0].id).toBe(`${mentorId}`)
    expect(sheet.mentorReviewerGrades[0].grades['extra']).toBe(undefined)

    expect(
      await service.patchMentorReviewerGrades(
        Types.ObjectId(),
        mentorId,
        setGrades,
      ),
    ).toBeNull()
    expect(
      await service.patchMentorReviewerGrades(
        sheetId,
        Types.ObjectId(),
        setGrades,
      ),
    ).toBeNull()
  })

  test('delete sheet', async () => {
    const deletedId = gradeSheets[0]._id
    await service.deleteGradeSheet(deletedId)
    const sheet: GradeSheetDto | null = await service.findGradeSheetById(
      `${deletedId}`,
    )
    expect(sheet).toBe(null)
  })

  test('get/set/update/delete participants', async () => {
    const idx = 7
    const sheetId = gradeSheets[idx]._id
    const participantID = Types.ObjectId()
    await service.addParticipant(sheetId, participantID)
    expect(`${gradeSheets[idx].participants[0].participantID}`).toBe(
      `${participantID}`,
    )
    await service.addParticipant(sheetId, participantID)
    expect(gradeSheets[idx].participants).toHaveLength(1)
    expect(
      await service.addParticipant(Types.ObjectId(), participantID),
    ).toBeNull()

    const engagement = 100
    const participants = [
      { id: participantID, engagement },
      { id: new Types.ObjectId(), engagement },
    ]
    await service.updateParticipants(`${sheetId}`, participants)
    expect(
      await service.updateParticipants(`${new Types.ObjectId()}`, participants),
    ).toBeNull()
    expect(gradeSheets[idx].participants[0].engagement).toBe(engagement)

    const sheet = await service.getParticipantGradeSheet(
      `${sheetId}`,
      `${participantID}`,
    )
    const sheets = await service.getParticipantGradeSheets(`${participantID}`)
    expect(sheets).toHaveLength(1)
    expect(sheet.participants[0].id).toBe(`${participantID}`)

    const newParticipants = [{ id: participantID }, { id: Types.ObjectId() }]
    await service.setParticipants(sheetId, newParticipants)
    expect(
      await service.setParticipants(Types.ObjectId(), newParticipants),
    ).toBeNull()
    expect(gradeSheets[idx].participants).toHaveLength(newParticipants.length)

    expect(
      await service.removeParticipant(Types.ObjectId(), participantID),
    ).toBeNull()
    expect(gradeSheets[idx].participants).toHaveLength(2)
    await service.removeParticipant(sheetId, participantID)
    expect(gradeSheets[idx].participants).toHaveLength(1)
    expect(
      await service.removeParticipant(sheetId, Types.ObjectId()),
    ).toBeNull()
    expect(
      gradeSheets[idx].participants.find(
        (part) => `${part.participantID}` === `${participantID}`,
      ),
    ).toBeUndefined()
  })
})
