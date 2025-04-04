export type Contact = { id: string; username: string; group: boolean };

function storeContact(contact: Contact) {
  localStorage.setItem("selectedContact", JSON.stringify(contact));
}

function getStoredContact() {
  const storedContact = localStorage.getItem("selectedContact");
  return storedContact ? JSON.parse(storedContact) : null;
}

function clearStoredContact() {
  localStorage.removeItem("selectedContact");
}

export default { storeContact, getStoredContact, clearStoredContact };
