import { FastifyInstance } from 'fastify'
import { upload } from '../cloudinary/multer'
import { createImageUrl } from '../cloudinary/config'

export async function uploadRoutes(app: FastifyInstance) {
  app.post(
    '/upload',
    { preHandler: upload.single('file') },
    async (request, reply) => {
      const upload = request.file

      if (!upload) {
        return reply.status(400).send()
      }

      const response = await createImageUrl(upload.path)

      return { fileUrl: response?.url }
    },
  )
}
