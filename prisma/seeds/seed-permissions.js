const { PrismaClient, PermissionDomain } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const email = "sofyan.agus18@gmail.com".toLowerCase()

  // Ensure user exists (optional safety)
  const user = await prisma.appUser.findUnique({ where: { email } })
  if (!user) {
    throw new Error(`AppUser not found for email ${email}. Seed the user first.`)
  }

  const domains = [
    PermissionDomain.MENU,
    PermissionDomain.MODULE,
    PermissionDomain.DATA,
  ]

  for (const domain of domains) {
    const existing = await prisma.userPermission.findFirst({
      where: { userEmail: email, domain, resource: "*", group: null, region: null },
    })
    if (existing) {
      await prisma.userPermission.update({ where: { id: existing.id }, data: { allow: true } })
    } else {
      await prisma.userPermission.create({
        data: { userEmail: email, domain, resource: "*", allow: true, group: null, region: null },
      })
    }
  }

  console.log(`Seeded wildcard permissions (*) for ${email} across MENU, MODULE, DATA`)
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
