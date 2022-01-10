import dotenv from "dotenv";
import express, { Request } from "express";
import Bundler from "parcel-bundler";
import Prismic from "@prismicio/client";
import ResolvedApi from "@prismicio/client/types/ResolvedApi";
import PrismicDOM from "prismic-dom";

interface Pod {
  copyright: string;
  date: string;
  explanation: string;
  title: string;
  url: string;
}

declare global {
  interface Window {
    ASSETS: any;
  }
}

dotenv.config();
const app = express();
const PORT = 3000;

// let bundler = new Bundler(`${__dirname}/views/views.pug`);
let bundler = new Bundler([
  `${__dirname}/app/app.ts`,
  `${__dirname}/styles/styles.scss`,
]);
app.use(bundler.middleware());

app.use(express.static(`${__dirname}/dist`));

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

const initApi = (req: Request) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT!, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
  });
};

const handleRequest = async (api: ResolvedApi) => {
  const explore = await api.getSingle("explore", { fetchLinks: "pod.title" });
  // const explore = await api.getSingle("explore");

  const { results: pods } = await api.query(
    Prismic.Predicates.at("document.type", "pod")
  );

  // console.log(pods[0].data);

  const assets: any = [];

  explore.data.gallery.forEach((item: any) => {
    assets.push(item.image.url);
  });

  pods.forEach((pod) => {
    assets.push(pod.data.image.url);
    pod.data.images.forEach((image: any) => {
      assets.push(image.images_image.url);
    });
  });

  // console.log(pods[0].data);

  return {
    explore,
    pods,
    assets,
  };
};

