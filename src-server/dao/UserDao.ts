import { IDao } from "./DaoTypes";
import { MemoryDao } from "./MemoryDao";

export class UserDao {
  private static _dao: IDao;

  public static setInstance(dao: IDao) {
    if (dao && !this._dao) return (this._dao = dao);
    throw new Error("Already exists dao instance");
  }

  public static getInstance() {
    if (!this._dao) this._dao = new MemoryDao();
    return this._dao;
  }
}
