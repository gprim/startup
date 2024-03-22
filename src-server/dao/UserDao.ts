import { IDao } from "./DaoTypes";
import { MemoryDao } from "./MemoryDao";

export class UserDao {
  private static _dao: IDao;

  public static getInstance() {
    if (!this._dao) this._dao = new MemoryDao();
    return this._dao;
  }
}
