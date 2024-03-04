import { beforeAll, describe, test } from "bun:test";
import gm from "gm";
import path from "path";
import {
  createProcessStep,
  processStep,
  processSteps,
  writeImage,
} from "../../../src/image-processor";
import { mkdir } from "fs/promises";

const ASSET_PATH = "tests/unit/image-processor/assets";
const DEST_PATH = "tests/unit/image-processor/results";

const getAssetPath = (name: string) => {
  return path.resolve(ASSET_PATH, name);
};

const getDestPath = (name: string) => {
  return path.resolve(DEST_PATH, name);
};

describe("image-processor", () => {
  beforeAll(async () => {
    // create the results directory
    await mkdir(DEST_PATH, { recursive: true });
  });

  describe("operations", () => {
    test("blur", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "blur",
        params: { factor: 10 },
      });

      await writeImage(state, getDestPath("1-blur.jpg"));
    });

    test("border", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "border",
        params: { width: 20, height: 20, color: "red" },
      });

      await writeImage(state, getDestPath("1-border.jpg"));
    });

    test("brightness", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "brightness",
        params: { percent: 50 },
      });

      await writeImage(state, getDestPath("1-brightness.jpg"));
    });

    test("charcoal", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "charcoal",
        params: { factor: 0 },
      });

      await writeImage(state, getDestPath("1-charcoal.jpg"));
    });

    test("colorize", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "colorize",
        params: { r: 0, g: 100, b: 100 },
      });

      await writeImage(state, getDestPath("1-colorize.jpg"));
    });

    test("contrast", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "contrast",
        params: { multiplier: -2 },
      });

      await writeImage(state, getDestPath("1-contrast.jpg"));
    });

    test("crop", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "crop",
        params: { width: 100, height: 100, x: 0, y: 0 },
      });

      await writeImage(state, getDestPath("1-crop.jpg"));
    });

    test("despeckle", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "despeckle",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-despeckle.jpg"));
    });

    test("edge", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "edge",
        params: { radius: 2 },
      });

      await writeImage(state, getDestPath("1-edge.jpg"));
    });

    test("emboss", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "emboss",
        params: { radius: 2 },
      });

      await writeImage(state, getDestPath("1-emboss.jpg"));
    });

    test("enhance", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "enhance",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-enhance.jpg"));
    });

    test("equalize", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "equalize",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-equalize.jpg"));
    });

    test("flip", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "flip",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-flip.jpg"));
    });

    test("flop", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "flop",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-flop.jpg"));
    });

    test("gamma", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "gamma",
        params: { r: 0.5, g: 0.5, b: 0.5 },
      });

      await writeImage(state, getDestPath("1-gamma.jpg"));
    });

    test("hue", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "hue",
        params: { percent: 50 },
      });

      await writeImage(state, getDestPath("1-hue.jpg"));
    });

    test("implode", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "implode",
        params: { factor: 0.5 },
      });

      await writeImage(state, getDestPath("1-implode.jpg"));
    });

    test("monochrome", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "monochrome",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-monochrome.jpg"));
    });

    test("negative", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "negative",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-negative.jpg"));
    });

    test("normalize", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "normalize",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-normalize.jpg"));
    });

    test("rotate", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "rotate",
        params: { backgroundColor: "red", degrees: 45 },
      });

      await writeImage(state, getDestPath("1-rotate.jpg"));
    });

    test("saturation", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "saturation",
        params: { percent: 50 },
      });

      await writeImage(state, getDestPath("1-saturation.jpg"));
    });

    test("scale", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "scale",
        params: { width: 100, height: 100 },
      });

      await writeImage(state, getDestPath("1-scale.jpg"));
    });

    test("sepia", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "sepia",
        params: undefined,
      });

      await writeImage(state, getDestPath("1-sepia.jpg"));
    });

    test("solarize", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "solarize",
        params: { threshold: 50 },
      });

      await writeImage(state, getDestPath("1-solarize.jpg"));
    });

    test("swirl", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "swirl",
        params: { degrees: 90 },
      });

      await writeImage(state, getDestPath("1-swirl.jpg"));
    });

    test("threshold", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "threshold",
        params: { percent: 50 },
      });

      await writeImage(state, getDestPath("1-threshold.jpg"));
    });

    test("transparent", async () => {
      let state = gm(getAssetPath("2.jpg"));

      state = await processStep(state, {
        operation: "transparent",
        params: { color: "white" },
      });

      await writeImage(state, getDestPath("2-transparent.png"));
    });

    test("trim", async () => {
      let state = gm(getAssetPath("2.jpg"));

      state = await processStep(state, {
        operation: "trim",
        params: undefined,
      });

      await writeImage(state, getDestPath("2-trim.png"));
    });

    test("wave", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "wave",
        params: { amplitude: 20, wavelength: 20 },
      });

      await writeImage(state, getDestPath("1-wave.jpg"));
    });

    test("watermark", async () => {
      let state = gm(getAssetPath("1.jpg"));

      state = await processStep(state, {
        operation: "watermark",
        params: {
          x: 0,
          y: 0,
          text: "watermark",
          angle: 315,
          size: 300,
          gravity: "Center",
          color: "white",
          brightness: 150,
        },
      });

      await writeImage(state, getDestPath("1-watermark.jpg"));
    });
  });

  test("processSteps", async () => {
    let state = gm(getAssetPath("1.jpg"));

    state = await processSteps(state, [
      createProcessStep("scale", { width: 100, height: 100 }),
      createProcessStep("rotate", { degrees: 45, backgroundColor: "red" }),
    ]);

    await writeImage(state, getDestPath("1-process-steps.jpg"));
  });
});
