const { PrismaClient, ImpactCategory } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

function readJson(relPath) {
  const p = path.join(__dirname, "..", relPath)
  const raw = fs.readFileSync(p, "utf8")
  return JSON.parse(raw)
}

async function seedCategory(category, items) {
  await prisma.impactNode.deleteMany({ where: { category } })

  async function createRecursive(node, parentId, order) {
    const created = await prisma.impactNode.create({
      data: {
        category,
        key: node.id,
        label: node.label,
        baseline: node.baseline ?? null,
        intermediary: node.intermediary ?? null,
        msa: node.msa ?? null,
        type: node.type ?? null,
        lastChild: Boolean(node.lastChild),
        parentId,
        order,
      },
    })

    if (Array.isArray(node.children) && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        await createRecursive(node.children[i], created.id, i)
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    await createRecursive(items[i], null, i)
  }
}

async function main() {
  const outcomes = readJson("lib/impact-outcomes.json")
  const outputs = readJson("lib/impact-outputs.json")
  const activities = readJson("lib/impact-activities.json")

  await seedCategory(ImpactCategory.OUTCOME, outcomes)
  await seedCategory(ImpactCategory.OUTPUT, outputs)
  await seedCategory(ImpactCategory.ACTIVITY, activities)
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
