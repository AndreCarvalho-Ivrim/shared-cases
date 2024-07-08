import moment from "moment";

import { ISessionRepository } from "../types/session.type";
import { Session } from "../entities/Session";
import { PreDefinedApiFeedbacks } from "../types/session.type";

export interface ShortSession{
  user_id: string,
  ip: string,
  device: string,
  city?: string,
  state?: string,
  country?: string,
}

export class SingletonSessionRepository{
  private static instance: SingletonSessionRepository;
  private loggedSessions: Record<string, Session>;
  private sessionExpireMinutes: number = 3; 

  private constructor(
    private sessionRepo: ISessionRepository
  ) {
    this.loggedSessions = { };
  }

  public static getInstance(sessionRepo: ISessionRepository): SingletonSessionRepository {
    if (!SingletonSessionRepository.instance) {
      SingletonSessionRepository.instance = new SingletonSessionRepository(sessionRepo);
    }
    return SingletonSessionRepository.instance;
  }

  public async checkActiveSession(currentSession: ShortSession): Promise<Session> {    
    let startedSession: Session | undefined = this.loggedSessions[currentSession.user_id]

    if (!startedSession) {
      const existsSession = await this.sessionRepo.findLastActiveSessionOfUserId(currentSession.user_id);
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
      const expiredSession = differenceMinutes(startedSession.last_access) <= (Number(this.sessionExpireMinutes) * 3);
      if(changedState) startedSession = { ...startedSession, ...currentSession };
      if(expiredSession) throw new Error("There is already another session" as PreDefinedApiFeedbacks);
      else {
        await this.disableSession(startedSession)
        return;
      }
    }
    return startedSession;
  }

  public async handleLastAccessOfSession(
    currentSession: Session,
  ){
    const difference = differenceMinutes(currentSession.last_access);
    if(difference >= this.sessionExpireMinutes){
      const updatedSession = await this.sessionRepo.update(
        currentSession.id, 
        { 
          last_access: new Date(),
          device: currentSession.device 
        }
      )
      
      this.loggedSessions[currentSession.user_id] = updatedSession;
    }
  }

  public async initiateSession(session: ShortSession){
    const now = new Date();
    const createdSession: Session = await this.sessionRepo.create({
      ...session,
      session_start_date: now,
      last_access: now,
      active: true,
      created_at: now,
    });
    
    this.loggedSessions[session.user_id] = createdSession;
  }

  public async disableSession(session: Session){
    await this.sessionRepo.update(session.id, { active: false });
    delete this.loggedSessions[session.user_id];
  }
}


export const differenceMinutes = (hour: Date): number => {
  const now = moment();
  const normalizedHour = moment(hour, "YYYY-MM-DD hh:mm:ss");
  return now.diff(normalizedHour, "minutes");  
}