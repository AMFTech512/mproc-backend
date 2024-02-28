import gm from "gm";
import Joi from "joi";

export const OPERATIONS = [
  "blur",
  "border",
  "brightness",
  "charcoal",
  "colorize",
  "contrast",
  "crop",
  "despeckle",
  "edge",
  "emboss",
  "enhance",
  "equalize",
  "flip",
  "flop",
  "gamma",
  "hue",
  "implode",
  "monochrome",
  "negative",
  "normalize",
  "rotate",
  "saturation",
  "scale",
  "sepia",
  "solarize",
  "swirl",
  "threshold",
  "transparent",
  "trim",
  "wave",
] as const;
type OperationType = (typeof OPERATIONS)[number];

export interface ArgumentMap {
  blur: { factor: number };
  border: { width: number; height: number; color: string };
  brightness: { percent: number };
  charcoal: { factor: number };
  colorize: { r: number; g: number; b: number };
  contrast: { multiplier: number };
  crop: { width: number; height: number; x: number; y: number };
  despeckle: undefined;
  edge: { radius?: number } | undefined;
  emboss: { radius?: number } | undefined;
  enhance: undefined;
  equalize: undefined;
  flip: undefined;
  flop: undefined;
  gamma: { r: number; g: number; b: number };
  hue: { percent: number };
  implode: { factor?: number } | undefined;
  monochrome: undefined;
  negative: undefined;
  normalize: undefined;
  rotate: { backgroundColor: string; degrees: number };
  saturation: { percent: number };
  scale: { width: number; height: number };
  sepia: undefined;
  solarize: { threshold: number };
  swirl: { degrees: number };
  threshold: { percent: number };
  transparent: { color: string };
  trim: undefined;
  wave: { amplitude: number; wavelength: number };
}

export interface ProcessStep<T extends OperationType> {
  operation: T;
  params: ArgumentMap[T];
}

export interface ImageInfo {
  size: gm.Dimensions;
  format: string;
  fileSize: string;
}

type ProcessFunction<T extends OperationType> = (
  state: gm.State,
  info: ImageInfo,
  args: ArgumentMap[T]
) => gm.State;

export const STEP_SCHEMA = Joi.object({
  operation: Joi.string()
    .valid(...OPERATIONS)
    .required(),
  params: Joi.optional(),
});

export const SCHEMA_MAP: Record<OperationType, Joi.Schema | undefined> = {
  blur: Joi.object({
    factor: Joi.number().required(),
  }),
  border: Joi.object({
    width: Joi.number().required(),
    height: Joi.number().required(),
    // TODO: validate the format of the color
    color: Joi.string().required(),
  }),
  brightness: Joi.object({
    percent: Joi.number().required(),
  }),
  charcoal: Joi.object({
    factor: Joi.number().min(0).max(3).required(),
  }),
  colorize: Joi.object({
    r: Joi.number().required(),
    g: Joi.number().required(),
    b: Joi.number().required(),
  }),
  contrast: Joi.object({
    multiplier: Joi.number().required(),
  }),
  crop: Joi.object({
    width: Joi.number().required(),
    height: Joi.number().required(),
    x: Joi.number().required(),
    y: Joi.number().required(),
  }),
  despeckle: undefined,
  edge: Joi.object({
    radius: Joi.number().optional(),
  }).optional(),
  emboss: Joi.object({
    radius: Joi.number().optional(),
  }).optional(),
  enhance: undefined,
  equalize: undefined,
  flip: undefined,
  flop: undefined,
  gamma: Joi.object({
    r: Joi.number().required(),
    g: Joi.number().required(),
    b: Joi.number().required(),
  }),
  hue: Joi.object({
    percent: Joi.number().required(),
  }),
  implode: Joi.object({
    factor: Joi.number().optional(),
  }).optional(),
  monochrome: undefined,
  negative: undefined,
  normalize: undefined,
  rotate: Joi.object({
    // TODO: validate the format of the color
    backgroundColor: Joi.string().required(),
    degrees: Joi.number().required(),
  }),
  saturation: Joi.object({
    percent: Joi.number().required(),
  }),
  scale: Joi.object({
    width: Joi.number().required(),
    height: Joi.number().required(),
  }),
  sepia: undefined,
  solarize: Joi.object({
    threshold: Joi.number().required(),
  }),
  swirl: Joi.object({
    degrees: Joi.number().required(),
  }),
  threshold: Joi.object({
    percent: Joi.number().required(),
  }),
  transparent: Joi.object({
    color: Joi.string().required(),
  }),
  trim: undefined,
  wave: Joi.object({
    amplitude: Joi.number().required(),
    wavelength: Joi.number().required(),
  }),
};

export function createProcessStep<OT extends OperationType>(
  operation: OT,
  params: ArgumentMap[OT]
) {
  return { operation, params } as ProcessStep<OT>;
}

