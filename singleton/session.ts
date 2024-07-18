import "moment-timezone";

import { ISessionApi, ISessionRepository, ISessionSingletonRepository } from "../types/session.type";
import { Session } from "../entities/Session";
import { PreDefinedApiFeedbacks } from "../types/session.type";
import { convertDate, differenceMinutes } from "../utils/date";

export interface ShortSession{
  user_id: string,
  ip: string,
  device: string,
  city?: string,
  state?: string,
  country?: string,
}

export class SingletonSessionRepository implements ISessionSingletonRepository {
  private static instance: SingletonSessionRepository;
  private loggedSessions: Record<string, Session>;
  private now = convertDate(this.application, new Date());
  private sessionExpireMinutes: number = 3; 
  private sessionExpireMinutesByLastAccess: number = 3; 

  private constructor(
    private application: string,
    private sessionRepo: ISessionRepository,
    private api: ISessionApi
  ) {
    this.loggedSessions = { };
  }

  public static getInstance(
    application: string,
    sessionRepo: ISessionRepository,
    api: ISessionApi
  ): SingletonSessionRepository {
    if (!SingletonSessionRepository.instance) {
      SingletonSessionRepository.instance = new SingletonSessionRepository(application, sessionRepo, api);
    }
    return SingletonSessionRepository.instance;
  }

  public async checkActiveSession(currentSession: ShortSession): Promise<Session> {    
    let startedSession: Session | undefined = this.loggedSessions[currentSession.user_id]
    const existsSession = await this.sessionRepo.findLastActiveSessionOfUserId(currentSession.user_id);

    if (
      startedSession &&
      existsSession &&
      startedSession.updated_at !== existsSession.updated_at
    ) {
      this.loggedSessions[currentSession.user_id] = existsSession;
      startedSession = existsSession;
    }
    if (!startedSession) {
      if(!existsSession) return;

      this.loggedSessions[currentSession.user_id] = existsSession;
      startedSession = existsSession;
    }
    
    let changedState = false; 
    for (const key in startedSession) {
      const comparedKeys = ['device'];
      if (comparedKeys.includes(key)) {
        if ((startedSession[key] !== currentSession[key]) === true)
          changedState = true;
      };
      continue;
    }
    if(changedState || startedSession.ip !== currentSession.ip){
      const expiredSession = differenceMinutes(this.application, startedSession.last_access) <= (Number(this.sessionExpireMinutes) * 3);
      if(changedState) startedSession = { ...startedSession, ...currentSession };
      if(expiredSession) throw new Error("There is already another session" as PreDefinedApiFeedbacks);
      else {
        await this.disableSession(startedSession)
        return;
      }
    }
    return startedSession;
  }

  public updateCacheSession(userId: string): void {
    if(this.loggedSessions[userId]) {
      delete this.loggedSessions[userId];
    };
  }

  public async handleLastAccessOfSession(
    currentSession: Session,
  ){
    const difference = differenceMinutes(this.application, currentSession.last_access);
    if(difference >= this.sessionExpireMinutesByLastAccess) {
      if(this.loggedSessions[currentSession.user_id].updated_at !== this.now) {
        const updatedSession = await this.sessionRepo.update(
          currentSession.id, 
          { 
            last_access: this.now,
            updated_at: this.now,
            device: currentSession.device 
          }
        )
        
        this.loggedSessions[currentSession.user_id] = updatedSession;
        await this.api.sendUpdateCacheSession(updatedSession.user_id, true); 
      }
    }
  }

  public async initiateSession(session: ShortSession){
    const createdSession: Session = await this.sessionRepo.create({
      ...session,
      session_start_date: this.now,
      last_access: this.now,
      active: true,
      created_at: this.now,
    });
    
    this.loggedSessions[session.user_id] = createdSession;
  }

  public async disableSession(session: Session){
    await this.sessionRepo.update(session.id, { active: false });
    delete this.loggedSessions[session.user_id];
  }
}