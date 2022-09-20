import { Scene } from "./typings";

export const findImage = (name: string, sizes = [1920, 3840], ext = "png"): string =>
  `/images/${sizes.find((size) => size >= innerWidth)}/${name}.${ext}`;

const credits = {
  name: "credits",
  duration: 10,
} as Scene;

const panorama01: Scene = {
  name: "panorama01",
  title: "TACT",
  composer: "Romain Barthélémy",
  designer: "Zoé Aegerter",
  photographer: "Quentin Chevrier",
  imageSrc: findImage("romain-01"),
  duration: 45,
  transitionOut: 2000,
};

const didem01: Scene = {
  name: "didem01",
  title: "Locus Solus",
  composer: "Didem Coskunseven",
  designer: "Zoé Aegerter",
  photographer: "Philippe Barbosa",
  assistantComposer: "Engin Daglik",
  imageSrc: findImage("didem-01"),
  duration: 5,
  transitionOut: 2000,
  next: "didem02",
};
const didem02: Scene = {
  name: "didem02",
  title: "Didem 2",
  transitionIn: 2000,
  imageSrc: findImage("didem-02"),
  duration: 5,
  transitionOut: 2000,
  next: "credits",
};

const fabien01: Scene = {
  name: "fabien01",
  title: "Network",
  composer: "Fabien Bourlier",
  designer: "Zoé Aegerter",
  photographer: "Sergio Grazia",
  imageSrc: findImage("fabien-01"),
  duration: 90,
  next: "fabien02",
};
const fabien02: Scene = {
  name: "fabien02",
  title: "Network",
  imageSrc: findImage("fabien-02"),
  duration: 90,
  next: "fabien03",
};
const fabien03: Scene = {
  name: "fabien03",
  title: "Network",
  imageSrc: findImage("fabien-03"),
  duration: 30,
  next: "credits",
};

const georges01: Scene = {
  name: "georges01",
  title: "Sur les quais",
  composer: "Georges Aperghis",
  designer: "Zoé Aegerter",
  photographer: "Quentin Chevrier",
  imageSrc: findImage("georges-01"),
  duration: 90,
  next: "georges02",
};
const georges02: Scene = {
  name: "georges02",
  title: "Sur les quais",
  composer: "Georges Aperghis",
  designer: "Zoé Aegerter",
  photographer: "Quentin Chevrier",
  imageSrc: findImage("georges-02"),
  duration: 90,
  next: "georges03",
};
const georges03: Scene = {
  name: "georges03",
  title: "Sur les quais",
  composer: "Georges Aperghis",
  designer: "Zoé Aegerter",
  photographer: "Quentin Chevrier",
  imageSrc: findImage("georges-03"),
  duration: 90,
  next: "credits",
};

export const scenes: Record<string, Scene> = {
  panorama01,
  didem01,
  didem02,
  fabien01,
  fabien02,
  fabien03,
  georges01,
  georges02,
  georges03,
  credits,
};

export const getScene = (name: string): Scene => scenes[name] ?? scenes[name + "01"];
