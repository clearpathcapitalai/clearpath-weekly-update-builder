// localStorage history of generated weekly updates.
(function () {
  const KEY = "cp_weekly_history_v1";
  const LAST = "cp_weekly_last_v1";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }
  function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  function saveEntry(entry) {
    const list = read();
    list.unshift({ ...entry, id: Date.now() + "_" + Math.random().toString(36).slice(2,8) });
    while (list.length > 30) list.pop();
    write(list);
    localStorage.setItem(LAST, JSON.stringify(entry));
    return list;
  }
  function deleteEntry(id) {
    write(read().filter(x => x.id !== id));
    return read();
  }
  function clearAll() { write([]); }
  function getLast() {
    try { return JSON.parse(localStorage.getItem(LAST) || "null"); }
    catch { return null; }
  }
  function setLast(entry) { localStorage.setItem(LAST, JSON.stringify(entry)); }

  window.cpHistory = { read, saveEntry, deleteEntry, clearAll, getLast, setLast };
})();
