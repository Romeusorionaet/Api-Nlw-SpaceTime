import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
const fs = require('fs')

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        OR: [
          {
            isPublic: true,
          },
          {
            isPublic: false,
            userId: request.user.sub,
          },
        ],
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      userIdOn: request.user.sub,
      memories: memories.map((memory) => {
        return {
          id: memory.id,
          author: memory.user.name,
          userId: memory.userId,
          coverUrl: memory.coverUrl,
          excerpt: memory.content.substring(0, 115).concat('...'),
          isPublic: memory.isPublic,
          createdAt: memory.createdAt,
        }
      }),
    }
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })

    if (memory) {
      return memory
    }
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.coverUrl !== coverUrl) {
      const path = require('path')
      const filePath = path.join(
        __dirname,
        './uploads',
        path.basename(memory.coverUrl),
      )

      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath)
        } catch (error) {
          console.error('Erro ao atualizar o arquivo:', error)
        }
      } else {
        console.error('O arquivo não existe:', filePath)
      }
    }

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    const path = require('path')
    const filePath = path.join(
      __dirname,
      './uploads',
      path.basename(memory.coverUrl),
    )

    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath)
      } catch (error) {
        console.error('Erro ao excluir o arquivo:', error)
      }
    } else {
      console.error('O arquivo não existe:', filePath)
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