app.use((req, res, next) => {
  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.get("/", async (req, res) => {
  // const api = await initApi(req);
  // const defaults = await handleRequest(api);
  // res.render("views", {
  //   ...defaults,
  // });
  res.render("views", {
    ...defaultsFall,
  });
});

app.get("/about", async (req, res) => {
  // const api = await initApi(req);
  // const defaults = await handleRequest(api);
  res.render("views", {
    ...defaultsFall,
  });
});

app.get("/explore", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  console.log(defaults.explore.data.gallery[1].pod.data.title);
  res.render("views", {
    ...defaults,
  });
  // res.render("views", {
  //   ...defaultsFall,
  // });
});

app.get("/detail/:uid", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  res.render("views", {
    ...defaults,
  });
  // res.render("views", {
  //   ...defaultsFall,
  // });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

const defaultsFall = {
  explore: {
    id: "YcnY6hEAACQABYrL",
    uid: null,
    url: null,
    type: "explore",
    href: "https://practice-1378.cdn.prismic.io/api/v2/documents/search?ref=YcpSQhEAACYAB6fd&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22YcnY6hEAACQABYrL%22%29+%5D%5D",
    tags: [],
    first_publication_date: "2021-12-27T15:17:04+0000",
    last_publication_date: "2021-12-27T23:54:42+0000",
    slugs: ["explore"],
    linked_documents: [],
    lang: "en-gb",
    alternate_languages: [],
    data: {
      gallery: [
        {
          image: {
            alt: null,
            copyright: null,
            url: "https://images.prismic.io/slicemachine-blank/26d81419-4d65-46b8-853e-8ea902e160c1_groovy.png?auto=compress,format",
          },
          pod: {
            id: "YcpGFBEAACQAB3GC",
            type: "pod",
            tags: [],
            slug: "a-candidate-for-the-biggest-boom-yet-seen",
            lang: "en-gb",
            first_publication_date: "2021-12-27T23:02:48+0000",
            last_publication_date: "2021-12-27T23:02:48+0000",
            uid: "asassn-15lh",
            link_type: "Document",
            isBroken: false,
            data: { title: "A candidate for the Biggest Boom Yet Seen" },
          },
        },
        {
          image: {
            alt: null,
            copyright: null,
            url: "https://images.prismic.io/slicemachine-blank/6b2bf485-aa12-44ef-8f06-dce6b91b9309_dancing.png?auto=compress,format",
          },
          pod: {
            id: "YcpQcxEAACUAB5_i",
            type: "pod",
            tags: [],
            slug: "some-dummy-title",
            lang: "en-gb",
            first_publication_date: "2021-12-27T23:47:20+0000",
            last_publication_date: "2021-12-27T23:47:20+0000",
            uid: "dummy-pod",
            link_type: "Document",
            isBroken: false,
            data: { title: "Some Dummy Title" },
          },
        },
        {
          image: {
            alt: null,
            copyright: null,
            url: "https://images.prismic.io/slicemachine-blank/dcea6535-f43b-49a7-8623-bf281aaf1cb2_roller-skating.png?auto=compress,format",
          },
          pod: {
            id: "YcpGFBEAACQAB3GC",
            type: "pod",
            tags: [],
            slug: "a-candidate-for-the-biggest-boom-yet-seen",
            lang: "en-gb",
            first_publication_date: "2021-12-27T23:02:48+0000",
            last_publication_date: "2021-12-27T23:02:48+0000",
            uid: "asassn-15lh",
            link_type: "Document",
            isBroken: false,
            data: { title: "A candidate for the Biggest Boom Yet Seen" },
          },
        },
        {
          image: {
            alt: null,
            copyright: null,
            url: "https://images.prismic.io/slicemachine-blank/30d6602b-c832-4379-90ef-100d32c5e4c6_selfie.png?auto=compress,format",
          },
          pod: {
            id: "YcpQcxEAACUAB5_i",
            type: "pod",
            tags: [],
            slug: "some-dummy-title",
            lang: "en-gb",
            first_publication_date: "2021-12-27T23:47:20+0000",
            last_publication_date: "2021-12-27T23:47:20+0000",
            uid: "dummy-pod",
            link_type: "Document",
            isBroken: false,
            data: { title: "Some Dummy Title" },
          },
        },
        {
          image: {
            alt: null,
            copyright: null,
            url: "https://images.prismic.io/slicemachine-blank/b07ef5eb-891d-44f2-a239-2fea5a999116_reading-side.png?auto=compress,format",
          },
          pod: {
            id: "YcpGFBEAACQAB3GC",
            type: "pod",
            tags: [],
            slug: "a-candidate-for-the-biggest-boom-yet-seen",
            lang: "en-gb",
            first_publication_date: "2021-12-27T23:02:48+0000",
            last_publication_date: "2021-12-27T23:02:48+0000",
            uid: "asassn-15lh",
            link_type: "Document",
            isBroken: false,
            data: { title: "A candidate for the Biggest Boom Yet Seen" },
          },
        },
      ],
    },
  },
  pods: [
    {
      id: "YcpQcxEAACUAB5_i",
      uid: "dummy-pod",
      url: null,
      type: "pod",
      href: "https://practice-1378.cdn.prismic.io/api/v2/documents/search?ref=YcpSQhEAACYAB6fd&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22YcpQcxEAACUAB5_i%22%29+%5D%5D",
      tags: [],
      first_publication_date: "2021-12-27T23:47:20+0000",
      last_publication_date: "2021-12-27T23:47:20+0000",
      linked_documents: [],
      lang: "en-gb",
      alternate_languages: [],
      data: {
        title: "Some dummy title",
        explanation:
          "It is a candidate for the brightest and most powerful explosion ever seen -- what is it?  The flaring spot of light was found by the All Sky Automated Survey for Supernovae (ASASSN) in June of last year and labelled ASASSN-15lh.  Located about three billion light years distant, the source appears tremendously bright for anything so far away: roughly 200 times brighter than an average supernova, and temporarily 20 times brighter than all of the stars in our Milky Way Galaxy combined. Were light emitted by ASASSN-15lh at this rate in all directions at once, it would be the most powerful explosion yet recorded. No known stellar object was thought to create an explosion this powerful, although pushing the theoretical limits for the spin-down of highly-magnetized neutron star -- a magnetar -- gets close.  Assuming the flare fades as expected later this year, astronomers are planning to use telescopes including Hubble to zoom in on the region to gain more clues.  The above-featured artist's illustration depicts a hypothetical night sky of a planet located across the host galaxy from the outburst.",
        image: {
          alt: null,
          copyright: null,
          url: "https://images.prismic.io/practice-1378/f3b13fd6-bc63-46a7-9e25-8e226241df10_BrightBoom_JinMa_960.jpeg?auto=compress,format",
        },
        images: [
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/practice-1378/fa186987-d3ce-476b-b1cc-18cab2893209_ESO_Magnetar_480.jpeg?auto=compress,format",
            },
            explanation1:
              "It is a candidate for the brightest and most powerful explosion ever seen -- what is it?  The flaring spot of light was found by the All Sky Automated Survey for Supernovae (ASASSN) in June of last year and labelled ASASSN-15lh.",
          },
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/practice-1378/af02e388-93d1-405f-86b0-9c0200cd6558_Asassn15lh.png?auto=compress,format",
            },
            explanation1:
              "Located about three billion light years distant, the source appears tremendously bright for anything so far away: roughly 200 times brighter than an average supernova, and temporarily 20 times brighter than all of the stars in our Milky Way Galaxy combined.",
          },
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/slicemachine-blank/3109b42f-4f55-4de1-91fa-40c734f88e62_ice-cream.png?auto=compress,format",
            },
            explanation1:
              "Were light emitted by ASASSN-15lh at this rate in all directions at once, it would be the most powerful explosion yet recorded. No known stellar object was thought to create an explosion this powerful, although pushing the theoretical limits for the spin-down of highly-magnetized neutron star -- a magnetar -- gets close.",
          },
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/slicemachine-blank/76bc1e6e-67a0-41d9-9c3c-5a5d3161e6a9_bikini.png?auto=compress,format",
            },
            explanation1:
              "Assuming the flare fades as expected later this year, astronomers are planning to use telescopes including Hubble to zoom in on the region to gain more clues.  The above-featured artist's illustration depicts a hypothetical night sky of a planet located across the host galaxy from the outburst.",
          },
        ],
        video: {
          link_type: "Media",
          name: "dummy.mov",
          kind: "document",
          url: "https://practice-1378.cdn.prismic.io/practice-1378/21b116ba-7139-4614-9671-df8993e4be69_dummy.mov",
          size: "2105139",
        },
      },
    },
    {
      id: "YcpGFBEAACQAB3GC",
      uid: "asassn-15lh",
      url: null,
      type: "pod",
      href: "https://practice-1378.cdn.prismic.io/api/v2/documents/search?ref=YcpSQhEAACYAB6fd&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22YcpGFBEAACQAB3GC%22%29+%5D%5D",
      tags: [],
      first_publication_date: "2021-12-27T23:02:48+0000",
      last_publication_date: "2021-12-27T23:02:48+0000",
      linked_documents: [],
      lang: "en-gb",
      alternate_languages: [],
      data: {
        title: "A Candidate for the Biggest Boom Yet Seen",
        explanation:
          "It is a candidate for the brightest and most powerful explosion ever seen -- what is it?  The flaring spot of light was found by the All Sky Automated Survey for Supernovae (ASASSN) in June of last year and labelled ASASSN-15lh.  Located about three billion light years distant, the source appears tremendously bright for anything so far away: roughly 200 times brighter than an average supernova, and temporarily 20 times brighter than all of the stars in our Milky Way Galaxy combined. Were light emitted by ASASSN-15lh at this rate in all directions at once, it would be the most powerful explosion yet recorded. No known stellar object was thought to create an explosion this powerful, although pushing the theoretical limits for the spin-down of highly-magnetized neutron star -- a magnetar -- gets close.  Assuming the flare fades as expected later this year, astronomers are planning to use telescopes including Hubble to zoom in on the region to gain more clues.  The above-featured artist's illustration depicts a hypothetical night sky of a planet located across the host galaxy from the outburst.",
        image: {
          alt: null,
          copyright: null,
          url: "https://images.prismic.io/practice-1378/f3b13fd6-bc63-46a7-9e25-8e226241df10_BrightBoom_JinMa_960.jpeg?auto=compress,format",
        },
        images: [
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/practice-1378/fa186987-d3ce-476b-b1cc-18cab2893209_ESO_Magnetar_480.jpeg?auto=compress,format",
            },
            explanation1:
              "It is a candidate for the brightest and most powerful explosion ever seen -- what is it?  The flaring spot of light was found by the All Sky Automated Survey for Supernovae (ASASSN) in June of last year and labelled ASASSN-15lh.",
          },
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/practice-1378/af02e388-93d1-405f-86b0-9c0200cd6558_Asassn15lh.png?auto=compress,format",
            },
            explanation1:
              "Located about three billion light years distant, the source appears tremendously bright for anything so far away: roughly 200 times brighter than an average supernova, and temporarily 20 times brighter than all of the stars in our Milky Way Galaxy combined.",
          },
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/slicemachine-blank/3109b42f-4f55-4de1-91fa-40c734f88e62_ice-cream.png?auto=compress,format",
            },
            explanation1:
              "Were light emitted by ASASSN-15lh at this rate in all directions at once, it would be the most powerful explosion yet recorded. No known stellar object was thought to create an explosion this powerful, although pushing the theoretical limits for the spin-down of highly-magnetized neutron star -- a magnetar -- gets close.",
          },
          {
            images_image: {
              alt: null,
              copyright: null,
              url: "https://images.prismic.io/slicemachine-blank/76bc1e6e-67a0-41d9-9c3c-5a5d3161e6a9_bikini.png?auto=compress,format",
            },
            explanation1:
              "Assuming the flare fades as expected later this year, astronomers are planning to use telescopes including Hubble to zoom in on the region to gain more clues.  The above-featured artist's illustration depicts a hypothetical night sky of a planet located across the host galaxy from the outburst.",
          },
        ],
        video: {
          link_type: "Media",
          name: "dummy.mov",
          kind: "document",
          url: "https://practice-1378.cdn.prismic.io/practice-1378/21b116ba-7139-4614-9671-df8993e4be69_dummy.mov",
          size: "2105139",
        },
      },
    },
  ],
  assets: [
    "https://images.prismic.io/slicemachine-blank/26d81419-4d65-46b8-853e-8ea902e160c1_groovy.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/6b2bf485-aa12-44ef-8f06-dce6b91b9309_dancing.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/dcea6535-f43b-49a7-8623-bf281aaf1cb2_roller-skating.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/30d6602b-c832-4379-90ef-100d32c5e4c6_selfie.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/b07ef5eb-891d-44f2-a239-2fea5a999116_reading-side.png?auto=compress,format",
    "https://images.prismic.io/practice-1378/f3b13fd6-bc63-46a7-9e25-8e226241df10_BrightBoom_JinMa_960.jpeg?auto=compress,format",
    "https://images.prismic.io/practice-1378/fa186987-d3ce-476b-b1cc-18cab2893209_ESO_Magnetar_480.jpeg?auto=compress,format",
    "https://images.prismic.io/practice-1378/af02e388-93d1-405f-86b0-9c0200cd6558_Asassn15lh.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/3109b42f-4f55-4de1-91fa-40c734f88e62_ice-cream.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/76bc1e6e-67a0-41d9-9c3c-5a5d3161e6a9_bikini.png?auto=compress,format",
    "https://images.prismic.io/practice-1378/f3b13fd6-bc63-46a7-9e25-8e226241df10_BrightBoom_JinMa_960.jpeg?auto=compress,format",
    "https://images.prismic.io/practice-1378/fa186987-d3ce-476b-b1cc-18cab2893209_ESO_Magnetar_480.jpeg?auto=compress,format",
    "https://images.prismic.io/practice-1378/af02e388-93d1-405f-86b0-9c0200cd6558_Asassn15lh.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/3109b42f-4f55-4de1-91fa-40c734f88e62_ice-cream.png?auto=compress,format",
    "https://images.prismic.io/slicemachine-blank/76bc1e6e-67a0-41d9-9c3c-5a5d3161e6a9_bikini.png?auto=compress,format",
  ],
};
