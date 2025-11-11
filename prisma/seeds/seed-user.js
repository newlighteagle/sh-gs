const { PrismaClient, UserRole } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const user = {
    username: "sofyan.salim",
    fullname: "Sofyan Agus Salim",
    email: "sofyan.agus18@gmail.com",
    role: UserRole.ADMINISTRATOR,
    group: null,
    region: null,
  }

  const email = user.email.toLowerCase()
  await prisma.appUser.upsert({
    where: { email },
    update: {
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      group: user.group,
      region: user.region,
    },
    create: {
      email,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      group: user.group,
      region: user.region,
    },
  })
  console.log(`Seeded AppUser: ${email} as ${user.role}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

