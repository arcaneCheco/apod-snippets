require("dotenv").config();
const express = require("express");
const Prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");
const UAParser = require("ua-parser-js");

const app = express();
const PORT = 3000;

//_dirname
app.use(express.static(`${__dirname}/dist`));

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

// const initApi = (req: Request) => {
const initApi = (req: any) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT!, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
  });
};

// const handleRequest = async (api: ResolvedApi) => {
const handleRequest = async (api: any) => {
  const meta = await api.getSingle("meta");
  console.log(meta);

  const home = await api.getSingle("home");

  const snippets = await api.getSingle("snippets", { fetchLinks: "pod.index" });

  const { results: pods } = await api.query(
    Prismic.Predicates.at("document.type", "pod")
  );

  const about = await api.getSingle("about");

  const additionalAssets = await api.getSingle("additional_assets");

  const textures: { [key: string]: string } = {};
  const sounds: { [key: string]: string } = {};

  snippets.data.snippets.forEach((snippet: any) => {
    snippet.media.name = snippet.media.name.split(".")[0];
    textures[snippet.media.name] = snippet.media.url;
  });

  pods.forEach((pod: any) => {
    pod.data.images.forEach((image: any) => {
      image.media.name = image.media.name.split(".")[0];
      textures[image.media.name] = image.media.url;
    });
  });

  additionalAssets.data.textures.forEach((image: any) => {
    image.media.name = image.media.name.split(".")[0];
    textures[image.media.name] = image.media.url;
  });

  additionalAssets.data.sounds.forEach((sound: any) => {
    sound.media.name = sound.media.name.split(".")[0];
    sounds[sound.media.name] = sound.media.url;
  });

  return {
    meta,
    home,
    snippets,
    pods,
    about,
    textures,
    sounds,
  };
};

app.use((req: any, res: any, next: any) => {
  const ua = UAParser(req.headers["user-agent"]);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === "mobile";
  res.locals.isTablet = ua.device.type === "tablet";

  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.get("/", async (req: any, res: any) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  res.render("views", {
    ...defaults,
  });
});

app.get("/about", async (req: any, res: any) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  res.render("views", {
    ...defaults,
  });
});

app.get("/snippets", async (req: any, res: any) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  res.render("views", {
    ...defaults,
  });
});

app.get("/detail/:uid", async (req: any, res: any) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  res.render("views", {
    ...defaults,
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

module.exports = app;