export type ProcessFunctionMap = {
  [T in OperationType]: ProcessFunction<T>;
};

export const PROCESS_FUNCTION_MAP: ProcessFunctionMap = {
  blur: (state, props, args) => {
    // we're scaling the image down to 1/10th of its original size
    // then blurring it then scaling it back up to increase the speed of this operation

    const [scaledWidth, scaledHeight] = [
      Math.floor(props.size.width / 10),
      Math.floor(props.size.height / 10),
    ];

    return state
      .scale(scaledWidth, scaledHeight)
      .blur(7, args.factor)
      .scale(props.size.width, props.size.height);
  },
  border: function (state, props, args) {
    return state.borderColor(args.color).border(args.width, args.height);
  },
  brightness: function (state, props, args) {
    return state.modulate(args.percent, 100, 100);
  },
  charcoal: function (state, props, args) {
    return state.charcoal(args.factor);
  },
  colorize: function (state, props, args) {
    return state.colorize(args.r, args.g, args.b);
  },
  contrast: function (state, props, args) {
    return state.contrast(args.multiplier);
  },
  crop: function (state, props, args) {
    return state.crop(args.width, args.height, args.x, args.y);
  },
  despeckle: function (state, props) {
    return state.despeckle();
  },
  edge: function (state, props, args) {
    return state.edge(args?.radius);
  },
  emboss: function (state, props, args) {
    return state.emboss(args?.radius);
  },
  enhance: function (state, props) {
    return state.enhance();
  },
  equalize: function (state, props) {
    return state.equalize();
  },
  flip: function (state, props) {
    return state.flip();
  },
  flop: function (state, props) {
    return state.flop();
  },
  gamma: function (state, props, args) {
    return state.gamma(args.r, args.g, args.b);
  },
  hue: function (state, props, args) {
    return state.modulate(100, 100, args.percent);
  },
  implode: function (state, props, args) {
    return state.implode(args?.factor);
  },
  monochrome: function (state, props) {
    return state.monochrome();
  },
  negative: function (state, props) {
    return state.negative();
  },
  normalize: function (state, props) {
    return state.normalize();
  },
  rotate: function (state, props, args) {
    return state.rotate(args.backgroundColor, args.degrees);
  },
  saturation: function (state, props, args) {
    return state.modulate(100, args.percent, 100);
  },
  scale: function (state, props, args) {
    return state.scale(args.width, args.height);
  },
  sepia: function (state, props) {
    return state.sepia();
  },
  solarize: function (state, props, args) {
    return state.solarize(args.threshold);
  },
  swirl: function (state, props, args) {
    return state.swirl(args.degrees);
  },
  threshold: function (state, props, args) {
    return state.threshold(args.percent, true);
  },
  transparent: function (state, props, args) {
    return state.transparent(args.color);
  },
  trim: function (state, props) {
    return state.trim();
  },
  wave: function (state, props, args) {
    return state.wave(args.amplitude, args.wavelength);
  },
};

export function getDimensions(state: gm.State) {
  return new Promise<gm.Dimensions>((res, rej) => {
    state.size((err, size) => {
      if (err) {
        rej(err);
      } else {
        res(size);
      }
    });
  });
}

export function getFormat(state: gm.State) {
  return new Promise<string>((res, rej) => {
    state.format((err, format) => {
      if (err) {
        rej(err);
      } else {
        res(format);
      }
    });
  });
}

export function getFileSize(state: gm.State) {
  return new Promise<string>((res, rej) => {
    state.filesize((err, size) => {
      if (err) {
        rej(err);
      } else {
        res(size);
      }
    });
  });
}

export async function processStep<T extends OperationType>(
  state: gm.State,
  step: ProcessStep<T>
) {
  // Validate the step
  Joi.assert(step, STEP_SCHEMA);
  const paramsSchema = SCHEMA_MAP[step.operation];
  if (paramsSchema) {
    Joi.assert(step.params, paramsSchema);
  }

  // Get the image info
  const [size, format, fileSize] = await Promise.all([
    getDimensions(state),
    getFormat(state),
    getFileSize(state),
  ]);

  const imageInfo: ImageInfo = {
    size,
    format,
    fileSize,
  };

  // console.log("imageInfo", imageInfo);

  // Process the step
  const processFn = PROCESS_FUNCTION_MAP[step.operation];

  if (!processFn) {
    throw new Error(`Unsupported operation: ${step.operation}`);
  }

  return processFn(state, imageInfo, step.params);
}

export async function processSteps(
  state: gm.State,
  steps: ProcessStep<OperationType>[]
) {
  const newState = steps.reduce(
    async (state, step) => await processStep(await state, step),
    Promise.resolve(state)
  );
  return newState;
}

export async function writeImage(state: gm.State, path: string) {
  return new Promise<void>((res, rej) => {
    state.write(path, (err) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}
