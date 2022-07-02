const fs = require("fs");

// Membuat folder data jika folder tidak ada.
const dir = "./data";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Membuat file contacts.json jika file tidak ada.
const dataPath = "./data/contacts.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf8");
}

const loadContact = () => {
  const fileBuffer = fs.readFileSync("data/contacts.json", "utf-8");
  return JSON.parse(fileBuffer);
};

const findContact = (nama) => {
  const data = loadContact();

  const contact = data.find(
    (contact) => contact.nama.toLowerCase() === nama.toLowerCase()
  );

  return contact;
};

const saveContacts = (contacts) => {
  fs.writeFile("data/contacts.json", JSON.stringify(contacts), (err) => {
    if (err) throw err;
  });
};

const addContact = (field) => {
  const contacts = loadContact();
  contacts.push(field);
  saveContacts(contacts);
};

const checkDuplicate = (nama) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.nama === nama);
};

const deleteContact = (nama) => {
  const contacts = loadContact();
  const filteredContacts = contacts.filter((contact) => contact.nama !== nama);
  saveContacts(filteredContacts);
};

const updateContacts = (newContact) => {
  const contact = loadContact();
  const filteredContacts = contact.filter(
    (contact) => contact.nama !== newContact.oldNama
  );
  delete newContact.oldNama;

  filteredContacts.push(newContact);
  saveContacts(filteredContacts);
};

module.exports = {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
};
