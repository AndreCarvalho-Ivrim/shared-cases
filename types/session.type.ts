import { AxiosResponse } from "axios";
import { Session, SessionType } from "../entities/Session";
import { ShortSession } from "../singleton/session";

export type PreDefinedApiFeedbacks = 'Invalid JWT token' | 'There is already another session'

export interface ISessionRepository {
  create(data: Omit<Session, "id" | "updated_at">): Promise<Session>,
  findAllSessionByUserId(user_id: string): Promise<Record<string, number | Session[]>>,
  findById(id: string): Promise<Session>,
  findByUserId(user_id: string): Promise<Session>,
  findLastActiveSessionOfUserId(user_id: string): Promise<Session>,
  update(id: string, data: Partial<SessionType>): Promise<Session>,
  delete(id: string): Promise<void>,
}

export interface ISessionSingletonRepository {
  checkActiveSession(currentSession: ShortSession): Promise<Session>,
  deleteCacheSession(userId: string, sessionId?: string): void,
  handleLastAccessOfSession(currentSession: ShortSession): Promise<void>,
  initiateSession(session: ShortSession): Promise<void>,
  disableSession(session: Session): Promise<void>,
}