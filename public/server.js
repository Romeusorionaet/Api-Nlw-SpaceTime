'use strict'
const __create = Object.create
const __defProp = Object.defineProperty
const __getOwnPropDesc = Object.getOwnPropertyDescriptor
const __getOwnPropNames = Object.getOwnPropertyNames
const __getProtoOf = Object.getPrototypeOf
const __hasOwnProp = Object.prototype.hasOwnProperty
const __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    )
  }
const __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        })
  }
  return to
}
const __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
)

// node_modules/dotenv/package.json
const require_package = __commonJS({
  'node_modules/dotenv/package.json'(exports, module2) {
    module2.exports = {
      name: 'dotenv',
      version: '16.3.1',
      description: 'Loads environment variables from .env file',
      main: 'lib/main.js',
      types: 'lib/main.d.ts',
      exports: {
        '.': {
          types: './lib/main.d.ts',
          require: './lib/main.js',
          default: './lib/main.js',
        },
        './config': './config.js',
        './config.js': './config.js',
        './lib/env-options': './lib/env-options.js',
        './lib/env-options.js': './lib/env-options.js',
        './lib/cli-options': './lib/cli-options.js',
        './lib/cli-options.js': './lib/cli-options.js',
        './package.json': './package.json',
      },
      scripts: {
        'dts-check': 'tsc --project tests/types/tsconfig.json',
        lint: 'standard',
        'lint-readme': 'standard-markdown',
        pretest: 'npm run lint && npm run dts-check',
        test: 'tap tests/*.js --100 -Rspec',
        prerelease: 'npm test',
        release: 'standard-version',
      },
      repository: {
        type: 'git',
        url: 'git://github.com/motdotla/dotenv.git',
      },
      funding: 'https://github.com/motdotla/dotenv?sponsor=1',
      keywords: [
        'dotenv',
        'env',
        '.env',
        'environment',
        'variables',
        'config',
        'settings',
      ],
      readmeFilename: 'README.md',
      license: 'BSD-2-Clause',
      devDependencies: {
        '@definitelytyped/dtslint': '^0.0.133',
        '@types/node': '^18.11.3',
        decache: '^4.6.1',
        sinon: '^14.0.1',
        standard: '^17.0.0',
        'standard-markdown': '^7.1.0',
        'standard-version': '^9.5.0',
        tap: '^16.3.0',
        tar: '^6.1.11',
        typescript: '^4.8.4',
      },
      engines: {
        node: '>=12',
      },
      browser: {
        fs: false,
      },
    }
  },
})

