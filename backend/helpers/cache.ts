const map = new Map();

class Cache {
  addAdmin(data: any) {
    map.set("admin", data);
  }
  getAdmin() {
    return map.get("admin");
  }
  removeAdmin() {
    map.delete("admin");
  }
  clearCache() {
    map.clear();
  }
  addParticipant(key: string, data: any) {
    map.set(key, data);
  }
  removeParticipant(key: string, data: any) {
    map.set(key, data);
  }
  removeParticipants() {
    const admin = map.get("admin");
    map.clear();
    map.set("admin", admin);
  }
}

export default new Cache();
