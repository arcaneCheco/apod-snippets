const express = require("express");
require("dotenv").config();
const Prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");
const UAParser = require("ua-parser-js");

const app = express();
const PORT = 3000;

app.use(express.static(`${__dirname}/dist`));

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
  });
};

const handleRequest = async (api) => {
  const meta = await api.getSingle("meta");

  const home = await api.getSingle("home");

  const snippets = await api.getSingle("snippets", { fetchLinks: "pod.index" });

  const { results: pods } = await api.query(
    Prismic.Predicates.at("document.type", "pod")
  );

  const about = await api.getSingle("about");

  const additionalAssets = await api.getSingle("additional_assets");

  const textures = {};
  const sounds = {};

  snippets.data.snippets.forEach((snippet) => {
    snippet.media.name = snippet.media.name.split(".")[0];
    textures[snippet.media.name] = snippet.media.url;
  });

  pods.forEach((pod) => {
    pod.data.images.forEach((image) => {
      image.media.name = image.media.name.split(".")[0];
      textures[image.media.name] = image.media.url;
    });
  });

  additionalAssets.data.textures.forEach((image) => {
    image.media.name = image.media.name.split(".")[0];
    textures[image.media.name] = image.media.url;
  });

  additionalAssets.data.sounds.forEach((sound) => {
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

app.use((req, res, next) => {
  const ua = UAParser(req.headers["user-agent"]);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === "mobile";
  res.locals.isTablet = ua.device.type === "tablet";

  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.get(["/", "/about", "/snippets", "/detail/:uid"], async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  res.render("views", {
    ...defaults,
  });
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

module.exports = app;