// node_modules/dotenv/lib/main.js
const require_main = __commonJS({
  'node_modules/dotenv/lib/main.js'(exports, module2) {
    'use strict'
    const fs = require('fs')
    const path = require('path')
    const os = require('os')
    const crypto = require('crypto')
    const packageJson = require_package()
    const version = packageJson.version
    const LINE =
      /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm
    function parse(src) {
      const obj = {}
      let lines = src.toString()
      lines = lines.replace(/\r\n?/gm, '\n')
      let match
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1]
        let value = match[2] || ''
        value = value.trim()
        const maybeQuote = value[0]
        value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2')
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, '\n')
          value = value.replace(/\\r/g, '\r')
        }
        obj[key] = value
      }
      return obj
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options)
      const result = DotenvModule.configDotenv({ path: vaultPath })
      if (!result.parsed) {
        throw new Error(
          `MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`,
        )
      }
      const keys = _dotenvKey(options).split(',')
      const length = keys.length
      let decrypted
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim()
          const attrs = _instructions(result, key)
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key)
          break
        } catch (error) {
          if (i + 1 >= length) {
            throw error
          }
        }
      }
      return DotenvModule.parse(decrypted)
    }
    function _log(message) {
      console.log(`[dotenv@${version}][INFO] ${message}`)
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`)
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`)
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY
      }
      return ''
    }
    function _instructions(result, dotenvKey) {
      let uri
      try {
        uri = new URL(dotenvKey)
      } catch (error) {
        if (error.code === 'ERR_INVALID_URL') {
          throw new Error(
            'INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=development',
          )
        }
        throw error
      }
      const key = uri.password
      if (!key) {
        throw new Error('INVALID_DOTENV_KEY: Missing key part')
      }
      const environment = uri.searchParams.get('environment')
      if (!environment) {
        throw new Error('INVALID_DOTENV_KEY: Missing environment part')
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`
      const ciphertext = result.parsed[environmentKey]
      if (!ciphertext) {
        throw new Error(
          `NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`,
        )
      }
      return { ciphertext, key }
    }
    function _vaultPath(options) {
      let dotenvPath = path.resolve(process.cwd(), '.env')
      if (options && options.path && options.path.length > 0) {
        dotenvPath = options.path
      }
      return dotenvPath.endsWith('.vault') ? dotenvPath : `${dotenvPath}.vault`
    }
    function _resolveHome(envPath) {
      return envPath[0] === '~'
        ? path.join(os.homedir(), envPath.slice(1))
        : envPath
    }
    function _configVault(options) {
      _log('Loading env from encrypted .env.vault')
      const parsed = DotenvModule._parseVault(options)
      let processEnv = process.env
      if (options && options.processEnv != null) {
        processEnv = options.processEnv
      }
      DotenvModule.populate(processEnv, parsed, options)
      return { parsed }
    }
    function configDotenv(options) {
      let dotenvPath = path.resolve(process.cwd(), '.env')
      let encoding = 'utf8'
      const debug = Boolean(options && options.debug)
      if (options) {
        if (options.path != null) {
          dotenvPath = _resolveHome(options.path)
        }
        if (options.encoding != null) {
          encoding = options.encoding
        }
      }
      try {
        const parsed = DotenvModule.parse(
          fs.readFileSync(dotenvPath, { encoding }),
        )
        let processEnv = process.env
        if (options && options.processEnv != null) {
          processEnv = options.processEnv
        }
        DotenvModule.populate(processEnv, parsed, options)
        return { parsed }
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${dotenvPath} ${e.message}`)
        }
        return { error: e }
      }
    }
    function config(options) {
      const vaultPath = _vaultPath(options)
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options)
      }
      if (!fs.existsSync(vaultPath)) {
        _warn(
          `You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`,
        )
        return DotenvModule.configDotenv(options)
      }
      return DotenvModule._configVault(options)
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), 'hex')
      let ciphertext = Buffer.from(encrypted, 'base64')
      const nonce = ciphertext.slice(0, 12)
      const authTag = ciphertext.slice(-16)
      ciphertext = ciphertext.slice(12, -16)
      try {
        const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce)
        aesgcm.setAuthTag(authTag)
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`
      } catch (error) {
        const isRange = error instanceof RangeError
        const invalidKeyLength = error.message === 'Invalid key length'
        const decryptionFailed =
          error.message === 'Unsupported state or unable to authenticate data'
        if (isRange || invalidKeyLength) {
          const msg =
            'INVALID_DOTENV_KEY: It must be 64 characters long (or more)'
          throw new Error(msg)
        } else if (decryptionFailed) {
          const msg = 'DECRYPTION_FAILED: Please check your DOTENV_KEY'
          throw new Error(msg)
        } else {
          console.error('Error: ', error.code)
          console.error('Error: ', error.message)
          throw error
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug)
      const override = Boolean(options && options.override)
      if (typeof parsed !== 'object') {
        throw new Error(
          'OBJECT_REQUIRED: Please check the processEnv argument being passed to populate',
        )
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key]
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`)
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`)
            }
          }
        } else {
          processEnv[key] = parsed[key]
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate,
    }
    module2.exports.configDotenv = DotenvModule.configDotenv
    module2.exports._configVault = DotenvModule._configVault
    module2.exports._parseVault = DotenvModule._parseVault
    module2.exports.config = DotenvModule.config
    module2.exports.decrypt = DotenvModule.decrypt
    module2.exports.parse = DotenvModule.parse
    module2.exports.populate = DotenvModule.populate
    module2.exports = DotenvModule
  },
})

// node_modules/dotenv/lib/env-options.js
const require_env_options = __commonJS({
  'node_modules/dotenv/lib/env-options.js'(exports, module2) {
    'use strict'
    const options = {}
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY
    }
    module2.exports = options
  },
})

// node_modules/dotenv/lib/cli-options.js
const require_cli_options = __commonJS({
  'node_modules/dotenv/lib/cli-options.js'(exports, module2) {
    'use strict'
    const re = /^dotenv_config_(encoding|path|debug|override|DOTENV_KEY)=(.+)$/
    module2.exports = function optionMatcher(args) {
      return args.reduce(function (acc, cur) {
        const matches = cur.match(re)
        if (matches) {
          acc[matches[1]] = matches[2]
        }
        return acc
      }, {})
    }
  },
})

// node_modules/dotenv/config.js
;(function () {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv),
    ),
  )
})()

// src/server.ts
const import_fastify = __toESM(require('fastify'))
const import_cors = __toESM(require('@fastify/cors'))
const import_jwt = __toESM(require('@fastify/jwt'))
const import_multipart = __toESM(require('@fastify/multipart'))

// src/routes/auth.ts
const import_axios = __toESM(require('axios'))
const import_zod = require('zod')

// src/lib/prisma.ts
const import_client = require('@prisma/client')
const prisma = new import_client.PrismaClient({
  log: ['query'],
})

// src/routes/auth.ts
async function authRoutes(app2) {
  app2.post('/register', async (request) => {
    const bodySchema = import_zod.z.object({
      code: import_zod.z.string(),
    })
    const { code } = bodySchema.parse(request.body)
    const accessTokenResponse = await import_axios.default.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )
    const { access_token } = accessTokenResponse.data
    const userResponse = await import_axios.default.get(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
    const userSchema = import_zod.z.object({
      id: import_zod.z.number(),
      login: import_zod.z.string(),
      name: import_zod.z.string(),
      avatar_url: import_zod.z.string().url(),
    })
    const userInfo = userSchema.parse(userResponse.data)
    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }
    const token = app2.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    )
    return {
      token,
    }
  })
}

// src/routes/memories.ts
const import_zod2 = require('zod')
async function memoriesRoutes(app2) {
  app2.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })
  app2.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })
  app2.get('/memories/:id', async (request, reply) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid(),
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
  app2.post('/memories', async (request) => {
    const bodySchema = import_zod2.z.object({
      content: import_zod2.z.string(),
      coverUrl: import_zod2.z.string(),
      isPublic: import_zod2.z.coerce.boolean().default(false),
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
    return memory
  })
  app2.put('/memories/:id', async (request, reply) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const bodySchema = import_zod2.z.object({
      content: import_zod2.z.string(),
      coverUrl: import_zod2.z.string(),
      isPublic: import_zod2.z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
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
  app2.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid(),
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
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}

// src/routes/upload.ts
const import_node_crypto = require('crypto')
const import_node_path = require('path')
const import_node_fs = require('fs')
const import_node_stream = require('stream')
const import_node_util = require('util')
const pump = (0, import_node_util.promisify)(import_node_stream.pipeline)
async function uploadRoutes(app2) {
  app2.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5242880,
      },
    })
    if (!upload) {
      return reply.status(400).send()
    }
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)
    if (!isValidFileFormat) {
      return reply.status(400).send()
    }
    const fileId = (0, import_node_crypto.randomUUID)()
    const extension = (0, import_node_path.extname)(upload.filename)
    const fileName = fileId.concat(extension)
    const writeStream = (0, import_node_fs.createWriteStream)(
      (0, import_node_path.resolve)(__dirname, '../../uploads', fileName),
    )
    await pump(upload.file, writeStream)
    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()
    return { fileUrl }
  })
}

// src/server.ts
const import_node_path2 = require('path')
const app = (0, import_fastify.default)()
app.register(import_multipart.default)
app.register(require('@fastify/static'), {
  root: (0, import_node_path2.resolve)(__dirname, '../uploads'),
  prefix: '/uploads',
})
app.register(import_cors.default, {
  origin: true,
})
app.register(import_jwt.default, {
  secret: 'spacetimme',
})
app.register(authRoutes)
app.register(memoriesRoutes)
app.register(uploadRoutes)
app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log(`\u{1F413}Server is running on http://localhost:3333`)
  })
  .catch((err) => {
    console.log(err)
  })
// # sourceMappingURL=server.js.map
