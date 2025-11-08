import { connectDB } from '~/server/utils/db'
import { UserData } from '~/server/models/UserData'

export default defineEventHandler(async () => {
  await connectDB()
  const items = await UserData.find({}).sort({ createdAt: -1 }).limit(5).lean()
  return {
    success: true,
    count: items.length,
    data: items.map(i => ({
      id: i._id.toString(),
      name: i.name,
      age: i.age,
      gender: i.gender,
      phone: i.phone,
      idCard: i.idCard,
      submittedAt: i.submittedAt,
      createdAt: i.createdAt,
    }))
  }
})


