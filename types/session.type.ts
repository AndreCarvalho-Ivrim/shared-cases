import { Session, SessionType } from "../entities/Session";

export type PreDefinedApiFeedbacks = 'Invalid JWT token' | 'There is already another session'

export interface ISessionRepository {
  create(data: Omit<Session, "id" | "updated_at">): Promise<Session>,
  findAllSessionByUserId(user_id: string): Promise<Array<Session>>,
  findById(id: string): Promise<Session>,
  findByUserId(user_id: string): Promise<Session>,
  findLastActiveSessionOfUserId(user_id: string): Promise<Session>,
  update(id: string, data: Partial<SessionType>): Promise<Session>,
  delete(id: string): Promise<void>,
}

export interface ISessionSingletonRepository {
  create(): void,
  find(): void,
  remove(): void,
}