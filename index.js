const express = require("express");
const app = express();
const port = 3000;
const hbs = require("hbs");
const {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

app.set("view engine", "hbs");
app.engine("html", hbs.__express);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Konfig flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

hbs.registerPartials(__dirname + "/views/partials", (err) => {
  if (err) console.log(err);
});

hbs.registerHelper("no", (value) => value + 1);

hbs.registerHelper("old", (value) => value.oldNama || value.nama);

hbs.registerHelper("match", (req, uri) => (req === uri ? "active" : ""));

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    uri: req.url,
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Me",
    uri: req.url,
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();
  res.render("contact", {
    title: "Contacts List",
    contacts,
    msg: req.flash("msg"),
    uri: req.url,
  });
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", { title: "Add Contact" });
});

app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplicate = checkDuplicate(value);
      if (duplicate) throw new Error("Nama sudah digunakan!");
      return true;
    }),
    body("email", "Email tidak valid").isEmail(),
    body("nohp", "Nomor HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Add Contact",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      req.flash("msg", "Kontak berhasil ditambah!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  // jika contact tidak ada
  if (!contact) {
    res.status(404).setHeader("Content-Type", "text/html").send("<h1>404</h1>");
  } else {
    deleteContact(req.params.nama);
    req.flash("msg", "Kontak berhasil dihapus!");
    res.redirect("/contact");
  }
});

app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("edit-contact", { title: "Edit Contact", contact });
});

app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplicate = checkDuplicate(value);
      if (value !== req.body.oldNama && duplicate)
        throw new Error("Nama sudah digunakan!");
      return true;
    }),
    body("email", "Email tidak valid").isEmail(),
    body("nohp", "Nomor HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Edit Contact",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      req.flash("msg", "Kontak berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("detail", { title: "Detail Contacts", contact });
});

app.use("/", (req, res, next) => {
  res.setHeader("Content-Type", "text/html");
  res.status(404);
  res.send("<h1>404</h1>");
  res.end();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
