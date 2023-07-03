"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/upload.ts
var upload_exports = {};
__export(upload_exports, {
  uploadRoutes: () => uploadRoutes
});
module.exports = __toCommonJS(upload_exports);
var import_node_crypto = require("crypto");
var import_node_path = require("path");
var import_node_fs = require("fs");
var import_node_stream = require("stream");
var import_node_util = require("util");
var pump = (0, import_node_util.promisify)(import_node_stream.pipeline);
async function uploadRoutes(app) {
  app.post("/upload", async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5242880
      }
    });
    if (!upload) {
      return reply.status(400).send();
    }
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);
    if (!isValidFileFormat) {
      return reply.status(400).send();
    }
    const fileId = (0, import_node_crypto.randomUUID)();
    const extension = (0, import_node_path.extname)(upload.filename);
    const fileName = fileId.concat(extension);
    const writeStream = (0, import_node_fs.createWriteStream)(
      (0, import_node_path.resolve)(__dirname, "../../uploads", fileName)
    );
    await pump(upload.file, writeStream);
    const fullUrl = request.protocol.concat("://").concat(request.hostname);
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString();
    return { fileUrl };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  uploadRoutes
});
