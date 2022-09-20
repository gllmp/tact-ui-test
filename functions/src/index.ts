import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { tmpdir } from "os";
import { join } from "path";
import { Writable } from "stream";
import * as fs from "fs";
import { promisify } from "util";

const unlink = promisify(fs.unlink);

admin.initializeApp();

const streamToPromise = (stream: Writable | FfmpegCommand) =>
  new Promise<void>((resolve, reject) =>
    stream.on("end", resolve).on("error", reject)
  );

const createUploadStream = (filePath: string, bucketName?: string) => {
  const bucket = admin.storage().bucket(bucketName);
  const bucketFile = bucket.file(filePath);
  return bucketFile.createWriteStream();
};

export const uploadAudio = functions
  .region("europe-west1")
  .https.onRequest((request, response) => {
    const { id } = request.query;
    if (!id) {
      response.sendStatus(400);
      return;
    }
    request
      .read()
      .pipe(createUploadStream(`${id}/audio.mp3`, "tact-tracks"), {
        end: true,
      })
      .on("end", () => response.sendStatus(202));
  });

export const mergeVideo = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 180 })
  .storage.bucket("tact-tracks")
  .object()
  .onFinalize(async (source) => {
    const bucket = admin.storage().bucket("tact-tracks");
    const sourceFilePath = source.name as string;
    // filePath looks like gs://bucket/o/<id>/<track>
    const [track, id] = sourceFilePath.split("/").reverse();
    // Source File was just uploaded, trackFile is the matching audio/image track
    const sourceFile = bucket.file(sourceFilePath);
    let trackFile: ReturnType<typeof bucket.file>;
    switch (track) {
      case "audio.mp3":
        trackFile = bucket.file(`${id}/image.webm`);
        break;
      case "image.webm":
        trackFile = bucket.file(`${id}/audio.mp3`);
        break;
      default:
        functions.logger.warn(
          "STORAGE",
          "No matching track found for source file",
          sourceFilePath
        );
        return;
    }
    const tmpFilePath = join(tmpdir(), id);
    const finalTmpFilePath = `${tmpFilePath}.mp4`;

    try {
      const [exists, isTrackLarger] = await Promise.all([
        trackFile.exists().then(([v]) => v),
        trackFile.getMetadata().then(([{ size }]) => size > source.size),
      ]);
      if (!exists)
        return functions.logger.warn(
          "STORAGE",
          "No file found for track matching",
          sourceFilePath
        );

      await streamToPromise(
        // Write the smaller track into memory
        // as FFMPEG cannot handle more than 1 input stream
        (isTrackLarger ? sourceFile : trackFile)
          .createReadStream()
          .pipe(fs.createWriteStream(tmpFilePath))
      );
      const command = ffmpeg(tmpFilePath)
        .setFfmpegPath(ffmpegStatic)
        .addInput((isTrackLarger ? trackFile : sourceFile).createReadStream())
        .output(finalTmpFilePath)
        .size("1920x650")
        .duration(60)
        .outputOption(["-map 0:0", "-map 1:0"]);

      command.run();
      // command.pipe(createUploadStream(`${id}.mp4`, "tact-finals"), { end: true });
      await streamToPromise(command);
      await streamToPromise(
        fs
          .createReadStream(finalTmpFilePath)
          .pipe(createUploadStream(`${id}.mp4`, "tact-finals"), { end: true })
      );
      await Promise.all([trackFile, sourceFile].map((f) => f.delete()));
      functions.logger.log("FFMPEG_SUCCESS");
    } catch (e) {
      functions.logger.error("FFMPEG_ERROR", e);
    } finally {
      await Promise.all(
        [tmpFilePath, finalTmpFilePath].map((f) => unlink(f))
      ).catch(functions.logger.error);
      functions.logger.log("FFMPEG_DONE");
    }
  });

// const testMergeVideo = async () => {
//   const command = ffmpeg({ logger: functions.logger })
//     .setFfmpegPath(ffmpegStatic)
//     .input(fs.createReadStream("image.webm"))
//     .addInput("audio.mp3")
//     .output("outvideo.mp4")
//     .outputOption(["-map 0:0", "-map 1:0"])
//     .size("1920x650")
//     .duration(30);

//   command.run();
//   // command.pipe(
//   //   fs.createWriteStream("outstream.mp4", {
//   //     flags: "w+",
//   //     mode: 0o666,
//   //     encoding: "binary",
//   //   }),
//   //   { end: true }
//   // );
//   await streamToPromise(command);
// };

// console.time("mergeVideo");
// testMergeVideo()
//   .then(() => functions.logger.log("success!"))
//   .catch(functions.logger.error)
//   .finally(() => console.timeEnd("mergeVideo"));
